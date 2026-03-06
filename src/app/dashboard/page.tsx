import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

async function getStats() {
  const [products, categories, inStockProducts, featuredProducts] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({ where: { inStock: true } }),
    prisma.product.count({ where: { featured: true } }),
  ]);
  return { products, categories, inStockProducts, featuredProducts };
}

export default async function DashboardPage() {
  const [session, stats] = await Promise.all([getSession(), getStats()]);

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
      label: "In Stock",
      value: stats.inStockProducts,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Featured",
      value: stats.featuredProducts,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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
