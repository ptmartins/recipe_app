import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CalendarDays, ShoppingCart, Trash2 } from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";
import type { IMenu } from "@/types";
import { formatDate, getMenuDays } from "@/lib/utils";
import { MenuCalendar } from "@/components/menus/MenuCalendar";
import { ShoppingList } from "@/components/menus/ShoppingList";
import { Button } from "@/components/ui/button";
import { DeleteMenuButton } from "./DeleteMenuButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectDB();
    const menu = await Menu.findById(id, { name: 1, type: 1 }).lean() as IMenu | null;
    return { title: menu ? menu.name : "Menu" };
  } catch {
    return { title: "Menu" };
  }
}

export default async function MenuDetailPage({ params }: PageProps) {
  const { id } = await params;
  await connectDB();
  const raw = await Menu.findById(id).lean();
  if (!raw) notFound();
  const menu: IMenu = JSON.parse(JSON.stringify(raw));

  const typeLabel = { weekly: "Weekly", biweekly: "Bi-Weekly", monthly: "Monthly" }[menu.type];
  const numDays = getMenuDays(menu.type);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/menus">
          <ChevronLeft className="h-4 w-4 mr-1" />
          All menus
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {typeLabel} · {numDays} days
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold">{menu.name}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {formatDate(menu.startDate)} – {formatDate(menu.endDate)}
          </p>
        </div>
        <DeleteMenuButton menuId={id} />
      </div>

      {/* Tabs: Calendar / Shopping List */}
      <div className="space-y-8">
        {/* Calendar */}
        <section>
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Meal Calendar
          </h2>
          <MenuCalendar menu={menu} />
        </section>

        {/* Shopping list */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-display font-semibold mb-5 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Shopping List
          </h2>
          {menu.shoppingList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ingredients found. Ensure recipes have ingredients added.</p>
          ) : (
            <ShoppingList items={menu.shoppingList} menuId={id} menuName={menu.name} />
          )}
        </section>
      </div>
    </div>
  );
}
