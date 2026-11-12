"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Shield } from "lucide-react";
import "../signup/signup.css";

const POINTS = [
  "Sign-up details you enter are stored only in a local demo file and are not used for anything else.",
  "ID verification is simulated — no photo is uploaded or stored.",
  "Points and rewards are not real and cannot be redeemed with actual businesses.",
  "You must be 16 or over to create an account.",
];

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="signup">
      <div className="signup-nav">
        <button type="button" className="signup-nav-btn" onClick={() => router.back()}>
          <ChevronLeft size={24} aria-hidden="true" />
          Back
        </button>
      </div>

      <div className="signup-body">
        <h1 className="signup-title">Terms &amp; Conditions</h1>

        <div className="signup-terms">
          <p className="signup-terms-note">
            <strong>Good Deeds – hackathon demo.</strong> This is a demonstration app built for a hackathon. All data
            is fictional. No real identity checks, payments or business redemptions take place.
          </p>
          <p className="signup-sub" style={{ margin: 0 }}>
            By using this demo you understand that:
          </p>
          <ul className="signup-terms-list">
            {POINTS.map((point) => (
              <li key={point} className="signup-rule">
                <Shield size={20} aria-hidden="true" />
                <p className="signup-rule-body" style={{ margin: 0 }}>
                  {point}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="signup-actions">
          <button type="button" className="cg-btn cg-btn--secondary cg-btn--lg" onClick={() => router.back()}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
