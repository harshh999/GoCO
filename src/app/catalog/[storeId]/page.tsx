import { Metadata } from "next";
import { notFound } from "next/navigation";
import { users } from "@/lib/firestore";
import StoreCatalogContent from "./StoreCatalogContent";

interface Props {
  params: Promise<{ storeId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeId } = await params;
  const store = await users.getUserById(storeId)
  if (store && store.role !== 'ADMIN') {
    return { title: 'Store Not Found' }
  }
  if (!store) return { title: "Store Not Found" };
  return {
    title: store.storeName ?? "Store Catalog",
    description: store.storeDesc ?? undefined,
  };
}

export default async function StoreCatalogPage({ params }: Props) {
  const { storeId } = await params;

  const store = await users.getUserById(storeId)
  if (!store || store.role !== 'ADMIN') notFound();

  return <StoreCatalogContent storeId={storeId} />;
}
