"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { IRecipe, MealType } from "@/types";
import { formatTime } from "@/lib/utils";

interface SwapRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (recipeId: string) => void;
  mealType?: MealType;
  loading?: boolean;
}

export function SwapRecipeDialog({ open, onOpenChange, onSelect, mealType, loading }: SwapRecipeDialogProps) {
  const [recipes, setRecipes] = useState<IRecipe[]>([]);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFetching(true);
    const params = new URLSearchParams({ limit: "50" });
    if (mealType) params.set("suitableFor", mealType);
    if (search) params.set("search", search);
    fetch(`/api/recipes?${params}`)
      .then((r) => r.json())
      .then((d) => setRecipes(d.recipes ?? []))
      .finally(() => setFetching(false));
  }, [open, mealType, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Swap Recipe</DialogTitle>
          <DialogDescription>
            Choose a replacement recipe{mealType ? ` for ${mealType}` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {fetching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recipes.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No recipes found</p>
          ) : (
            recipes.map((recipe) => (
              <button
                key={recipe._id}
                onClick={() => onSelect(recipe._id)}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-muted transition-colors text-left disabled:opacity-50"
              >
                <div className="relative h-12 w-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                  <Image src={recipe.thumbnail.url} alt={recipe.title} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{recipe.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(recipe.estimatedTime)} · {recipe.difficulty}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
