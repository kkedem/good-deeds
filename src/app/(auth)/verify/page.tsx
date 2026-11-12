"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Api } from "@/lib/client/api";
import { useSession } from "@/lib/client/session";

type Stage = "choose" | "checking" | "done";

export default function VerifyPage() {
  const router = useRouter();
  const { user, setUser } = useSession();
  const [stage, setStage] = useState<Stage>("choose");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function startChecking() {
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

  return (
    <div className="screen">
      <h1>Verify your ID</h1>
      <p className="subtitle">
        This builds trust across the Good Deeds community. This is a demo — no real ID is checked or stored, and no
        image leaves your device.
      </p>

      <div className="card" style={{ textAlign: "center" }}>
        {stage === "choose" && (
          <>
            <p style={{ fontSize: "2.5rem", margin: "0 0 10px" }}>🪪</p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={startChecking}
            />
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              Choose a photo
            </button>
            <button className="btn btn-secondary" onClick={startChecking}>
              Use demo ID
            </button>
          </>
        )}
        {stage === "checking" && (
          <>
            <p style={{ fontSize: "2.5rem", margin: "0 0 10px" }}>⏳</p>
            <p>Checking your ID…</p>
          </>
        )}
        {stage === "done" && (
          <>
            <p style={{ fontSize: "2.5rem", margin: "0 0 10px" }}>✅</p>
            <p>You&apos;re verified ✓</p>
            <button className="btn btn-primary" onClick={() => router.push("/find")}>
              Continue
            </button>
          </>
        )}
      </div>

      {stage === "choose" && (
        <button className="btn btn-ghost" onClick={() => router.push("/find")}>
          Skip for now
        </button>
      )}
    </div>
  );
}
