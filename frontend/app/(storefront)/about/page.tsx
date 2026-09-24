import { InfoPage } from "@/components/storefront/InfoPage";

export default function AboutPage() {
  return <InfoPage eyebrow="Built for movement" title="ABOUT SPORTNEST" intro="SportNest brings together practical performance wear and everyday comfort for people who stay in motion." sections={[
    { heading: "OUR APPROACH", body: "We focus on pieces that earn a place in your rotation: comfortable, useful, and easy to wear beyond the gym or pitch." },
    { heading: "SHOP WITH CONFIDENCE", body: "Every product page includes current pricing, available sizes, and stock status. If you need help before ordering, our support team is only a message away." },
    { heading: "DELIVERED ACROSS BANGLADESH", body: "Order online from anywhere in Bangladesh. Cash on delivery is available for eligible orders." },
  ]} />;
}
