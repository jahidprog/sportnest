import { InfoPage } from "@/components/storefront/InfoPage";

export default function FaqsPage() {
  return <InfoPage eyebrow="Help centre" title="FREQUENTLY ASKED QUESTIONS" intro="Quick answers for shopping with SportNest." sections={[
    { heading: "HOW DO I PLACE AN ORDER?", body: "Choose a size, add the item to your bag, and enter your delivery details at checkout. We will confirm the order using the phone number you provide." },
    { heading: "WHAT PAYMENT METHODS DO YOU ACCEPT?", body: "Cash on delivery is available. Payment instructions, if any, will always be clearly communicated before your order is confirmed." },
    { heading: "HOW DO I CHOOSE A SIZE?", body: "Use the size chart on the product page. If you are between sizes or want a particular fit, message us before placing an order." },
    { heading: "CAN I CHANGE OR CANCEL MY ORDER?", body: "Contact us as soon as possible with your order details. Changes are subject to whether the order has already been processed or dispatched." },
  ]} />;
}
