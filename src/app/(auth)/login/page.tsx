"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, XCircle } from "lucide-react";
import { Api, ApiError } from "@/lib/client/api";
import { showToast } from "@/lib/client/format";
import { useSession } from "@/lib/client/session";
import "./login.css";

const DEMO_ACCOUNTS = [
  { email: "maya@example.com", name: "Maya", role: "volunteer" },
  { email: "sam16@example.com", name: "Sam (16)", role: "volunteer" },
  { email: "dave@example.com", name: "Dave", role: "poster" },
  { email: "sam45@example.com", name: "Sam (45)", role: "poster" },
];

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errEmail, setErrEmail] = useState<React.ReactNode>(null);
  const [errPassword, setErrPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrEmail(null);
    setErrPassword("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrEmail("Please enter your email");
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setErrPassword("Please enter your password");
      passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const { user } = await Api.login(trimmedEmail, password);
      setUser(user);
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/find");
    } catch (err) {
      if (err instanceof ApiError && err.data.error === "not_found") {
        setErrEmail(
          <>
            We couldn&apos;t find an account with that email. <Link href="/signup">Sign up</Link>
          </>,
        );
        emailRef.current?.focus();
      } else {
        showToast(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("demo");
    setErrEmail(null);
    setErrPassword("");
  }

  return (
    <div className="login">
      <div className="login-navbar">
        <Link href="/" className="login-back">
          <ChevronLeft size={24} aria-hidden="true" />
          Back
        </Link>
      </div>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Log in to see your good deeds, hours and points.</p>

        <div className="login-fields">
          <div>
            <label className="login-label" htmlFor="login-email">
              Email
            </label>
            <input
              ref={emailRef}
              className="login-input"
              type="email"
              id="login-email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errEmail ? true : undefined}
              aria-describedby={errEmail ? "login-email-err" : undefined}
            />
            {errEmail && (
              <div className="login-error" id="login-email-err">
                <XCircle size={16} aria-hidden="true" />
                <span>{errEmail}</span>
              </div>
            )}
          </div>

          <div>
            <label className="login-label" htmlFor="login-password">
              Password
            </label>
            <input
              ref={passwordRef}
              className="login-input"
              type="password"
              id="login-password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={errPassword ? true : undefined}
              aria-describedby={errPassword ? "login-password-err" : "login-password-hint"}
            />
            {errPassword ? (
              <div className="login-error" id="login-password-err">
                <XCircle size={16} aria-hidden="true" />
                <span>{errPassword}</span>
              </div>
            ) : (
              <p className="login-hint" id="login-password-hint">
                Demo only – passwords are never stored.
              </p>
            )}
          </div>
        </div>

        <div className="login-demo">
          <p className="login-eyebrow">Demo accounts</p>
          <div className="login-demo-chips">
            {DEMO_ACCOUNTS.map((a) => (
              <button key={a.email} type="button" className="login-chip" onClick={() => fillDemo(a.email)}>
                {a.name}
                <span className="login-chip-role">· {a.role}</span>
              </button>
            ))}
          </div>
          <p className="login-demo-note">
            Demo accounts: maya@example.com (volunteer), sam16@example.com (volunteer), dave@example.com (poster),
            sam45@example.com (poster). Any password works.
          </p>
        </div>

        <div className="login-actions">
          <button type="submit" className="cg-btn cg-btn--primary cg-btn--lg" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </button>
          <p className="login-switch">
            New here? <Link href="/signup">Sign up</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
