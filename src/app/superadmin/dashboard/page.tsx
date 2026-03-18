import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllUsers } from "@/lib/database/users";
import { getAllProducts } from "@/lib/database/products";
import { getAllCategories } from "@/lib/database/categories";
import { getAllCustomers } from "@/lib/database/customers";
import { getAllSubscriptions } from "@/lib/database/subscriptions";
import { getStoreSettings } from "@/lib/database/storeSettings";
import SuperAdminClient from "./SuperAdminClient";

export default async function SuperAdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  // Fetch data from RTDB
  const [allUsers, allProducts, allCategories, allCustomers, allSubscriptions, settings] = await Promise.all([
    getAllUsers(),
    getAllProducts(),
    getAllCategories(),
    getAllCustomers(),
    getAllSubscriptions(),
    getStoreSettings(),
  ]);

  // Get admin users (those with role ADMIN)
  const admins = allUsers.filter(u => u.role === 'ADMIN' || u.role === 'admin')
  const stores = []
  for (const a of admins) {
    const prodCount = allProducts.filter(p => p.storeId === a.id).length
    const custCount = allCustomers.filter(c => c.storeId === a.id).length
    stores.push({ 
      id: a.id, 
      name: a.storeName ?? a.name ?? '', 
      email: a.email ?? '', 
      storeType: a.storeType ?? undefined, 
      productCount: prodCount, 
      customerCount: custCount, 
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString() 
    })
  }

  const totalProducts = allProducts.length
  const totalCategories = allCategories.length
  const totalCustomers = allCustomers.length
  const subscription = allSubscriptions.length > 0 ? allSubscriptions[0] : null

  return (
    <SuperAdminClient
      session={{ name: session.name, email: session.email }}
      stores={stores}
      stats={{ totalStores: stores.length, totalProducts, totalCategories, totalAdmins: admins.length, totalCustomers }}
      settings={
        settings
          ? {
              storeName: settings.storeName ?? '',
              currency: settings.currency ?? 'USD',
              currencySymbol: settings.currencySymbol ?? '$',
              storeTagline: settings.storeTagline ?? "",
            }
          : null
      }
      subscription={
        subscription
          ? {
              planName: subscription.plan ?? 'Free',
              startDate: subscription.startDate ? new Date(subscription.startDate).toISOString() : new Date().toISOString(),
              endDate: subscription.endDate ? new Date(subscription.endDate).toISOString() : new Date().toISOString(),
              status: subscription.status ?? 'inactive',
            }
          : null
      }
    />
  );
}
