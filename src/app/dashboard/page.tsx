import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getProductsByStore } from "@/lib/database/products";
import { getCategoriesByStore } from "@/lib/database/categories";
import { getCustomersByStore } from "@/lib/database/customers";
import { getRequestsByStore } from "@/lib/database/requests";

export const metadata: Metadata = { title: "Dashboard" };

async function getStats(storeId: string) {
  // Get products for this store
  const storeProducts = await getProductsByStore(storeId);
  
  // Get categories for this store
  const storeCategories = await getCategoriesByStore(storeId);
  
  // Get customers for this store
  const storeCustomers = await getCustomersByStore(storeId);
  
  // Get requests for this store
  const storeRequests = await getRequestsByStore(storeId);
  
  const inStockCount = storeProducts.filter(p => p.inStock !== false).length;
  const featuredCount = storeProducts.filter(p => p.featured === true).length;
  
  return { 
    products: storeProducts.length, 
    categories: storeCategories.length, 
    customers: storeCustomers.length,
    requests: storeRequests.length,
    inStockProducts: inStockCount, 
    featuredProducts: featuredCount 
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  
  // Redirect if not logged in or not admin
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    // For now, just show empty stats - in production would redirect
  }
  
  // Use session id as storeId for admin users
  const storeId = session?.id;
  
  const stats = storeId ? await getStats(storeId) : {
    products: 0,
    categories: 0,
    customers: 0,
    requests: 0,
    inStockProducts: 0,
    featuredProducts: 0
  };

  const statCards = [
    {
      label: "Total Products",
      value: stats.products,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Categories",
      value: stats.categories,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Customers",
      value: stats.customers,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Requests",
      value: stats.requests,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="max-w-6xl space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here&apos;s an overview of your store
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Add Product", href: "/dashboard/products", desc: "Create a new product" },
            { label: "Add Category", href: "/dashboard/categories", desc: "Organize your catalog" },
            { label: "View Catalog", href: "/catalog", desc: "See customer view", external: true },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              className="flex flex-col p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200 group"
            >
              <span className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                {action.label}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">{action.desc}</span>
            </a>
          ))}
        </div>
      </div>

      {/* QR info */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <h2 className="text-base font-semibold mb-1">QR Code Catalog</h2>
        <p className="text-sm text-gray-400 mb-4">
          Share your catalog URL or generate a QR code for customers to scan in store.
        </p>
        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 w-fit">
          <span className="text-sm text-gray-200 font-mono">
            {process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/catalog
          </span>
        </div>
      </div>
    </div>
  );
}
