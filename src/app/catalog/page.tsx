import { Metadata } from "next";
import CatalogPageContent from "./CatalogPageContent";
import OnboardingModal from "@/components/OnboardingModal";

export const metadata: Metadata = {
  title: "Catalog",
  description: "Browse our product catalog",
};

export default function CatalogPage() {
  return (
    <>
      <OnboardingModal />
      <CatalogPageContent />
    </>
  );
}
