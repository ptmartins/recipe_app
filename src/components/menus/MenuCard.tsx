"use client";
import Link from "next/link";
import { CalendarDays, Utensils, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import type { IMenu } from "@/types";
import { formatDate } from "@/lib/utils";

interface MenuCardProps {
  menu: IMenu;
  index?: number;
}

const menuTypeConfig = {
  weekly: { label: "Weekly", days: 7, color: "bg-violet-100 text-violet-800" },
  biweekly: { label: "Bi-Weekly", days: 14, color: "bg-blue-100 text-blue-800" },
  monthly: { label: "Monthly", days: 30, color: "bg-emerald-100 text-emerald-800" },
};

export function MenuCard({ menu, index = 0 }: MenuCardProps) {
  const config = menuTypeConfig[menu.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/menus/${menu._id}`} className="group block">
        <div className="rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {menu.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(menu.startDate)} – {formatDate(menu.endDate)}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${config.color}`}>
              {config.label}
            </span>
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {config.days} days
            </span>
            <span className="flex items-center gap-1.5">
              <Utensils className="h-4 w-4" />
              {menu.days?.reduce((acc, d) => acc + (d.meals?.length ?? 0), 0) ?? 0} meals
            </span>
            <span className="flex items-center gap-1.5">
              <ShoppingCart className="h-4 w-4" />
              {menu.shoppingList?.length ?? 0} items
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
