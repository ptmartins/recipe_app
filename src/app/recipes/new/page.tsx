import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "New Recipe" };

export default function NewRecipePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/recipes">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to recipes
        </Link>
      </Button>
      <h1 className="text-3xl font-display font-bold mb-8">New Recipe</h1>
      <RecipeForm />
    </div>
  );
}
