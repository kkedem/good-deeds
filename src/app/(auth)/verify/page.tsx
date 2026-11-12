"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Camera, CircleAlert, ImageIcon, Shield } from "lucide-react";
import { Api } from "@/lib/client/api";
import { useSession } from "@/lib/client/session";
import "../signup/signup.css";

type Stage = "choose" | "checking" | "done";

export default function VerifyPage() {
  const router = useRouter();
  const { user, setUser } = useSession();
  const [stage, setStage] = useState<Stage>("choose");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function startChecking() {
    // NFR-06: the chosen image is never read, displayed or uploaded.
    if (fileInputRef.current) fileInputRef.current.value = "";
    setStage("checking");
    setTimeout(async () => {
      if (user) {
        try {
          const { user: updated } = await Api.verify(user.id);
          setUser(updated);
        } catch {
          // demo: ignore
        }
      }
      setStage("done");
    }, 2000);
  }

  if (stage === "checking") {
    return (
      <div className="signup">
        <div className="signup-centre" role="status" aria-live="polite">
          <span className="signup-circle signup-circle--lg signup-circle--pulse" aria-hidden="true">
            <Shield size={40} />
          </span>
          <h2 className="signup-centre-title signup-centre-title--sm">Checking your ID…</h2>
          <p className="signup-centre-body">This takes a couple of seconds.</p>
        </div>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="signup">
        <div className="signup-centre" role="status" aria-live="polite">
          <span className="signup-circle signup-circle--lg signup-circle--signal" aria-hidden="true">
            <BadgeCheck size={48} />
          </span>
          <h2 className="signup-centre-title signup-centre-title--lg">You&apos;re verified ✓</h2>
          <p className="signup-centre-body">
            A Verified badge now shows on your profile, so organisers know you&apos;ve checked your ID.
          </p>
          <div className="signup-actions">
            <button type="button" className="cg-btn cg-btn--primary cg-btn--lg" onClick={() => router.push("/find")}>
              Find good deeds
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup">
      <div className="signup-body" style={{ paddingTop: 24 }}>
        <h1 className="signup-title">Verify your ID</h1>
        <p className="signup-sub">A Verified badge helps organisers trust who&apos;s coming. It&apos;s optional.</p>

        <div className="signup-banner">
          <CircleAlert size={18} aria-hidden="true" />
          <span>
            <strong>This is a demo.</strong> No real ID is checked, and your photo never leaves your phone or gets
            stored.
          </span>
        </div>

        <div className="signup-id-placeholder" aria-hidden="true">
          <ImageIcon size={40} />
          <span>Driving licence, passport or student ID</span>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="signup-hidden-input"
          tabIndex={-1}
          aria-hidden="true"
          onChange={startChecking}
        />

        <div className="signup-actions">
          <button type="button" className="cg-btn cg-btn--primary cg-btn--lg" onClick={startChecking}>
            <BadgeCheck size={20} aria-hidden="true" />
            Use demo ID
          </button>
          <button
            type="button"
            className="cg-btn cg-btn--secondary cg-btn--lg"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={20} aria-hidden="true" />
            Choose a photo
          </button>
          <button type="button" className="cg-btn cg-btn--ghost" onClick={() => router.push("/find")}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
