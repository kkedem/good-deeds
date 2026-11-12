"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Gift, PlusCircle, UserRound } from "lucide-react";
import "./bottom-nav.css";

const ITEMS = [
  { route: "find", icon: Compass, label: "Find" },
  { route: "post", icon: PlusCircle, label: "Post" },
  { route: "rewards", icon: Gift, label: "Rewards" },
  { route: "profile", icon: UserRound, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bnav" aria-label="Main">
      <ul className="bnav-list">
        {ITEMS.map((item) => {
          const active = pathname.startsWith(`/${item.route}`);
          const Icon = item.icon;
          return (
            <li key={item.route} className="bnav-item">
              <Link
                href={`/${item.route}`}
                className={`bnav-link${active ? " bnav-link--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="bnav-pill">
                  <Icon size={22} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                </span>
                <span className="bnav-label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
