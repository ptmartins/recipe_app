"use client";
import type { IRecipe } from "@/types";
import { RecipeCard } from "./RecipeCard";
import { EmptyState } from "@/components/common/EmptyState";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RecipeGridProps {
  recipes: IRecipe[];
}

export function RecipeGrid({ recipes }: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-8 w-8" />}
        title="No recipes found"
        description="Try adjusting your filters or search terms, or be the first to add a recipe."
        action={
          <Button asChild>
            <Link href="/recipes/new">Add Your First Recipe</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe, i) => (
        <RecipeCard key={recipe._id} recipe={recipe} index={i} />
      ))}
    </div>
  );
}
