# SportNest — frontend

Next.js 14 (App Router) + TypeScript + Tailwind. Storefront + a full
`/admin` dashboard, both connected to the real `backend-go-fixed` API.

## Run it

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Backend must be running first, migrated through `000005-create-banners`.

## Architecture

```
app/
  layout.tsx                  ROOT layout — deliberately minimal (html/body/fonts only)
  (storefront)/                route group: storefront pages + chrome, doesn't affect URLs
    layout.tsx                   Header + Footer + CartDrawer + BannerPopup
    page.tsx, products/, cart/, login/, signup/, orders/
  admin/                       sibling of (storefront) — does NOT inherit its chrome
    layout.tsx                   auth guard (is_shop_owner) + AdminSidebar
    page.tsx                     overview: stat cards, stock alerts, recent orders
    products/                    list, new, [id]/edit
    categories/                  list + inline create
    orders/                      list, filter by status, expand for line items, update status
    banners/                     list with active toggle, new, [id]/edit
    users/                       list, promote/demote admin status (self-demotion blocked)
    reports/                     monthly/yearly PDF sales report generator
  error.tsx, not-found.tsx     global fallbacks (apply to both groups)

components/
  ui/                          Button, Input, Textarea, Badge, Skeleton, OrderStatusBadge
                                (OrderStatusBadge lives here, not admin/, since both the
                                customer order history page and the admin orders page use it)
  layout/                      Header, Footer (storefront only)
  product/                     ProductCard
  cart/                        CartDrawer
  storefront/                  BannerPopup — the promotional popup feature
  admin/                       AdminSidebar, StatCard, OrderStatusBadge,
                                AdminPageHeader, ProductForm, BannerForm

lib/
  api/                         client.ts (core fetch, knows the backend's raw
                                response shape), products/categories/auth/orders/
                                banners.ts (domain calls, admin ones take accessToken)
  store/                       cart-store.ts (per-user scoped), auth-store.ts
  types/index.ts                every shared type, matching the backend field-for-field
  utils/format.ts, report.ts    formatPrice/effectivePrice, PDF report generation
  constants.ts
```

## Why `/admin` is a route-group sibling, not nested under storefront

This mattered enough to restructure mid-project: `app/(storefront)/layout.tsx`
wraps only the storefront pages (the parens mean the folder name doesn't
appear in the URL — `/products` still works). `app/admin/layout.tsx` is a
**sibling** of that group, not a child, so it renders under the plain root
layout with its own sidebar instead of inheriting the storefront's header/
footer/cart drawer. Verified directly: `curl /admin` contains no storefront
chrome, `curl /` does.

## Admin auth guard

`app/admin/layout.tsx` checks `useAuth`'s `user.is_shop_owner` and redirects
non-admins. **This is a UX convenience, not the security boundary** — it's
client-side JS, trivially bypassed by anyone editing devtools. Every admin
API call is independently checked by the backend's `AdminOnly` middleware,
which is the real boundary. The frontend guard exists so a non-admin
doesn't see admin screens flash by before a request fails; it changes
nothing about what a request can actually do.

## Banner popups (the promotional feature)

- Admins manage banners at `/admin/banners` — create multiple, each with
  its own `is_active` toggle and an optional `starts_at`/`ends_at` window.
- The backend (`GET /banners`, public) only returns banners that are both
  active AND currently within their date window — the popup component
  doesn't re-check dates client-side, it trusts what the backend sent.
- `components/storefront/BannerPopup.tsx` shows the newest one, once per
  browser session (`sessionStorage`), not on every navigation.

## PDF reports

`lib/utils/report.ts` generates monthly/yearly sales reports entirely
client-side from `GET /admin/orders` — no backend PDF endpoint needed. It
deliberately uses **only** `doc.text()` and `autoTable()` with trusted
server data (order totals, dates, product titles). jsPDF has known CVEs
across its published version range, but every one of them requires image
embedding, AcroForm fields, or `addJS` — none of which this report touches.
Worth knowing if you extend this file: adding an image (e.g. a logo) would
reintroduce that surface.

## Auth & cart (from earlier work, still true)

- Session persists via Zustand + localStorage (`lib/store/auth-store.ts`).
- Cart is scoped per logged-in user — logging out clears it, logging in as
  someone else starts fresh. See `cart-store.ts`'s `resetForUser`.
- Guests can't add to cart — redirected to `/login?redirect=<page>`,
  bounced back after signing in.

## UI redesign — carousels, animation, richer product views

The storefront visual layer got a full pass, inspired by a reference site
(ARJO) shared for the interaction patterns — not copied wholesale, and no
fabricated content (no fake star ratings, no stock photography standing
in for real products).

- **Hero carousel** (`components/storefront/HeroCarousel.tsx`) — a brand
  statement slide plus up to 2 real product spotlights, autoplaying via
  `embla-carousel-react`.
