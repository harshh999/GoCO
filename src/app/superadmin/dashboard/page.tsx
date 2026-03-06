import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import LogoutButton from "@/components/ui/LogoutButton";

export default async function SuperAdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  // Fetch all admin users (stores) + aggregate stats
  const [admins, totalProducts, totalCategories, settings] = await Promise.all([
    prisma.user.findMany({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.product.count(),
    prisma.category.count(),
    prisma.storeSettings.findFirst(),
  ]);

  const stores = admins.map((a) => ({
    id: a.id,
    name: a.storeName ?? a.name,
    email: a.email,
    createdAt: a.createdAt,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-950 rounded-[10px] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">GR</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">GoRetail</p>
              <p className="text-[11px] text-violet-600 font-semibold leading-none mt-0.5">SuperAdmin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-gray-500 font-medium">{session.email}</span>
            <Link
              href="/catalog"
              className="text-xs text-gray-500 hover:text-gray-800 font-medium transition-colors"
            >
              View Catalog
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-100 rounded-full text-violet-700 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
            GoCo SuperAdmin Portal
          </div>
          <h1 className="text-2xl font-bold text-gray-950">System Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {session.name}. Here&apos;s a snapshot of all stores.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Stores", value: stores.length, icon: "🏬" },
            { label: "Products", value: totalProducts, icon: "📦" },
            { label: "Categories", value: totalCategories, icon: "🗂️" },
            { label: "Platform", value: "Active", icon: "✅" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xl mb-2">{stat.icon}</p>
              <p className="text-2xl font-bold text-gray-950">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Stores List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Registered Stores</h2>
              <p className="text-xs text-gray-500 mt-0.5">{stores.length} store{stores.length !== 1 ? "s" : ""} on the platform</p>
            </div>
          </div>

          {stores.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400 text-sm">No stores registered yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stores.map((store, i) => (
                <div key={store.id} className="px-6 py-5 flex items-center gap-4 hover:bg-gray-50/60 transition-colors">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-950 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm">
                    {store.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{store.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{store.email}</p>
                  </div>

                  {/* Badge */}
                  <span className="shrink-0 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-100">
                    Active
                  </span>

                  {/* Store # */}
                  <span className="hidden sm:block shrink-0 text-xs text-gray-400 font-medium w-14 text-right">
                    Store #{i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform section */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Store Settings</h3>
            <p className="text-xs text-gray-500 mb-4">Platform currency and branding</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Store Name</span>
                <span className="font-medium text-gray-900">{settings?.storeName ?? "–"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Currency</span>
                <span className="font-medium text-gray-900">{settings?.currencySymbol ?? "₹"} ({settings?.currency ?? "INR"})</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500">Tagline</span>
                <span className="font-medium text-gray-900 truncate max-w-[150px]">{settings?.storeTagline ?? "–"}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-950 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-white font-bold text-sm mb-1">Admin Dashboard</p>
              <p className="text-white/50 text-xs">Manage products, categories and catalog settings</p>
            </div>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-900 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors w-fit"
            >
              Open Dashboard
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
