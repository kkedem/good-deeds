"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, MapPin, Sparkle, TreePine, Zap } from "lucide-react";
import { useSession } from "@/lib/client/session";

const FEATURES = [
  { icon: TreePine, text: "Beach cleans, litter picks, food banks, dog walks and more" },
  { icon: Zap, text: "Many take an hour or two – no long-term commitment" },
  { icon: Gift, text: "10 points for every confirmed hour, to spend locally" },
];

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("/find");
  }, [loading, user, router]);

  if (loading || user) return null;

  return (
    <div className="landing">
      <div className="landing-wordmark">
        <span className="landing-wordmark-icon" aria-hidden="true">
          <Sparkle size={16} fill="currentColor" />
        </span>
        Good Deeds
      </div>

      <div className="landing-hero">
        <div className="landing-hero-beach">
          <Image
            src="https://images.unsplash.com/photo-1616680214084-22670de1bc82?auto=format&fit=crop&w=900&q=70"
            alt="Volunteers with rubbish bags on a beach"
            fill
            sizes="(max-width: 480px) 60vw, 288px"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
        <div className="landing-hero-small">
          <Image
            src="https://images.unsplash.com/photo-1544928938-6852c1925194?auto=format&fit=crop&w=900&q=70"
            alt="Two people holding spades"
            fill
            sizes="(max-width: 480px) 40vw, 192px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="landing-hero-small">
          <Image
            src="https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?auto=format&fit=crop&w=900&q=70"
            alt="Volunteers sorting tins at a food bank"
            fill
            sizes="(max-width: 480px) 40vw, 192px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <span className="landing-hero-pill">
          <MapPin size={16} aria-hidden="true" /> Live in Brighton &amp; Hove
        </span>
      </div>

      <div className="landing-body">
        <h1 className="landing-headline">Good deeds, close to home.</h1>
        <p className="landing-subcopy">
          Find a local good deed that fits your time, join in one tap, and get recognised for
          every hour you give.
        </p>
        <ul className="landing-features">
          {FEATURES.map((f) => (
            <li className="landing-feature" key={f.text}>
              <span className="landing-feature-icon" aria-hidden="true">
                <f.icon size={18} />
              </span>
              {f.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="landing-actions">
        <Link href="/signup" className="cg-btn cg-btn--primary cg-btn--lg">
          Get started <ArrowRight size={20} aria-hidden="true" />
        </Link>
        <Link href="/login" className="cg-btn cg-btn--secondary cg-btn--lg">
          I already have an account
        </Link>
        <Link href="/find" className="cg-btn cg-btn--ghost">
          Have a look around first
        </Link>
      </div>
    </div>
  );
}
