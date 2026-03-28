import type { IRecipe, MenuDay, AggregatedIngredient } from "@/types";

const UNIT_ALIASES: Record<string, string> = {
  gram: "g", grams: "g",
  kilogram: "kg", kilograms: "kg",
  milliliter: "ml", milliliters: "ml", millilitre: "ml", millilitres: "ml",
  liter: "l", liters: "l", litre: "l", litres: "l",
  tablespoon: "tbsp", tablespoons: "tbsp",
  teaspoon: "tsp", teaspoons: "tsp",
  cup: "cup", cups: "cup",
  ounce: "oz", ounces: "oz",
  pound: "lb", pounds: "lb",
  piece: "piece", pieces: "piece",
  slice: "slice", slices: "slice",
  clove: "clove", cloves: "clove",
  pinch: "pinch", pinches: "pinch",
  bunch: "bunch", bunches: "bunch",
  can: "can", cans: "can",
  package: "package", packages: "package",
};

function normalizeUnit(unit: string): string {
  const key = unit.toLowerCase().trim();
  return UNIT_ALIASES[key] ?? key;
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/s$/, "");
}

export function aggregateIngredients(
  days: MenuDay[],
  recipeMap: Map<string, IRecipe>
): AggregatedIngredient[] {
  const map = new Map<string, AggregatedIngredient>();

  for (const day of days) {
    for (const meal of day.meals) {
      const recipe = recipeMap.get(meal.recipeId.toString());
      if (!recipe) continue;

      const ratio = meal.servings / recipe.servings;

      for (const ingredient of recipe.ingredients) {
        const normName = normalizeName(ingredient.name);
        const normUnit = normalizeUnit(ingredient.unit);
        const key = `${normName}::${normUnit}`;
        const scaledAmount = ingredient.amount * ratio;

        const existing = map.get(key);
        if (existing) {
          existing.totalAmount += scaledAmount;
        } else {
          map.set(key, {
            name: normName,
            totalAmount: scaledAmount,
            unit: normUnit,
            checked: false,
          });
        }
      }
    }
  }

  for (const item of map.values()) {
    item.totalAmount = Math.round(item.totalAmount * 100) / 100;
  }

  return [...map.values()].sort((a, b) =>
    a.name.localeCompare(b.name) || a.unit.localeCompare(b.unit)
  );
}