- **Why Embla, not Owl Carousel:** Owl Carousel is jQuery — it manipulates
  the DOM directly, which conflicts with React owning that same DOM. Embla
  is built for React (no jQuery dependency at all) and gets the same
  visual result (smooth drag/autoplay/dots).
- **`components/ui/Carousel.tsx`** — the reusable wrapper everything else
  builds on (dots, arrows, optional autoplay, optional overlay-positioned
  dots for full-bleed dark slides like the hero).
- **`components/ui/Reveal.tsx`** + `lib/hooks/useScrollReveal.ts` —
  IntersectionObserver-based fade/slide-in on scroll, respects
  `prefers-reduced-motion` (shows content immediately rather than
  animating, for anyone who's set that).
- **Recently Viewed** (`components/storefront/RecentlyViewed.tsx`,
  `lib/utils/recently-viewed.ts`) — real browsing history via
  `localStorage`, not fake "trending" data. Shows on the homepage and
  under every product detail page (excluding whatever you're currently
  looking at).
- **Category showcase tiles** — typography-driven (large ghost initial +
  category name), not stock photography, since there's no per-category
  image field in the schema. Honest to what's actually there.
- **"You Might Also Like"** on product detail — same-category products
  first, falls back to others so it's never empty on a small catalog.
- **`ProductCard`** — hover now reveals a sizes strip sliding up from the
  bottom, plus image zoom and shadow lift. No fake ratings/reviews added.
- **Deep-linkable category filter** — `/products?category=jerseys` now
  actually pre-filters (it silently didn't before this pass — the grid
  read only local state, never the URL). Worth knowing since the category
  tiles link there.
- **New logo** — swapped to the transparent PNG version across header and footer.

## Image upload

`components/admin/ImageUploadField.tsx` (used in both `ProductForm` and
`BannerForm`) uploads to `POST /admin/upload` on the backend, which:
- validates the file is actually an image by sniffing its bytes
  (`http.DetectContentType`), never trusting the client-supplied
  Content-Type header — tested directly with a file disguised as `.exe`,
  correctly rejected
- saves it under a random filename (never the client's original —
  avoids path traversal and collisions)
- returns a relative URL like `/uploads/xyz.png`

**Storage is local disk**, served by the same Go process
(`GET /uploads/*` in `rest/server.go`). That's the right call for a
single-server prototype — zero cloud credentials needed — but it means
uploaded files don't survive most container redeploys, and won't work
correctly with more than one server instance. Swap for S3/Cloudinary
before either becomes a real problem; the handler's return shape
(`{"url": "..."}`) stays the same either way.

**Frontend detail worth knowing:** the backend returns relative URLs
since it doesn't know its own public hostname. Every place a
product/banner image renders goes through `lib/utils/image.ts`'s
`resolveImageUrl()`, which prefixes relative paths with
`NEXT_PUBLIC_API_URL` — external URLs (still supported, paste one
directly into the same field) pass through untouched.

## Google Sign-In

**Backend** (`util/google_verify.go`) verifies Google ID tokens using
stdlib crypto only — no JWT library dependency, matching how this
codebase already hand-rolls its own session JWTs in `create_jwt.go`.
Fetches Google's public keys, verifies the RS256 signature, checks
issuer/audience/expiry. Verified two ways since this sandbox can't reach
`googleapis.com` (network allowlist): (1) confirmed the code fails
closed — with no network access it correctly refuses to verify anything
rather than silently trusting an unverified token, and (2) tested the
actual `rsa.VerifyPKCS1v15` cryptographic operation in isolation — valid
signatures accepted, tampered messages rejected, wrong-key signatures
rejected.

**Account linking:** signing in with Google checks three cases in order —
already linked, existing password account with the same verified email
(gets linked rather than duplicated), or brand new (created as a regular
customer, same as normal signup — Google sign-in can't grant admin any
more than password signup can).

**Frontend** (`components/auth/GoogleSignInButton.tsx`) uses Google's
real Identity Services button (not a custom-styled fake one), loaded via
`next/script`. Renders nothing if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` isn't
set — confirmed directly, the login/signup pages don't show a broken
"or" divider with nothing under it when Google isn't configured.

**To actually use it**, both env vars need the same Client ID:
- Backend `.env`: `GOOGLE_CLIENT_ID=...`
- Frontend `.env.local`: `NEXT_PUBLIC_GOOGLE_CLIENT_ID=...`

Get one from Google Cloud Console → APIs & Services → Credentials →
OAuth Client ID (Web application), with `http://localhost:3000` (and
your real domain later) added under Authorized JavaScript origins.

## What's NOT done yet

- No pagination anywhere — fine at current catalog/order size, will need
  it once either grows large.
- Product ratings/reviews — explicitly deferred, no fake rating data
  added in the meantime.
