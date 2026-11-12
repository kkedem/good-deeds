"use client";

import { ArrowLeftRight, Dog, Laptop, ShoppingBasket, Sparkles, SprayCan, Sprout, Trash2, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  litter_picking: Trash2,
  graffiti_removal: SprayCan,
  beach_cleaning: Waves,
  greening: Sprout,
  food_banks: ShoppingBasket,
  animal_welfare: Dog,
  school_tech_support: Laptop,
  skill_swap: ArrowLeftRight,
};

export default function CategoryBadge({ category, size = 40 }: { category: string; size?: number }) {
  const Icon = CATEGORY_ICON[category] ?? Sparkles;
  return (
    <span className="category-badge" style={{ width: size, height: size }} aria-hidden="true">
      <Icon size={Math.round(size * 0.5)} />
    </span>
  );
}
