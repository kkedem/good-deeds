"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" aria-label="Back" onClick={() => router.back()}>
          ←
        </button>
        <h1 style={{ flex: 1, textAlign: "center" }}>Terms &amp; Conditions</h1>
        <span style={{ width: 28 }}></span>
      </div>
      <div className="card">
        <p>
          <strong>Good Deeds – hackathon demo.</strong> This is a demonstration app built for a hackathon. All data
          is fictional. No real identity checks, payments or business redemptions take place.
        </p>
        <p>By using this demo you understand that:</p>
        <ul>
          <li>Sign-up details you enter are stored only in a local demo file and are not used for anything else.</li>
          <li>ID verification is simulated — no photo is uploaded or stored.</li>
          <li>Points and rewards are not real and cannot be redeemed with actual businesses.</li>
          <li>You must be 16 or over to create an account.</li>
        </ul>
      </div>
      <button className="btn btn-secondary" onClick={() => router.back()}>
        Back
      </button>
    </div>
  );
}
