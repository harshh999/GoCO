"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProductGrid from "@/components/catalog/ProductGrid";
import CatalogFilterBar from "@/components/catalog/CatalogFilterBar";
import LeadCaptureModal from "@/components/catalog/LeadCaptureModal";
import { Product, Category } from "@/types";

interface StoreMeta {
  storeName: string;
  storeDesc: string | null;
  storeType: string | null;
  _count: { products: number };
}

interface Props {
  storeId: string;
}

// Back arrow icon
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

// Arrow right icon
const ArrowIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

export default function StoreCatalogContent({ storeId }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [store, setStore] = useState<StoreMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ storeId, pageSize: "100" });
      if (search) params.set("search", search);
      if (selectedCategory) params.set("categoryId", selectedCategory);

      const [pRes, cRes, sRes] = await Promise.all([
        fetch(`/api/products?${params}`),
        fetch("/api/categories"),
        fetch("/api/stores"),
      ]);
      const [pData, cData, storesData] = await Promise.all([
        pRes.json(),
        cRes.json(),
        sRes.json(),
      ]);
      if (pData.success) setProducts(pData.data.items);
      if (cData.success) setCategories(cData.data);
      if (storesData.success) {
        const found = storesData.data.find((s: { id: string }) => s.id === storeId);
        if (found) setStore(found);
      }
    } finally {
      setLoading(false);
    }
  }, [storeId, search, selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isFiltering = !!(search || selectedCategory);
  const storeName = store?.storeName ?? "Store";
  const currencySymbol = "Rs";

  return (
    <>
      <LeadCaptureModal storeId={storeId} storeName={storeName} delayMs={30000} />

      <div>
        {/* -- Hero -- */}
        {!isFiltering && (
          <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,_#1e293b_0%,_transparent_65%)]" />
            <div className="absolute inset-0 opacity-30" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
              {/* Back link */}
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold mb-8 transition-colors hover:gap-3"
              >
                <BackIcon />
                All Stores
              </Link>

              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {store?.storeType ?? "Store"} - Digital Catalog
              </div>

              <h1 className="text-5xl font-semibold tracking-tight text-white leading-tight mb-5">
                {storeName}
                <br />
                <span className="text-slate-400">Catalog.</span>
              </h1>

              {store?.storeDesc && (
                <p className="text-slate-400 text-xl max-w-lg leading-relaxed">
                  {store.storeDesc}
                </p>
              )}

              {!loading && (
                <div className="flex flex-wrap items-center gap-8 mt-12">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xl font-bold text-white">{products.length}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{products.length}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Products</p>
                    </div>
                  </div>

                  <div className="w-px h-10 bg-white/10" />

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xl font-bold text-white">{categories.length}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{categories.length}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Categories</p>
                    </div>
                  </div>

                  <div className="w-px h-10 bg-white/10" />

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xl font-bold text-emerald-400">{products.filter((p) => p.inStock).length}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{products.filter((p) => p.inStock).length}</p>
                      <p className="text-xs text-slate-400 mt-0.5">In Stock</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -- Products -- */}
        <div className="bg-gradient-to-b from-white via-slate-50/50 to-white min-h-screen">
          <div className="max-w-7xl mx-auto px-6 py-10">

            {/* Filter bar with enhanced styling */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm shadow-slate-200/30 mb-8">
              <CatalogFilterBar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                searchQuery={search}
                onSearchChange={setSearch}
                totalCount={products.length}
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden bg-white border border-slate-100">
                    <div className="aspect-[4/5] bg-slate-100 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-2 bg-slate-100 rounded-full w-1/3 animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                      <div className="h-3 bg-slate-100 rounded-full w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <ProductGrid
                  products={products}
                  currencySymbol={currencySymbol}
                  storeId={storeId}
                  emptyMessage={
                    isFiltering
                      ? "No products match your search criteria."
                      : "No products in this store yet."
                  }
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
