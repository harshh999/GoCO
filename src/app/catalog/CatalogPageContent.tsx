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
      .then((d) => {
        if (d.success) {
          setStores(d.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const storeTypeIcons: Record<string, string> = {
    "Food & Beverage": "F&B",
    "Clothing & Accessories": "C&A",
    "Electronics & Accessories": "E&A",
    Electronics: "E",
    Clothing: "C",
    Food: "F",
  };

  // Store icon for empty/loading
  const StoreIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
    </svg>
  );

  return (
    <div>
      {/* -- Hero -- */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,_#1e293b_0%,_transparent_65%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2260%22%20height=%2260%22%3E%3Cpath%20d=%22M60%200H0v60%22%20fill=%22none%22%20stroke=%22white%22%20stroke-opacity=%220.04%22%20stroke-width=%221%22/%3E%3C/svg%3E')]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            GoRetail - Multi-Store Marketplace
          </div>
          
          <h1 className="text-5xl font-semibold tracking-tight text-white leading-tight mb-6">
            Choose a Store<br />
            <span className="text-slate-400">to Browse.</span>
          </h1>
          
          <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            Pick from our curated partner stores and explore their full catalog.
          </p>
          
          {!loading && (
            <div className="flex items-center justify-center gap-10 mt-12">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-bold text-white">{stores.length}</span>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-white text-left">{stores.length}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Stores</p>
                </div>
              </div>
              
              <div className="w-px h-12 bg-white/10" />
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-bold text-indigo-400">
                    {stores.reduce((sum, s) => sum + s._count.products, 0)}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white text-left">{stores.reduce((sum, s) => sum + s._count.products, 0)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Products</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* -- Store grid -- */}
      <div className="bg-gradient-to-b from-white via-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-white p-7 animate-pulse">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 mb-5" />
                  <div className="h-5 bg-slate-100 rounded-full w-2/3 mb-3" />
                  <div className="h-3.5 bg-slate-100 rounded-full w-full mb-2" />
                  <div className="h-3.5 bg-slate-100 rounded-full w-4/5" />
                </div>
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <StoreIcon />
              </div>
              <p className="text-slate-600 text-lg font-semibold mb-2">No stores available yet.</p>
              <p className="text-slate-400 text-sm">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store, index) => {
                const icon = storeTypeIcons[store.storeType ?? ""] ?? "Store";
                return (
                  <Link
                    key={store.id}
                    href={`/catalog/${store.id}`}
                    className="group relative flex flex-col rounded-2xl border border-slate-200/60 bg-white p-7 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-indigo-200/60 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Icon badge */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-xl font-bold text-white mb-5 shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform duration-300">
                      {icon}
                    </div>

                    {/* Store type pill */}
                    {store.storeType && (
                      <span className="self-start text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-3 border border-indigo-100">
                        {store.storeType}
                      </span>
                    )}

                    {/* Name */}
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-indigo-700 transition-colors">
                      {store.storeName ?? store.name}
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-slate-500 leading-relaxed flex-1">
                      {store.storeDesc ?? "Browse our collection of products."}
                    </p>

                    {/* Stats + CTA row */}
                    <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                      <span className="text-xs text-slate-400 font-semibold">
                        {store._count.products} product{store._count.products !== 1 ? "s" : ""}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:gap-3 transition-all">
                        Browse store
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>

                    {/* Hover gradient accent */}
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
