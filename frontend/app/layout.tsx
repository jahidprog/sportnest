import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SportNest — Premium Sportswear & Apparel",
  description: "Premium sportswear & apparel manufacturer and supplier.",
};

// Deliberately minimal — just html/body/fonts. Storefront chrome (header,
// footer, cart drawer) lives in app/(storefront)/layout.tsx, scoped only
// to that route group, so /admin doesn't inherit it. See that file and
// app/admin/layout.tsx for why this split exists.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
