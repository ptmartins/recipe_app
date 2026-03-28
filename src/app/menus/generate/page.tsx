import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import { GenerateMenuForm } from "@/components/menus/GenerateMenuForm";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Generate Menu" };

export default function GenerateMenuPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/menus">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to menus
        </Link>
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-3xl font-display font-bold">Generate Menu</h1>
        </div>
        <p className="text-muted-foreground">
          We will automatically select recipes from your collection and create a balanced meal plan with a full shopping list.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <GenerateMenuForm />
      </div>
    </div>
  );
}
