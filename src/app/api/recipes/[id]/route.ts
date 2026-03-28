import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import Menu from "@/models/Menu";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { recipeSchema } from "@/lib/validations/recipe.schema";
import Busboy from "busboy";

// GET /api/recipes/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const recipe = await Recipe.findById(id).lean();
  if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  return NextResponse.json({ recipe });
}

// PUT /api/recipes/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;

  const existing = await Recipe.findById(id);
  if (!existing) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let data: Record<string, unknown> = {};
    let newFile: Buffer | null = null;

    if (contentType.includes("multipart/form-data")) {
      const { fields, file } = await parseMultipart(req);
      newFile = file;
      data = {
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
    } else {
      data = await req.json();
    }

    const parsed = recipeSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.errors }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = { ...parsed.data };

    if (newFile) {
      await deleteImage(existing.thumbnail.publicId);
      const { url, publicId } = await uploadImage(newFile);
      update.thumbnail = { url, publicId };
    }

    const recipe = await Recipe.findByIdAndUpdate(id, update, { new: true });
    return NextResponse.json({ recipe });
  } catch (err) {
    console.error("PUT /api/recipes/[id] error:", err);
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }
}

// DELETE /api/recipes/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;

  const recipe = await Recipe.findById(id);
  if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

  try {
    // Remove from menus
    await Menu.updateMany({}, { $pull: { "days.$[].meals": { recipeId: id } } });
    // Delete image
    await deleteImage(recipe.thumbnail.publicId);
    // Delete recipe
    await Recipe.findByIdAndDelete(id);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/recipes/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }
}

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
      stream.on("end", () => { fileBuffer = Buffer.concat(chunks); });
    });

    busboy.on("field", (name, value) => { fields[name] = value; });
    busboy.on("finish", () => resolve({ fields, file: fileBuffer }));
    busboy.on("error", reject);

    busboy.write(bodyBuffer);
    busboy.end();
  });
}
