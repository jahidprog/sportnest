"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signup, login } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { GOOGLE_CLIENT_ID } from "@/lib/constants";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const setSession = useAuth((s) => s.setSession);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // Signup on the backend only creates the account — it doesn't return
      // a session token. Log in immediately after so the person doesn't
      // have to type their password twice.
      await signup({ first_name: firstName, last_name: lastName, email, password });
      const { access_token, user } = await login({ email, password });
      setSession(access_token, user);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-4xl tracking-tightest text-ink mb-2">
        CREATE ACCOUNT
      </h1>
      <p className="text-sm text-ink-60 mb-8">
        Already have one?{" "}
        <Link
          href={`/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="text-amber-dim font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>

      {error && (
        <div className="mb-6 px-4 py-3 bg-crest/10 border border-crest/30 text-sm text-crest">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="firstName"
            label="First name"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            id="lastName"
            label="Last name"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <Input
          id="email"
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <Input
            id="password"
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-ink-60">At least 8 characters.</p>
        </div>

        <Button type="submit" size="lg" disabled={loading} className="w-full mt-2">
          {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
        </Button>
      </form>

      {GOOGLE_CLIENT_ID && (
        <>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-ink/10" />
            <span className="text-xs font-mono uppercase tracking-widest2 text-ink-60">or</span>
            <div className="flex-1 h-px bg-ink/10" />
          </div>

          <div className="flex justify-center">
            <GoogleSignInButton redirectTo={redirectTo} />
          </div>
        </>
      )}
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
