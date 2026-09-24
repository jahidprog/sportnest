import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import BannerPopup from "@/components/storefront/BannerPopup";

// Scoped to the (storefront) route group only — admin routes are a
// sibling of this group, so they render under the root layout directly
// without any of this storefront chrome.
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <CartDrawer />
      <BannerPopup />
      <main>{children}</main>
      <Footer />
    </>
  );
}
