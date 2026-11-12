/** Photos for opportunities. Seed rows carry their own image_url; anything without one falls back to its category. */

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

export const CATEGORY_IMAGES: Record<string, string> = {
  litter_picking: unsplash("photo-1758599668429-121d54188b9c"),
  graffiti_removal: unsplash("photo-1582144503536-8b7465bc07b3"),
  beach_cleaning: unsplash("photo-1610093674388-cee0337f2684"),
  greening: unsplash("photo-1551855350-c86caeaf8707"),
  food_banks: unsplash("photo-1593113646773-028c64a8f1b8"),
  animal_welfare: unsplash("photo-1768752926303-4a1771f1cce0"),
  school_tech_support: unsplash("photo-1555436169-20e93ea9a7ff"),
  skill_swap: unsplash("photo-1791298043001-d6488112d8da"),
};

const DEFAULT_IMAGE = CATEGORY_IMAGES.beach_cleaning;

export function opportunityImage(opp: { image_url?: string; category?: string }): string {
  return opp.image_url || CATEGORY_IMAGES[opp.category || ""] || DEFAULT_IMAGE;
}
