import { InfoPage } from "@/components/storefront/InfoPage";

export default function ReturnsPage() {
  return <InfoPage eyebrow="Shop with confidence" title="RETURNS & CANCELLATIONS" intro="We want you to feel confident ordering from SportNest. Contact us promptly if there is an issue with your order." sections={[
    { heading: "CANCELLATIONS", body: "Request a cancellation before dispatch by contacting customer support with your order number. We cannot guarantee cancellation after processing has begun." },
    { heading: "EXCHANGES & RETURNS", body: "Eligible items may be exchanged within 7 days of delivery when unused, unworn, and returned with original tags and packaging. Please contact support before sending anything back." },
    { heading: "DAMAGED OR INCORRECT ITEMS", body: "Tell us within 48 hours of delivery and include your order number and clear photos of the issue. We will review the case and advise the next step." },
    { heading: "IMPORTANT", body: "This page is customer guidance, not a substitute for a final approved retail policy. Before launch, confirm the exact eligibility, shipping fees, and refund terms with your operations and legal teams." },
  ]} />;
}
