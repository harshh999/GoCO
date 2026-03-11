"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Store {
  id: string;
  name: string;
  storeName: string | null;
  storeDesc: string | null;
  storeType: string | null;
  _count: { products: number; customers: number };
}

export default function CatalogPageContent() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stores")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStores(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const storeTypeIcons: Record<string, string> = {
    "Food & Beverage": "🍃",
    "Clothing & Accessories": "👗",
    "Electronics & Accessories": "📱",
    Electronics: "📱",
    Clothing: "👗",
    Food: "🍃",
  };

  return (
    <div>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,_#312e81_0%,_transparent_65%)] opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_80%,_#4f46e5_0%,_transparent_55%)] opacity-40" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Cpath d=%22M60 0H0v60%22 fill=%22none%22 stroke=%22white%22 stroke-opacity=%220.04%22 stroke-width=%221%22/%3E%3C/svg%3E')]" />
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs font-medium mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            GoRetail · Multi-Store Marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
            Choose a Store<br />
            <span className="text-white/40">to Browse.</span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-md mx-auto">
            Pick from our curated partner stores and explore their full catalog.
          </p>
          {!loading && (
            <div className="flex items-center justify-center gap-6 mt-10">
              <div>
                <p className="text-2xl font-bold text-white">{stores.length}</p>
                <p className="text-xs text-white/40 mt-0.5">Stores</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {stores.reduce((sum, s) => sum + s._count.products, 0)}
                </p>
                <p className="text-xs text-white/40 mt-0.5">Products</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Store grid ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-8 animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 mb-5" />
                <div className="h-5 bg-gray-100 rounded-full w-2/3 mb-3" />
                <div className="h-3.5 bg-gray-100 rounded-full w-full mb-2" />
                <div className="h-3.5 bg-gray-100 rounded-full w-4/5" />
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-medium">No stores available yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => {
              const icon = storeTypeIcons[store.storeType ?? ""] ?? "🏪";
              return (
                <Link
                  key={store.id}
                  href={`/catalog/${store.id}`}
                  className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Icon badge */}
                  <div className="w-14 h-14 rounded-2xl bg-gray-950 flex items-center justify-center text-2xl mb-5 shadow-lg">
                    {icon}
                  </div>

                  {/* Store type pill */}
                  {store.storeType && (
                    <span className="self-start text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-3">
                      {store.storeType}
                    </span>
                  )}

                  {/* Name */}
                  <h2 className="text-xl font-bold text-gray-950 tracking-tight mb-2">
                    {store.storeName ?? store.name}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">
                    {store.storeDesc ?? "Browse our collection of products."}
                  </p>

                  {/* Stats + CTA row */}
                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-medium">
                      {store._count.products} product{store._count.products !== 1 ? "s" : ""}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 group-hover:gap-2.5 transition-all">
                      Browse store
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
