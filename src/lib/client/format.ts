export function showToast(message: string, duration = 3000) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

export function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export const CATEGORY_ICONS: Record<string, string> = {
  litter_picking: "🧹",
  graffiti_removal: "🎨",
  beach_cleaning: "🏖️",
  greening: "🌱",
  food_banks: "🥫",
  animal_welfare: "🐾",
  school_tech_support: "💻",
  skill_swap: "🤝",
};

export function categoryIcon(cat: string): string {
  return CATEGORY_ICONS[cat] || "✅";
}

export function categoryLabel(cat: string): string {
  return cat
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export const SKILLS_LIST = ["Tech", "Gardening", "Cooking", "Driving", "Admin", "Teaching", "Animal care", "DIY"];
