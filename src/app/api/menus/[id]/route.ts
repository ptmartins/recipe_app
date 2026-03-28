import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";
import Recipe from "@/models/Recipe";
import { aggregateIngredients } from "@/lib/aggregateIngredients";
import type { IRecipe } from "@/types";

// GET /api/menus/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const menu = await Menu.findById(id).lean();
  if (!menu) return NextResponse.json({ error: "Menu not found" }, { status: 404 });
  return NextResponse.json({ menu });
}

// PUT /api/menus/[id] — rename or swap a meal slot
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const menu = await Menu.findById(id);
  if (!menu) return NextResponse.json({ error: "Menu not found" }, { status: 404 });

  const body = await req.json();

  if (body.name) {
    menu.name = body.name;
  }

  // Swap recipe in a specific meal slot
  if (body.dayIndex !== undefined && body.mealType && body.recipeId) {
    const day = menu.days[body.dayIndex];
    if (!day) return NextResponse.json({ error: "Day not found" }, { status: 400 });

    const mealIndex = day.meals.findIndex((m) => m.type === body.mealType);
    if (mealIndex === -1) return NextResponse.json({ error: "Meal slot not found" }, { status: 400 });

    const recipe = await Recipe.findById(body.recipeId).lean() as IRecipe | null;
    if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

    day.meals[mealIndex] = {
      type: body.mealType,
      recipeId: new (require("mongoose").Types.ObjectId)(recipe._id),
      recipeTitle: recipe.title,
      recipeThumbnail: recipe.thumbnail.url,
      servings: recipe.servings,
    };

    // Recompute shopping list
    const recipeIds = [
      ...new Set(menu.days.flatMap((d) => d.meals.map((m) => m.recipeId.toString()))),
    ];
    const recipes = await Recipe.find({ _id: { $in: recipeIds } }).lean();
    const recipeMap = new Map<string, IRecipe>(
      (recipes as unknown as IRecipe[]).map((r) => [r._id.toString(), r])
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menu.shoppingList = aggregateIngredients(menu.days as any, recipeMap) as any;
  }

  await menu.save();
  return NextResponse.json({ menu });
}

// DELETE /api/menus/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const menu = await Menu.findByIdAndDelete(id);
  if (!menu) return NextResponse.json({ error: "Menu not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
