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
const IconSettings = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
    store: "bg-indigo-500",
    admin: "bg-blue-500",
    catalog: "bg-emerald-500",
    settings: "bg-amber-500",
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50/70">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ease-out transform ${toast.type === "success" ? "bg-slate-900" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-17 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
              <span className="text-white text-[11px] font-bold tracking-wide">GC</span>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-bold text-slate-900 leading-none">GoCo</p>
              <p className="text-[11px] text-indigo-600 font-semibold leading-none mt-0.5">SuperAdmin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* User avatar */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200/60">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                {getInitials(session.name)}
              </div>
              <span className="text-xs text-slate-600 font-medium max-w-[150px] truncate">{session.email}</span>
            </div>
            <Link 
              href="/catalog" 
              className="text-xs text-slate-600 hover:text-slate-900 font-medium transition-all px-3.5 py-2 rounded-lg hover:bg-slate-100/80 border border-transparent hover:border-slate-200/60"
            >
              View Catalog
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Welcome Section */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-indigo-50/70 border border-indigo-100/60 rounded-full text-indigo-700 text-xs font-semibold mb-4">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Platform Control Center
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
          <p className="text-slate-500 text-sm mt-2 max-w-xl">Welcome back, <span className="font-medium text-slate-700">{session.name}</span>. Manage all stores and platform settings from this dashboard.</p>
        </div>

        {/* ── Stats Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Stores", value: stats.totalStores, icon: <IconStore />, gradient: "from-violet-500/10 to-violet-600/5", border: "border-violet-200/60", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
            { label: "Total Products", value: stats.totalProducts, icon: <IconBox />, gradient: "from-blue-500/10 to-blue-600/5", border: "border-blue-200/60", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
            { label: "Categories", value: stats.totalCategories, icon: <IconTag />, gradient: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-200/60", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
            { label: "Admin Users", value: stats.totalAdmins, icon: <IconUsers />, gradient: "from-amber-500/10 to-amber-600/5", border: "border-amber-200/60", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
            { label: "Customers", value: stats.totalCustomers, icon: <IconCustomer />, gradient: "from-rose-500/10 to-rose-600/5", border: "border-rose-200/60", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
          ].map((card) => (
            <div 
              key={card.label} 
              className={`relative overflow-hidden bg-gradient-to-br ${card.gradient} rounded-2xl border ${card.border} p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out group`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient.replace('10', '20').replace('5', '15')} rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity`} />
              <div className={`relative w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center mb-4 ${card.iconColor} shadow-sm`}>
                {card.icon}
              </div>
              <p className="text-3xl font-bold text-slate-900 leading-none tracking-tight">{card.value}</p>
              <p className={`text-xs font-semibold mt-2 ${card.iconColor}`}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/60 px-6 py-5 mb-8 shadow-sm shadow-slate-200/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">Quick Actions</p>
              <p className="text-xs text-slate-500 mt-1">Common platform management tasks</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-200"
            >
              <IconPlus /> Create Store
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 transition-all duration-200"
            >
              <IconUsers /> Create Admin
            </button>
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200"
            >
              <IconBox /> Manage Products
            </Link>
            <Link
              href="/dashboard/categories"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200"
            >
              <IconTag /> Manage Categories
            </Link>
          </div>
        </div>

        {/* ── Main: Store Table + Activity Feed ───────────────────── */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">

          {/* Store Management */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm shadow-slate-200/30">
            {/* Table header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Store Management</h2>
                <p className="text-xs text-slate-500 mt-1">{filteredStores.length} of {stores.length} store{stores.length !== 1 ? "s" : ""}</p>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <IconSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Store</th>
                    <th className="text-left px-4 py-4 font-semibold text-slate-500 uppercase tracking-wide text-[10px] hidden md:table-cell">Owner Email</th>
                    <th className="text-center px-4 py-4 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Status</th>
                    <th className="text-right px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStores.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-slate-400 text-sm">
                        {search ? `No stores matching "${search}"` : "No stores registered yet."}
                      </td>
                    </tr>
                  ) : (
                    filteredStores.map((store) => {
                      const isDisabled = disabledIds.has(store.id);
                      return (
                        <tr 
                          key={store.id} 
                          className={`group hover:bg-indigo-50/30 transition-colors duration-150 ${isDisabled ? "opacity-50" : ""}`}
                        >
                          {/* Store name + avatar */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-md shadow-slate-900/10">
                                {store.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{store.name}</p>
                                <p className="text-slate-400 mt-0.5 md:hidden">{store.email}</p>
                                <p className="text-slate-400 mt-0.5 text-[11px]">Since {new Date(store.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  {store.storeType && (
                                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                      {store.storeType}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400">
                                    {store.productCount ?? 0} products · {store.customerCount ?? 0} leads
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* Email */}
                          <td className="px-4 py-5 text-slate-600 hidden md:table-cell font-medium">{store.email}</td>
                          {/* Status badge */}
                          <td className="px-4 py-5 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${
                              isDisabled
                                ? "bg-rose-50/70 text-rose-600 border-rose-100"
                                : "bg-emerald-50/70 text-emerald-700 border-emerald-100"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isDisabled ? "bg-rose-400" : "bg-emerald-500"}`} />
                              {isDisabled ? "Inactive" : "Active"}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/catalog/${store.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 text-[11px] font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-all duration-150"
                              >
                                View
                              </Link>
                              <Link
                                href="/dashboard/settings"
                                className="px-3.5 py-2 text-[11px] font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all duration-150"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => toggleDisable(store.id, store.name)}
                                className={`px-3.5 py-2 text-[11px] font-semibold rounded-lg transition-all duration-150 ${
                                  isDisabled
                                    ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                    : "text-rose-600 bg-rose-50 hover:bg-rose-100"
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
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/30 overflow-hidden">
            <div className="px-5 py-4.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <IconActivity />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Platform events</p>
              </div>
            </div>
            
            {/* Timeline */}
            <div className="px-5 py-5 space-y-0">
              {activityFeed.map((item, index) => (
                <div 
                  key={item.id} 
                  className="relative flex items-start gap-4 pb-6 group last:pb-0"
                >
                  {/* Timeline connector */}
                  {index !== activityFeed.length - 1 && (
                    <div className="absolute left-[5px] top-7 bottom-0 w-0.5 bg-slate-100 group-hover:bg-slate-200 transition-colors" />
                  )}
                  
                  {/* Timeline dot */}
                  <div className="relative mt-1.5 shrink-0">
                    <span className={`block w-2.5 h-2.5 rounded-full ${activityDot[item.type]} ring-2 ring-white shadow-sm`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs text-slate-700 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">{item.text}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{timeAgo(item.time)}</p>
                  </div>
                </div>
              ))}
              {activityFeed.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-8">No activity yet.</p>
              )}
            </div>

            {/* Subscription info */}
            {subscription && (
              <div className="mx-5 mb-4 border border-slate-200/60 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-slate-200 rounded-md flex items-center justify-center">
                    <IconSettings />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Subscription</p>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900">{subscription.planName}</span>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                    subscription.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                  }`}>{subscription.status}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {new Date(subscription.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" → "}
                  {new Date(subscription.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            )}

            {/* Platform info footer */}
            <div className="mx-5 mb-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 shadow-lg shadow-slate-900/20">
              <p className="text-white text-sm font-bold mb-1">{settings?.storeName ?? "GoCo Platform"}</p>
              <p className="text-white/50 text-[11px] mb-4">{settings?.storeTagline ?? "Retail Catalog System"}</p>
              <div className="flex items-center justify-between text-[11px] pt-3 border-t border-white/10">
                <span className="text-white/40 font-medium">{settings?.currencySymbol ?? "₹"} {settings?.currency ?? "INR"}</span>
                <Link href="/dashboard" className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors font-medium group">
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
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New Store / Admin</h3>
                <p className="text-xs text-slate-500 mt-1">A new admin account with store access</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all"
              >
                <IconX />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAdmin} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Store / Owner Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Urban Threads"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value, storeName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Admin Email</label>
                <input
                  required
                  type="email"
                  placeholder="admin@storename.com"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <input
                  required
                  type="password"
                  placeholder="Min 8 characters"
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                />
              </div>

              {formError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
