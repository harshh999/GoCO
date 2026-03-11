import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firestoreAdmin";
import { users, products, categories, customers, subscriptions, storeSettings } from "@/lib/firestore";
import SuperAdminClient from "./SuperAdminClient";

// Helper to safely get collection data, returning empty array on error
async function safeGetCollection(
  collectionName: string,
  queryFn?: (ref: any) => any
): Promise<{ docs: any[]; size: number; empty: boolean }> {
  try {
    const db = getAdminFirestore();
    let ref = db.collection(collectionName);
    if (queryFn) {
      ref = queryFn(ref);
    }
    const snap = await ref.get();
    return { docs: snap.docs, size: snap.size, empty: snap.empty };
  } catch (error: any) {
    // Handle NOT_FOUND (code 5) - collection doesn't exist yet
    if (error?.code === 5 || (error?.message && error.message.includes('NOT_FOUND'))) {
      console.log(`[safeGetCollection] Collection '${collectionName}' not found, returning empty`);
      return { docs: [], size: 0, empty: true };
    }
    // For other errors, log and return empty
    console.error(`[safeGetCollection] Error fetching '${collectionName}':`, error);
    return { docs: [], size: 0, empty: true };
  }
}

export default async function SuperAdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  // Safely fetch data from all collections, handling non-existent collections
  const [adminsSnap, productsSnap, categoriesSnap, customersSnap, settings, subscriptionSnap] = await Promise.all([
    safeGetCollection('users', (ref) => ref.where('role', '==', 'ADMIN').orderBy('createdAt', 'desc')),
    safeGetCollection('products'),
    safeGetCollection('categories'),
    safeGetCollection('customers'),
    storeSettings.getStoreSettings().catch(() => null),
    safeGetCollection('subscriptions', (ref) => ref.orderBy('createdAt', 'desc').limit(1)),
  ]);

  const admins = adminsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
  const stores = []
  for (const a of admins) {
    const prodCount = (await products.listProductsByStore(a.id)).length
    const custCount = (await customers.getCustomersByStore(a.id)).length
    stores.push({ 
      id: a.id, 
      name: a.storeName ?? a.name ?? '', 
      email: a.email ?? '', 
      storeType: a.storeType ?? undefined, 
      productCount: prodCount, 
      customerCount: custCount, 
      createdAt: (a.createdAt ? new Date((a.createdAt as any).toDate()).toISOString() : new Date().toISOString()) 
    })
  }

  const totalProducts = productsSnap.size
  const totalCategories = categoriesSnap.size
  const totalCustomers = customersSnap.size
  const subscription = !subscriptionSnap.empty ? ({ id: subscriptionSnap.docs[0].id, ...(subscriptionSnap.docs[0].data() as any) }) : null

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
              planName: subscription.planName,
              startDate: subscription.startDate.toISOString(),
              endDate: subscription.endDate.toISOString(),
              status: subscription.status,
            }
          : null
      }
    />
  );
}
