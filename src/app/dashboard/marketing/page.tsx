import { Metadata } from "next";
import MarketingPageContent from "./MarketingPageContent";

export const metadata: Metadata = { title: "Marketing" };

export default function MarketingPage() {
  return <MarketingPageContent />;
}
