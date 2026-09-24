import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/constants";

const K20_LABS_LINK = "https://www.facebook.com/profile.php?id=61593360331585";
const SUPPORT_PHONE = "+8801632773967";

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
                    01632-773967
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

            <div className="flex items-center">
              <p className="max-w-xs text-sm leading-7 text-white/70">
                Questions about an order? Call us or chat on WhatsApp and our
                customer service team will help.
              </p>
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
