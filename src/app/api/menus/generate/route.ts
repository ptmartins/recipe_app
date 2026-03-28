import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";
import { generateMenuDays } from "@/lib/generateMenu";
import { generateMenuSchema } from "@/lib/validations/menu.schema";
import { getMenuDays } from "@/lib/utils";

// POST /api/menus/generate
export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const parsed = generateMenuSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.errors }, { status: 400 });
    }

    const { name, type, startDate: startDateStr, mealsPerDay, filters } = parsed.data;

    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
    }

    const numDays = getMenuDays(type);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + numDays - 1);

    const { days, shoppingList } = await generateMenuDays({
      type,
      startDate,
      mealsPerDay,
      filters,
    });

    const menu = await Menu.create({
      name,
      type,
      startDate,
      endDate,
      days,
      shoppingList,
    });

    return NextResponse.json({ menu }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate menu";
    console.error("POST /api/menus/generate error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
