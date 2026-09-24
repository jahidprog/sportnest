// Single source of truth for config that would otherwise be duplicated
// (or worse, hardcoded differently) across multiple files.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// wa.me expects an international number without a leading + or local trunk 0.
export const WHATSAPP_NUMBER = "8801632773967";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export const LOW_STOCK_THRESHOLD = 5;

// Empty string if unset — GoogleSignInButton checks this and quietly
// renders nothing rather than showing a broken button, so this is safe
// to leave unconfigured during local dev.
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
