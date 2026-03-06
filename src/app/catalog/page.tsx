import { Metadata } from "next";
import CatalogPageContent from "./CatalogPageContent";

export const metadata: Metadata = {
  title: "Catalog",
  description: "Browse our product catalog",
};

export default function CatalogPage() {
  return <CatalogPageContent />;
}
