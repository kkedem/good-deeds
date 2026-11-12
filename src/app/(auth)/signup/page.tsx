"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  Hand,
  Home,
  Info,
  Laptop,
  Lock,
  Shield,
  Sparkle,
  Sun,
  User,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Api, ApiError } from "@/lib/client/api";
import { showToast, SKILLS_LIST } from "@/lib/client/format";
import { useSession } from "@/lib/client/session";
import "./signup.css";

// Signup is steps 1–3; step 4 ("Verify ID") is the /verify page.
const TOTAL_STEPS = 4;
const STEP_NAMES = ["Your details", "Preferences", "Terms", "Verify ID"];

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

type PrefOption = { value: string; label: string; sub: string; icon: LucideIcon };

const WHERE_OPTIONS: PrefOption[] = [
  { value: "outdoor", label: "Outdoors", sub: "Parks, beach", icon: Sun },
  { value: "indoor", label: "Indoors", sub: "Halls, schools", icon: Home },
  { value: "either", label: "Either", sub: "Show me both", icon: Sparkle },
];

const TASK_OPTIONS: PrefOption[] = [
  { value: "manual", label: "Hands-on", sub: "Picking, planting", icon: Hand },
  { value: "non-manual", label: "Non-manual", sub: "Tech, walking", icon: Laptop },
  { value: "either", label: "Either", sub: "Happy with both", icon: Sparkle },
];

const COMPANY_OPTIONS: PrefOption[] = [
  { value: "group", label: "Group", sub: "Meet people", icon: Users },
  { value: "solo", label: "Solo", sub: "Just me", icon: User },
  { value: "either", label: "Either", sub: "No preference", icon: Sparkle },
];

