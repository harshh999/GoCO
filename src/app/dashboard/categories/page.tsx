import { Metadata } from "next";
import CategoriesPageContent from "./CategoriesPageContent";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return <CategoriesPageContent />;
}
