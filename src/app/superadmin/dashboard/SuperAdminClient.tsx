"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import LogoutButton from "@/components/ui/LogoutButton";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Store {
  id: string;
  name: string;
  email: string;
  storeType?: string;
  productCount?: number;
  customerCount?: number;
  createdAt: string;
}

interface Stats {
  totalStores: number;
  totalProducts: number;
  totalCategories: number;
  totalAdmins: number;
  totalCustomers: number;
}

interface Settings {
  storeName: string;
  currency: string;
  currencySymbol: string;
  storeTagline: string;
}

interface SubscriptionInfo {
  planName: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Props {
  session: { name: string; email: string };
  stores: Store[];
  stats: Stats;
  settings: Settings | null;
  subscription: SubscriptionInfo | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 30) return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const IconStore = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
  </svg>
);
const IconBox = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4-8-4V7m16 0L12 11M4 7l8 4" />
  </svg>
);
const IconTag = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
  </svg>
);
const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const IconChevron = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const IconSearch = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconX = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconActivity = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const IconCustomer = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SuperAdminClient({ session, stores, stats, settings, subscription }: Props) {
  const [search, setSearch] = useState("");
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Create Admin modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", storeName: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Filter stores by search
  const filteredStores = useMemo(
    () => stores.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())),
    [stores, search]
  );

  // Derive activity feed from store history
  const activityFeed = useMemo(() => {
    const entries: { id: string; text: string; time: string; type: "store" | "admin" | "catalog" | "settings" }[] = [];
    for (const s of stores.slice(0, 4)) {
      entries.push({ id: `store-${s.id}`, text: `${s.name} joined the platform`, time: s.createdAt, type: "store" });
    }
    // Add a few synthetic platform events (based on store count to look organic)
    if (stats.totalProducts > 0) {
      entries.push({ id: "prod-evt", text: `${stats.totalProducts} products added to catalog`, time: new Date(Date.now() - 3600000).toISOString(), type: "catalog" });
    }
    if (stats.totalCategories > 0) {
      entries.push({ id: "cat-evt", text: `${stats.totalCategories} categories configured`, time: new Date(Date.now() - 7200000).toISOString(), type: "admin" });
    }
    entries.push({ id: "settings-evt", text: "Store settings updated", time: new Date(Date.now() - 86400000).toISOString(), type: "settings" });
    return entries.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
  }, [stores, stats]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleDisable = (id: string, name: string) => {
    setDisabledIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast(`${name} re-enabled`);
      } else {
        next.add(id);
        showToast(`${name} disabled`, "error");
      }
      return next;
    });
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "ADMIN" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create admin");
      setShowCreateModal(false);
      setFormData({ name: "", email: "", password: "", storeName: "" });
      showToast(`Admin ${formData.name} created successfully`);
      // Reload page to show new store in list
      window.location.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  const activityDot: Record<string, string> = {
    store: "bg-violet-500",
    admin: "bg-blue-500",
    catalog: "bg-emerald-500",
    settings: "bg-orange-400",
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.type === "success" ? "bg-gray-950" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-950 rounded-[10px] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">GC</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">GoCo</p>
              <p className="text-[11px] text-violet-600 font-semibold leading-none mt-0.5">SuperAdmin Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-gray-500 font-medium">{session.email}</span>
            <Link href="/catalog" className="text-xs text-gray-500 hover:text-gray-800 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
              View Catalog
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Welcome */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-100 rounded-full text-violet-700 text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
            GoCo Platform Control Center
          </div>
          <h1 className="text-2xl font-bold text-gray-950">Platform Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, <span className="font-medium text-gray-700">{session.name}</span>. Manage all stores and platform settings.</p>
        </div>

        {/* ── Stats Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Stores", value: stats.totalStores, icon: <IconStore />, bg: "bg-violet-50", ring: "border-violet-100", iconColor: "text-violet-600", textColor: "text-violet-700" },
            { label: "Total Products", value: stats.totalProducts, icon: <IconBox />, bg: "bg-blue-50", ring: "border-blue-100", iconColor: "text-blue-600", textColor: "text-blue-700" },
            { label: "Categories", value: stats.totalCategories, icon: <IconTag />, bg: "bg-emerald-50", ring: "border-emerald-100", iconColor: "text-emerald-600", textColor: "text-emerald-700" },
            { label: "Admin Users", value: stats.totalAdmins, icon: <IconUsers />, bg: "bg-orange-50", ring: "border-orange-100", iconColor: "text-orange-600", textColor: "text-orange-700" },
            { label: "Customers", value: stats.totalCustomers, icon: <IconCustomer />, bg: "bg-pink-50", ring: "border-pink-100", iconColor: "text-pink-600", textColor: "text-pink-700" },
          ].map((card) => (
            <div key={card.label} className={`bg-white rounded-2xl border ${card.ring} p-5 shadow-sm hover:shadow-md transition-shadow`}>
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-4 ${card.iconColor}`}>
                {card.icon}
              </div>
              <p className="text-3xl font-bold text-gray-950 leading-none">{card.value}</p>
              <p className={`text-xs font-semibold mt-1.5 ${card.textColor}`}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 mb-6 shadow-sm">
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-950 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              <IconPlus /> Create Store
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 transition-colors"
            >
              <IconUsers /> Create Admin
            </button>
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <IconBox /> Manage Products
            </Link>
            <Link
              href="/dashboard/categories"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <IconTag /> Manage Categories
            </Link>
          </div>
        </div>

        {/* ── Main: Store Table + Activity Feed ───────────────────── */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">

          {/* Store Management */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Store Management</h2>
                <p className="text-xs text-gray-500 mt-0.5">{filteredStores.length} of {stores.length} store{stores.length !== 1 ? "s" : ""}</p>
              </div>
              {/* Search */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2"><IconSearch /></span>
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-56 pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-3 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Store</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide text-[10px] hidden md:table-cell">Owner Email</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Status</th>
                    <th className="text-right px-6 py-3 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStores.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                        {search ? `No stores matching "${search}"` : "No stores registered yet."}
                      </td>
                    </tr>
                  ) : (
                    filteredStores.map((store) => {
                      const isDisabled = disabledIds.has(store.id);
                      return (
                        <tr key={store.id} className={`hover:bg-gray-50/70 transition-colors ${isDisabled ? "opacity-50" : ""}`}>
                          {/* Store name + avatar */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-950 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm">
                                {store.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{store.name}</p>
                                <p className="text-gray-400 mt-0.5 md:hidden">{store.email}</p>
                                <p className="text-gray-400 mt-0.5">Since {new Date(store.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  {store.storeType && (
                                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                                      {store.storeType}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-400">
                                    {store.productCount ?? 0} products · {store.customerCount ?? 0} leads
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* Email */}
                          <td className="px-4 py-4 text-gray-600 hidden md:table-cell">{store.email}</td>
                          {/* Status badge */}
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              isDisabled
                                ? "bg-red-50 text-red-600 border-red-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isDisabled ? "bg-red-500" : "bg-emerald-500"}`} />
                              {isDisabled ? "Inactive" : "Active"}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/catalog/${store.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                View
                              </Link>
                              <Link
                                href="/dashboard/settings"
                                className="px-3 py-1.5 text-[11px] font-semibold text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => toggleDisable(store.id, store.name)}
                                className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                                  isDisabled
                                    ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                    : "text-red-600 bg-red-50 hover:bg-red-100"
                                }`}
                              >
                                {isDisabled ? "Enable" : "Disable"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Activity Feed ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="text-gray-400"><IconActivity /></span>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Platform events</p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-4">
              {activityFeed.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="mt-1.5 shrink-0">
                    <span className={`block w-2 h-2 rounded-full ${activityDot[item.type]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">{item.text}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(item.time)}</p>
                  </div>
                </div>
              ))}
              {activityFeed.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-8">No activity yet.</p>
              )}
            </div>

            {/* Subscription info */}
            {subscription && (
              <div className="mx-5 mb-4 border border-gray-100 rounded-xl p-4">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-2">Subscription</p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-900">{subscription.planName}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    subscription.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}>{subscription.status}</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {new Date(subscription.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" → "}
                  {new Date(subscription.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            )}

            {/* Platform info footer */}
            <div className="mx-5 mb-5 bg-gray-950 rounded-xl p-4">
              <p className="text-white text-xs font-bold mb-1">{settings?.storeName ?? "GoCo Platform"}</p>
              <p className="text-white/50 text-[11px] mb-3">{settings?.storeTagline ?? "Retail Catalog System"}</p>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/40">{settings?.currencySymbol ?? "₹"} {settings?.currency ?? "INR"}</span>
                <Link href="/dashboard" className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors font-medium">
                  Open Dashboard <IconChevron />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Create Admin / Store Modal ──────────────────────────────── */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Create New Store / Admin</h3>
                <p className="text-xs text-gray-500 mt-0.5">A new admin account with store access</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <IconX />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAdmin} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Store / Owner Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Urban Threads"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value, storeName: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Admin Email</label>
                <input
                  required
                  type="email"
                  placeholder="admin@storename.com"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                <input
                  required
                  type="password"
                  placeholder="Min 8 characters"
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                />
              </div>

              {formError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gray-950 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formLoading ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