const GROUND_RULES: [string, string][] = [
  ["Turn up, or cancel", "If plans change, cancel in the app so your space goes to someone else."],
  ["Be honest about hours", "Only tap “I’ve done it” for deeds you took part in. Organisers confirm hours."],
  ["Stay safe", "Follow the organiser’s safety briefing. Don’t do tasks you’re not comfortable with."],
  ["Be kind", "Treat volunteers, organisers and the people you help with respect."],
  ["Your data", "We keep your details for the demo only. Organisers see your first name, nothing else."],
];

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
  const focusDobRef = useRef(false);
  const dobRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, tooYoung]);

  useEffect(() => {
    if (!tooYoung && focusDobRef.current) {
      focusDobRef.current = false;
      dobRef.current?.focus();
    }
  }, [tooYoung]);

  function update<K extends keyof SignupData>(key: K, value: SignupData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function toggleSkill(skill: string) {
    setData((d) => ({
      ...d,
      skills: d.skills.includes(skill) ? d.skills.filter((s) => s !== skill) : [...d.skills, skill],
    }));
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
      <div className="signup">
        <div className="signup-centre" role="alert">
          <span className="signup-circle" aria-hidden="true">
            <Info size={36} />
          </span>
          <h1 className="signup-centre-title">You need to be 16 or over to volunteer with Good Deeds.</h1>
          <p className="signup-centre-body">
            Come back and join us when you turn 16! If you entered your date of birth by mistake, you can go back and
            change it.
          </p>
          <div className="signup-actions">
            <button
              type="button"
              className="cg-btn cg-btn--primary cg-btn--lg"
              onClick={() => {
                focusDobRef.current = true;
                setTooYoung(false);
              }}
            >
              Check my date of birth
            </button>
            <button type="button" className="cg-btn cg-btn--ghost cg-btn--lg" onClick={() => router.push("/login")}>
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup">
      <div className="signup-nav">
        <button type="button" className="signup-nav-btn" onClick={handleBack}>
          <ChevronLeft size={24} aria-hidden="true" />
          {step === 1 ? "Cancel" : "Back"}
        </button>
        {step === 2 && (
          <button type="button" className="signup-nav-btn signup-nav-btn--right" onClick={() => setStep(3)}>
            Skip
          </button>
        )}
      </div>

      <div className="signup-body">
        <div className="signup-progress-head">
          <span className="signup-eyebrow">
            Step {step} of {TOTAL_STEPS}
          </span>
          <span className="signup-progress-name">{STEP_NAMES[step - 1]}</span>
        </div>
        <div
          className="signup-progress"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step}
          aria-label={`Step ${step} of ${TOTAL_STEPS}`}
        >
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span key={i} className={`signup-progress-bar${i + 1 <= step ? " signup-progress-bar--done" : ""}`} />
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="signup-title">Let&apos;s get you set up</h1>
            <p className="signup-sub">It takes under a minute. Your postcode helps us show good deeds nearby.</p>

            <div className="signup-fields">
              <Field id="su-name" label="First name" error={errors.name}>
                <input
                  id="su-name"
                  className={`signup-input${errors.name ? " signup-input--error" : ""}`}
                  autoComplete="given-name"
                  value={data.first_name}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "su-name-error" : undefined}
                  onChange={(e) => update("first_name", e.target.value)}
                />
              </Field>
              <Field id="su-email" label="Email" error={errors.email}>
                <input
                  id="su-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className={`signup-input${errors.email ? " signup-input--error" : ""}`}
                  value={data.email}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "su-email-error" : undefined}
                  onChange={(e) => update("email", e.target.value)}
                />
              </Field>
              <Field id="su-password" label="Password" hint="Demo only – we never store passwords.">
                <input
                  id="su-password"
                  type="password"
                  autoComplete="new-password"
                  className="signup-input"
                  value={data.password}
                  aria-describedby="su-password-hint"
                  onChange={(e) => update("password", e.target.value)}
                />
              </Field>
              <Field
                id="su-dob"
                label="Date of birth"
                hint="You need to be 16 or over. We only use this to check your age."
                error={errors.dob}
              >
                <input
                  id="su-dob"
                  ref={dobRef}
                  type="date"
                  autoComplete="bday"
                  className={`signup-input${errors.dob ? " signup-input--error" : ""}`}
                  value={data.date_of_birth}
                  aria-invalid={!!errors.dob}
                  aria-describedby={errors.dob ? "su-dob-hint su-dob-error" : "su-dob-hint"}
                  onChange={(e) => update("date_of_birth", e.target.value)}
                />
              </Field>
              <Field
                id="su-postcode"
                label="Postcode"
                hint="Any UK postcode. Good deeds are currently in Brighton & Hove."
                error={errors.postcode}
              >
                <input
                  id="su-postcode"
                  autoComplete="postal-code"
                  placeholder="e.g. BN1 1AA"
                  className={`signup-input${errors.postcode ? " signup-input--error" : ""}`}
                  value={data.postcode}
                  aria-invalid={!!errors.postcode}
                  aria-describedby={errors.postcode ? "su-postcode-hint su-postcode-error" : "su-postcode-hint"}
                  onChange={(e) => update("postcode", e.target.value)}
                />
              </Field>
            </div>

            <p className="signup-privacy">
              <Lock size={16} aria-hidden="true" />
              <span>
                Organisers only see your first name when you join. Your email, date of birth and postcode stay with
                Good Deeds.
              </span>
            </p>

            <div className="signup-actions">
              <button type="button" className="cg-btn cg-btn--primary cg-btn--lg" onClick={handleStep1Next}>
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="signup-title">What suits you, {data.first_name || "there"}?</h1>
            <p className="signup-sub">
              We use these to pick &ldquo;Recommended for you&rdquo;. Skip anything – you can change it later in
              Profile.
            </p>

            <PrefGroup
              legend="Where do you like to help?"
              options={WHERE_OPTIONS}
              value={data.indoor_outdoor}
              onChange={(v) => update("indoor_outdoor", v)}
            />
            <PrefGroup
              legend="What kind of task?"
              options={TASK_OPTIONS}
              value={data.manual_pref}
              onChange={(v) => update("manual_pref", v)}
            />
            <PrefGroup
              legend="On your own or with others?"
              options={COMPANY_OPTIONS}
              value={data.solo_group}
              onChange={(v) => update("solo_group", v)}
            />

            <fieldset className="signup-pref">
              <legend className="signup-legend">Skills you could offer</legend>
              <p className="signup-pref-sub">Choose any. Most good deeds need no special skills.</p>
              <div className="signup-chips">
                {SKILLS_LIST.map((skill) => {
                  const on = data.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      aria-pressed={on}
                      className={`signup-chip${on ? " signup-chip--on" : ""}`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {on && <Check size={16} aria-hidden="true" />}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="signup-actions">
              <button type="button" className="cg-btn cg-btn--primary cg-btn--lg" onClick={() => setStep(3)}>
                Continue
              </button>
              <button type="button" className="cg-btn cg-btn--ghost" onClick={() => setStep(3)}>
                Skip for now
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="signup-title">A few ground rules</h1>
            <p className="signup-sub">The short version of our Terms &amp; Conditions.</p>

            <ul className="signup-rules">
              {GROUND_RULES.map(([title, body]) => (
                <li key={title} className="signup-rule">
                  <Shield size={20} aria-hidden="true" />
                  <div>
                    <p className="signup-rule-title">{title}</p>
                    <p className="signup-rule-body">{body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link href="/terms" className="signup-terms-link">
              Read the full Terms &amp; Conditions
            </Link>

            <label className="signup-accept">
              <input
                type="checkbox"
                checked={data.terms_accepted}
                onChange={(e) => update("terms_accepted", e.target.checked)}
              />
              <span className={`signup-checkbox${data.terms_accepted ? " signup-checkbox--on" : ""}`} aria-hidden="true">
                {data.terms_accepted && <Check size={16} strokeWidth={3} />}
              </span>
              <span className="signup-accept-label">I accept the Terms &amp; Conditions</span>
            </label>
          </>
        )}
      </div>

      {step === 3 && (
        <div className="signup-footer">
          <button
            type="button"
            className="cg-btn cg-btn--primary cg-btn--lg"
            disabled={!data.terms_accepted}
            onClick={handleCreate}
          >
            Create account
          </button>
          {!data.terms_accepted && (
            <p className="signup-footer-help">Tick the box above to create your account.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="signup-field">
      <label htmlFor={id} className="signup-label">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="signup-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="signup-error">
          <XCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

function PrefGroup({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: PrefOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="signup-pref">
      <legend className="signup-legend">{legend}</legend>
      <div className="signup-tiles" role="radiogroup" aria-label={legend}>
        {options.map(({ value: v, label, sub, icon: Icon }) => {
          const on = value === v;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={on}
              className={`signup-tile${on ? " signup-tile--on" : ""}`}
              onClick={() => onChange(v)}
            >
              <Icon size={24} aria-hidden="true" />
              <span>
                <span className="signup-tile-label">{label}</span>
                <span className="signup-tile-sub">{sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
