import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Youtube,
  Music2,
  Twitter,
} from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/constants";

const K20_LABS_LINK =
  "https://www.facebook.com/profile.php?id=61593360331585";

// TODO: replace with your actual SportNest Facebook page URL.
const FACEBOOK_LINK = "#";

// TODO: replace with your real support number.
const SUPPORT_PHONE = "+8809677666888";

// TODO: replace with SportNest's real Facebook follower/following counts,
// or fetch these dynamically via the Facebook Graph API if you want them live.
const FACEBOOK_FOLLOWERS = "937K";
const FACEBOOK_FOLLOWING = "1";

const SOCIAL_LINKS = [
  { name: "Instagram", href: "#", icon: Instagram },
  { name: "TikTok", href: "#", icon: Music2 },
  { name: "Facebook", href: FACEBOOK_LINK, icon: Facebook },
  { name: "X", href: "#", icon: Twitter },
  { name: "YouTube", href: "#", icon: Youtube },
];

export default function Footer() {
  return (
    <footer className="mt-24 text-chalk">
      {/* ==================== MAIN FOOTER ==================== */}
      <div className="bg-[#58595b]">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-14">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.45fr_1fr] lg:gap-16">
            {/* ==================== BRAND + LINKS ==================== */}
            <div className="flex flex-col">
              <div className="relative mb-8 h-14 w-44">
                <Image
                  src="/logo.png"
                  alt="SportNest"
                  fill
                  className="object-contain object-left brightness-0 invert"
                />
              </div>

              <nav>
                <ul className="space-y-3 text-[15px]">
                  <li>
                    <Link
                      href="/about"
                      className="transition-colors hover:text-[#f5a623]"
                    >
                      About SportNest
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/products"
                      className="transition-colors hover:text-[#f5a623]"
                    >
                      All Products
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/terms"
                      className="transition-colors hover:text-[#f5a623]"
                    >
                      Terms & Conditions
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/privacy"
                      className="transition-colors hover:text-[#f5a623]"
                    >
                      Privacy Policy
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/returns"
                      className="transition-colors hover:text-[#f5a623]"
                    >
                      Cancellation & Return Policy
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/faqs"
                      className="transition-colors hover:text-[#f5a623]"
                    >
                      FAQs
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/contact"
                      className="transition-colors hover:text-[#f5a623]"
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* ==================== NEWSLETTER + CONTACT ==================== */}
            <div>
              {/* Newsletter */}
              <div className="mb-12">
                <div className="mb-6 flex items-center gap-3">
                  <Mail
                    size={23}
                    strokeWidth={2}
                    className="text-[#f5a623]"
                  />

                  <h3 className="text-[16px] font-semibold uppercase tracking-wide">
                    Get special discounts in your inbox
                  </h3>
                </div>

                <form className="flex w-full">
                  <input
                    type="email"
                    placeholder="Enter email to get offers, discounts and more."
                    aria-label="Email address"
                    className="min-w-0 flex-1 border-b border-white/80 bg-transparent px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/40 focus:border-[#f5a623]"
                  />

                  <button
                    type="submit"
                    className="shrink-0 bg-[#f5a623] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#e69513]"
                  >
                    Subscribe
                  </button>
                </form>
              </div>

              {/* Help */}
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <Phone
                    size={21}
                    strokeWidth={2}
                    className="text-[#f5a623]"
                  />

                  <h3 className="text-[16px] font-semibold uppercase tracking-wide">
                    For any help you may call us at
                  </h3>
                </div>

                <div className="pl-8">
                  <a
                    href={`tel:${SUPPORT_PHONE}`}
                    className="text-[17px] font-medium text-white transition-colors hover:text-[#f5a623]"
                  >
                    {SUPPORT_PHONE}
                  </a>

                  <p className="mt-1 text-[15px] text-white/60">
                    Customer Service
                  </p>
                  <p className="text-[15px] text-white/60">
                    Track your order or get help returning an order
                  </p>

                  {/* Keep WhatsApp as a secondary channel */}
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-4 inline-flex items-center gap-2 text-[14px] text-white/60 transition-colors hover:text-[#f5a623]"
                  >
                    <MessageCircle
                      size={16}
                      className="text-[#f5a623] transition-transform group-hover:scale-110"
                    />
                    <span>Or chat with us on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* ==================== SOCIAL ==================== */}
            <div>
              {/* Heading */}
              <div className="mb-7 flex items-center gap-3">
                <span className="text-2xl font-bold leading-none text-[#f5a623]">
                  ✓
                </span>

                <h3 className="text-[16px] font-semibold uppercase tracking-wide">
                  Follow us
                </h3>
              </div>

              {/* Description */}
              <p className="mb-7 max-w-sm text-[15px] leading-6 text-white/80">
                Stay updated on our latest arrivals, exclusive promotions and
                events.
              </p>

              {/* Social Icons */}
              <div className="mb-9 flex items-center gap-6">
                {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="text-white transition-colors hover:text-[#f5a623]"
                  >
                    <Icon size={26} strokeWidth={2} />
                  </a>
                ))}

                <a
                  href="#"
                  aria-label="Pinterest"
                  className="text-white transition-colors hover:text-[#f5a623]"
                >
                  <span className="font-serif text-[26px] leading-none">
                    ℘
                  </span>
                </a>
              </div>

              {/* ==================== FACEBOOK CARD ==================== */}
              {/* Structure/classes mirror Fabrilife's markup; styled purely with
                  Tailwind (no styled-jsx) so this stays usable in a Server Component. */}
              <a
                href={FACEBOOK_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="fb-verify-card flex w-[320px] items-center gap-[10px] rounded-[10px] bg-[#FFFFFFCC] text-[#050505]"
                style={{
                  height: "67.09px",
                  margin: "16px 0px",
                  padding: "12px 14px",
                  fontFamily:
                    'Assistant, -apple-system, "system-ui", sans-serif',
                }}
              >
                <div className="fb-verify-left flex shrink-0">
                  {/* FB app shape */}
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect width="24" height="24" rx="6" fill="#1877F2" />
                    <path
                      d="M16.671 15.469l.532-3.469h-3.328v-2.25c0-.949.465-1.875 1.956-1.875h1.513V4.922S15.978 4.688 14.674 4.688c-2.726 0-4.51 1.653-4.51 4.646V12h-3.032v3.469h3.032V24h3.729v-8.531h2.778z"
                      fill="#fff"
                    />
                  </svg>
                </div>

                <div className="fb-verify-right min-w-0 flex-1">
                  <div className="fb-verify-title flex items-center gap-1.5 text-[16px] font-bold leading-tight">
                    SportNest
                    <span
                      className="fb-badge flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: "#0275D8" }}
                      aria-label="Verified"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      >
                        <path
                          d="M5 12.5 9.2 17 19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div
                      className="fb-verify-subtitle text-[14.4px] font-semibold"
                      style={{ color: "#0275D8" }}
                    >
                      Follow
                    </div>
                  </div>

                  <div
                    className="fb-verify-sub mt-0.5 flex items-center gap-1.5 text-[13px]"
                    style={{ color: "#666" }}
                  >
                    {FACEBOOK_FOLLOWERS} followers{" "}
                    <span
                      className="fb-follow-i inline-block h-[3px] w-[3px] shrink-0 rounded-full"
                      style={{ backgroundColor: "#666" }}
                      aria-hidden="true"
                    />{" "}
                    {FACEBOOK_FOLLOWING} following
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== BOTTOM FOOTER ==================== */}
      <div className="bg-[#f5f5f5] text-[#555]">
        <div className="mx-auto max-w-7xl px-6 py-7 lg:px-10">
          <p className="text-center text-sm font-medium sm:text-[15px]">
            Your order is handled daily with a lot of{" "}
            <span className="text-red-500">♥</span> and delivered worldwide!
          </p>

          <div className="mt-5 flex flex-col items-center justify-center gap-2 text-xs text-[#aaa] sm:flex-row sm:gap-3">
            <span>
              © {new Date().getFullYear()} SportNest. All Rights Reserved.
            </span>

            <span className="hidden sm:inline">•</span>

            <span>
              Developed by{" "}
              <a
                href={K20_LABS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#777] transition-colors hover:text-[#f5a623]"
              >
                K20 Labs
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* ==================== FLOATING WHATSAPP BUTTON ==================== */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#2196f3] text-white shadow-lg shadow-black/20 transition-all hover:scale-105 hover:bg-[#1688e5]"
      >
        <MessageCircle size={29} strokeWidth={1.8} />
      </a>
    </footer>
  );
}