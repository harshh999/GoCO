import { Metadata } from "next";
import ProductsPageContent from "./ProductsPageContent";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return <ProductsPageContent />;
}
