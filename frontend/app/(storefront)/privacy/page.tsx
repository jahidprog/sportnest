import { InfoPage } from "@/components/storefront/InfoPage";

export default function PrivacyPage() {
  return <InfoPage eyebrow="Last updated: August 2026" title="PRIVACY POLICY" intro="This is a launch-ready policy outline. It must be reviewed against the final hosting, analytics, payment, and support tools used by SportNest." sections={[
    { heading: "INFORMATION WE USE", body: "To process orders and support customers, we use information you provide such as your name, email address, phone number, delivery address, and order details." },
    { heading: "WHY WE USE IT", body: "We use this information to provide the store, confirm and deliver orders, respond to support requests, prevent fraud, and improve our service." },
    { heading: "SHARING & SECURITY", body: "We only share information with service providers needed to operate the store and deliver orders, or when required by law. Access should be limited to people who need it." },
    { heading: "YOUR CHOICES", body: "You can ask to access, correct, or delete your personal information, subject to legal and operational requirements. Contact support with the email address used for your order." },
  ]} />;
}
