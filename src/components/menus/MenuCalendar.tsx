"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RefreshCw, ChefHat } from "lucide-react";
import type { IMenu, MealType } from "@/types";
import { formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SwapRecipeDialog } from "./SwapRecipeDialog";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface MenuCalendarProps {
  menu: IMenu;
}

const mealColors: Record<MealType, string> = {
  breakfast: "bg-amber-50 border-amber-200 text-amber-800",
  lunch: "bg-sky-50 border-sky-200 text-sky-800",
  dinner: "bg-violet-50 border-violet-200 text-violet-800",
};

export function MenuCalendar({ menu }: MenuCalendarProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [swapTarget, setSwapTarget] = useState<{ dayIndex: number; mealType: MealType } | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwap = async (recipeId: string) => {
    if (!swapTarget) return;
    setIsSwapping(true);
    try {
      const res = await fetch(`/api/menus/${menu._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayIndex: swapTarget.dayIndex,
          mealType: swapTarget.mealType,
          recipeId,
        }),
      });
      if (!res.ok) throw new Error("Failed to swap recipe");
      toast({ title: "Recipe swapped!" });
      setSwapTarget(null);
      router.refresh();
    } catch {
      toast({ title: "Failed to swap recipe", variant: "destructive" });
    } finally {
      setIsSwapping(false);
    }
  };

  // Chunk days into weeks for display
  const weeks: typeof menu.days[] = [];
  for (let i = 0; i < menu.days.length; i += 7) {
    weeks.push(menu.days.slice(i, i + 7));
  }

  return (
    <>
      <div className="space-y-8">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex}>
            {menu.type !== "weekly" && (
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Week {weekIndex + 1}
              </h3>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {week.map((day) => (
                <div key={day.dayIndex} className="rounded-xl border bg-card overflow-hidden">
                  {/* Day header */}
                  <div className="px-3 py-2 bg-muted/50 border-b">
                    <p className="text-xs font-semibold text-foreground">{formatDateShort(day.date)}</p>
                  </div>

                  {/* Meals */}
                  <div className="p-2 space-y-2">
                    {day.meals.map((meal) => (
                      <div
                        key={meal.type}
                        className={`rounded-lg border p-2 ${mealColors[meal.type as MealType]}`}
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-1">
                          {meal.type}
                        </p>
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-1.5 bg-white/50">
                          <Image
                            src={meal.recipeThumbnail}
                            alt={meal.recipeTitle}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />
                        </div>
                        <p className="text-xs font-medium line-clamp-2 leading-tight">{meal.recipeTitle}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <Link
                            href={`/recipes/${meal.recipeId}`}
                            className="text-[10px] underline underline-offset-2 opacity-60 hover:opacity-100"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => setSwapTarget({ dayIndex: day.dayIndex, mealType: meal.type as MealType })}
                            className="flex items-center gap-0.5 text-[10px] opacity-60 hover:opacity-100 transition-opacity"
                          >
                            <RefreshCw className="h-2.5 w-2.5" />
                            Swap
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Swap dialog */}
      <SwapRecipeDialog
        open={!!swapTarget}
        onOpenChange={(o) => !o && setSwapTarget(null)}
        onSelect={handleSwap}
        mealType={swapTarget?.mealType}
        loading={isSwapping}
      />
    </>
  );
}
