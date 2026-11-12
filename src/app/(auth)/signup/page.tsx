"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChipGroup from "@/components/ChipGroup";
import { Api, ApiError } from "@/lib/client/api";
import { showToast, SKILLS_LIST } from "@/lib/client/format";
import { useSession } from "@/lib/client/session";

const TOTAL_STEPS = 3;

type SignupData = {
  first_name: string;
  email: string;
  date_of_birth: string;
  postcode: string;
  password: string;
  indoor_outdoor: string;
  manual_pref: string;
  skills: string[];
  solo_group: string;
  terms_accepted: boolean;
};

const INITIAL: SignupData = {
  first_name: "",
  email: "",
  date_of_birth: "",
  postcode: "",
  password: "",
  indoor_outdoor: "either",
  manual_pref: "either",
  skills: [],
  solo_group: "either",
  terms_accepted: false,
};

function calcAgeClient(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useSession();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<SignupData>(INITIAL);
  const [tooYoung, setTooYoung] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof SignupData>(key: K, value: SignupData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function handleBack() {
    if (step === 1) {
      router.push("/login");
      return;
    }
    setStep((s) => s - 1);
  }

  function handleStep1Next() {
    const nextErrors: Record<string, string> = {};
    if (!data.first_name.trim()) nextErrors.name = "Please enter your first name";
    if (!data.email.trim()) nextErrors.email = "Please enter your email";
    if (!data.date_of_birth) nextErrors.dob = "Please enter your date of birth";
    if (!data.postcode.trim()) {
      nextErrors.postcode = "Please enter your postcode";
    } else if (!/^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/i.test(data.postcode.trim())) {
      nextErrors.postcode = "Please enter a valid UK postcode";
    }

    if (data.date_of_birth) {
      const age = calcAgeClient(data.date_of_birth);
      if (age < 16) {
        setTooYoung(true);
        return;
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setData((d) => ({ ...d, first_name: d.first_name.trim(), email: d.email.trim(), postcode: d.postcode.trim() }));
    setStep(2);
  }

  async function handleCreate() {
    try {
      const { user } = await Api.signup(data);
      setUser(user);
      setData(INITIAL);
      router.push("/verify");
    } catch (err) {
      if (err instanceof ApiError && err.data.error === "exists") {
        showToast("You already have an account");
        router.push("/login");
      } else {
        showToast(err instanceof Error ? err.message : "Something went wrong");
      }
    }
  }

  if (tooYoung) {
    return (
      <div className="screen">
        <h1>Not quite yet</h1>
        <p className="subtitle">
          You need to be 16 or over to volunteer with Good Deeds. Come back and join us when you turn 16!
        </p>
        <button className="btn btn-secondary" onClick={() => router.push("/login")}>
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" aria-label="Back" onClick={handleBack}>
          ←
        </button>
        <h1 style={{ flex: 1, textAlign: "center" }}>Sign up</h1>
        <span style={{ width: 28 }}></span>
      </div>

      <div className="progress-label">
        Step {step} of {TOTAL_STEPS}
      </div>
      <div className="progress">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div key={i} className={`progress-step${i + 1 <= step ? " done" : ""}`} />
        ))}
      </div>

      {step === 1 && (
        <>
          <div className="field">
            <label htmlFor="su-name">First name</label>
            <input id="su-name" value={data.first_name} onChange={(e) => update("first_name", e.target.value)} />
            <div className="field-error">{errors.name}</div>
          </div>
          <div className="field">
            <label htmlFor="su-email">Email</label>
            <input id="su-email" type="email" value={data.email} onChange={(e) => update("email", e.target.value)} />
            <div className="field-error">{errors.email}</div>
          </div>
          <div className="field">
            <label htmlFor="su-dob">Date of birth</label>
            <input
              id="su-dob"
              type="date"
              value={data.date_of_birth}
              onChange={(e) => update("date_of_birth", e.target.value)}
            />
            <div className="field-error">{errors.dob}</div>
          </div>
          <div className="field">
            <label htmlFor="su-postcode">Postcode</label>
            <input
              id="su-postcode"
              placeholder="e.g. BN1 1AA"
              value={data.postcode}
              onChange={(e) => update("postcode", e.target.value)}
            />
            <div className="field-error">{errors.postcode}</div>
          </div>
          <div className="field">
            <label htmlFor="su-password">Password</label>
            <input
              id="su-password"
              type="password"
              autoComplete="new-password"
              value={data.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleStep1Next}>
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="field">
            <label>Indoor or outdoor?</label>
            <ChipGroup
              options={["indoor", "outdoor", "either"]}
              value={data.indoor_outdoor}
              onChange={(v) => update("indoor_outdoor", v as string)}
            />
          </div>
          <div className="field">
            <label>Manual or non-manual?</label>
            <ChipGroup
              options={["manual", "non-manual", "either"]}
              value={data.manual_pref}
              onChange={(v) => update("manual_pref", v as string)}
            />
          </div>
          <div className="field">
            <label>Skills (optional)</label>
            <ChipGroup options={SKILLS_LIST} value={data.skills} onChange={(v) => update("skills", v as string[])} multi />
          </div>
          <div className="field">
            <label>Solo or group?</label>
            <ChipGroup
              options={["solo", "group", "either"]}
              value={data.solo_group}
              onChange={(v) => update("solo_group", v as string)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setStep(3)}>
            Continue
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => setStep(3)}>
            Skip for now
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <div className="card">
            <p>
              By creating an account you agree to the Good Deeds{" "}
              <Link href="/terms">Terms &amp; Conditions</Link>. This is a hackathon demo — no real data is verified
              or shared.
            </p>
          </div>
          <div className="field">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={data.terms_accepted}
                onChange={(e) => update("terms_accepted", e.target.checked)}
              />
              <span>I accept the Terms &amp; Conditions</span>
            </label>
          </div>
          <button className="btn btn-primary" disabled={!data.terms_accepted} onClick={handleCreate}>
            Create account
          </button>
        </>
      )}
    </div>
  );
}
