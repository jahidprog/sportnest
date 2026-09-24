import { InfoPage } from "@/components/storefront/InfoPage";

export default function TermsPage() {
  return <InfoPage eyebrow="Last updated: August 2026" title="TERMS OF SERVICE" intro="These terms explain the basics of using the SportNest store. They should be reviewed and approved by your business and legal team before launch." sections={[
    { heading: "ORDERS", body: "Submitting an order is a request to purchase. We may contact you to confirm order details, availability, delivery location, and payment method before accepting it." },
    { heading: "PRODUCT INFORMATION", body: "We work to keep prices, stock, sizing, and images accurate. Colours can vary by screen, and an item may become unavailable before an order is confirmed." },
    { heading: "USE OF THE SITE", body: "Use the store lawfully and provide accurate account and delivery information. Do not interfere with the site, attempt unauthorized access, or misuse another customer’s account." },
    { heading: "CONTACT", body: "For questions about an order or these terms, contact SportNest customer support before purchasing." },
  ]} />;
}
