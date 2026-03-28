import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import { uploadImage } from "@/lib/cloudinary";
import { uniqueSlug } from "@/lib/slugify";
import { recipeSchema } from "@/lib/validations/recipe.schema";
import Busboy from "busboy";

export const config = { api: { bodyParser: false } };

// GET /api/recipes — paginated, filtered list
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const maxTime = searchParams.get("maxTime");
  const tags = searchParams.get("tags") ?? "";
  const suitableFor = searchParams.get("suitableFor") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10)));
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};
  if (search) query.$text = { $search: search };
  if (category) query.categories = { $in: [category] };
  if (difficulty) query.difficulty = difficulty;
  if (maxTime) query.estimatedTime = { $lte: parseInt(maxTime, 10) };
  if (tags) query.tags = { $in: tags.split(",").map((t) => t.trim()) };
  if (suitableFor) query.suitableFor = { $in: [suitableFor] };

  const [recipes, total] = await Promise.all([
    Recipe.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Recipe.countDocuments(query),
  ]);

  return NextResponse.json({
    recipes,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/recipes — create new recipe (multipart/form-data)
export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { fields, file } = await parseMultipart(req);

    // Parse JSON fields
    const data = {
      title: fields.title,
      description: fields.description,
      ingredients: JSON.parse(fields.ingredients ?? "[]"),
      steps: JSON.parse(fields.steps ?? "[]"),
      estimatedTime: parseInt(fields.estimatedTime ?? "0", 10),
      difficulty: fields.difficulty,
      categories: JSON.parse(fields.categories ?? "[]"),
      servings: parseInt(fields.servings ?? "1", 10),
      tags: JSON.parse(fields.tags ?? "[]"),
      suitableFor: JSON.parse(fields.suitableFor ?? "[]"),
    };

    const parsed = recipeSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.errors }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "Thumbnail image is required" }, { status: 400 });
    }

    const { url, publicId } = await uploadImage(file);

    const slug = await uniqueSlug(parsed.data.title, async (s) => {
      const exists = await Recipe.findOne({ slug: s });
      return !!exists;
    });

    const recipe = await Recipe.create({
      ...parsed.data,
      thumbnail: { url, publicId },
      slug,
    });

    return NextResponse.json({ recipe }, { status: 201 });
  } catch (err) {
    console.error("POST /api/recipes error:", err);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}

// Helper: parse multipart form data
async function parseMultipart(req: NextRequest): Promise<{
  fields: Record<string, string>;
  file: Buffer | null;
}> {
  const chunks: Buffer[] = [];
  const fields: Record<string, string> = {};

  const contentType = req.headers.get("content-type") ?? "";
  const body = await req.arrayBuffer();
  const bodyBuffer = Buffer.from(body);

  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: { "content-type": contentType } });
    let fileBuffer: Buffer | null = null;

    busboy.on("file", (_fieldname, stream) => {
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    busboy.on("finish", () => resolve({ fields, file: fileBuffer }));
    busboy.on("error", reject);

    busboy.write(bodyBuffer);
    busboy.end();
  });
}
