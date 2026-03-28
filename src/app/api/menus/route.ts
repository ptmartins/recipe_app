import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";

// GET /api/menus — paginated menu list
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

  const [menus, total] = await Promise.all([
    Menu.find({}, { days: 0, shoppingList: 0 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Menu.countDocuments(),
  ]);

  return NextResponse.json({
    menus,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
