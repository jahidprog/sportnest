"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { GOOGLE_CLIENT_ID } from "@/lib/constants";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const setSession = useAuth((s) => s.setSession);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token, user } = await login({ email, password });
      setSession(access_token, user);
      router.push(redirectTo);
    } catch (err) {
      // The backend deliberately returns the same message for "no such
      // email" and "wrong password" — don't override that here, it's a
      // real security choice, not a bug.
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-4xl tracking-tightest text-ink mb-2">
        SIGN IN
      </h1>
      <p className="text-sm text-ink-60 mb-8">
        New here?{" "}
        <Link
          href={`/signup${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="text-amber-dim font-medium hover:underline"
        >
          Create an account
        </Link>
      </p>

      {error && (
        <div className="mb-6 px-4 py-3 bg-crest/10 border border-crest/30 text-sm text-crest">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" size="lg" disabled={loading} className="w-full mt-2">
          {loading ? "SIGNING IN..." : "SIGN IN"}
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
