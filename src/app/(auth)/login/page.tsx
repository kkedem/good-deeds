"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Api, ApiError } from "@/lib/client/api";
import { showToast } from "@/lib/client/format";
import { useSession } from "@/lib/client/session";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errEmail, setErrEmail] = useState<React.ReactNode>(null);
  const [errPassword, setErrPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrEmail(null);
    setErrPassword("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrEmail("Please enter your email");
      return;
    }
    if (!password) {
      setErrPassword("Please enter your password");
      return;
    }

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
      } else {
        showToast(err instanceof Error ? err.message : "Something went wrong");
      }
    }
  }

  return (
    <div className="screen">
      <h1>Good Deeds 💚</h1>
      <p className="subtitle">Find local good deeds, log your hours, earn rewards.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            type="email"
            id="login-email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="field-error">{errEmail}</div>
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            type="password"
            id="login-password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="field-error">{errPassword}</div>
        </div>
        <button type="submit" className="btn btn-primary">
          Log in
        </button>
      </form>
      <div className="skip-link">
        New here? <Link href="/signup">Sign up</Link>
      </div>

      <div className="demo-note" style={{ marginTop: 28 }}>
        Demo accounts: maya@example.com (volunteer), sam16@example.com (volunteer), dave@example.com (poster),
        sam45@example.com (poster). Any password works.
      </div>
    </div>
  );
}
