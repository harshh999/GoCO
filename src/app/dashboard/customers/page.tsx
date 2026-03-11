import { Metadata } from "next";
import CustomersPageContent from "./CustomersPageContent";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return <CustomersPageContent />;
}
