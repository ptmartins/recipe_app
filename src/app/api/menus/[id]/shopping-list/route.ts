import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";

// GET /api/menus/[id]/shopping-list
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const menu = await Menu.findById(id, { name: 1, shoppingList: 1, createdAt: 1 }).lean();
  if (!menu) return NextResponse.json({ error: "Menu not found" }, { status: 404 });
  return NextResponse.json({
    items: menu.shoppingList,
    menuName: menu.name,
    generatedAt: (menu as unknown as { createdAt: Date }).createdAt,
  });
}

// PATCH /api/menus/[id]/shopping-list — toggle checked state
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const { itemIndex, checked } = await req.json();

  const menu = await Menu.findById(id);
  if (!menu) return NextResponse.json({ error: "Menu not found" }, { status: 404 });

  if (itemIndex === undefined || typeof checked !== "boolean") {
    return NextResponse.json({ error: "itemIndex and checked are required" }, { status: 400 });
  }

  if (itemIndex < 0 || itemIndex >= menu.shoppingList.length) {
    return NextResponse.json({ error: "Item index out of bounds" }, { status: 400 });
  }

  menu.shoppingList[itemIndex].checked = checked;
  await menu.save();

  return NextResponse.json({ item: menu.shoppingList[itemIndex] });
}
