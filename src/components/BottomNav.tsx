"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { route: "find", icon: "🧭", label: "Find" },
  { route: "post", icon: "➕", label: "Post" },
  { route: "rewards", icon: "🎁", label: "Rewards" },
  { route: "profile", icon: "👤", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <Link
          key={item.route}
          href={`/${item.route}`}
          className={`nav-btn${pathname.startsWith(`/${item.route}`) ? " active" : ""}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
