"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { googleLogin } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { GOOGLE_CLIENT_ID } from "@/lib/constants";

// Google's Identity Services library isn't an npm package — it's loaded
// as a global via <script>, so TypeScript needs to be told it exists.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
            }
          ) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        setError(null);
        try {
          const { access_token, user } = await googleLogin(response.credential);
          setSession(access_token, user);
          router.push(redirectTo);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Google sign-in failed.");
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
    });
  }, [scriptLoaded, redirectTo, router, setSession]);

  // Quietly renders nothing if this isn't configured — the rest of auth
  // (email/password) works fine without Google Sign-In set up, and a
  // half-broken button would be worse than no button.
  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={buttonRef} />
      {error && <p className="mt-2 text-xs text-crest">{error}</p>}
    </div>
  );
}
