"use client";

import { useState, useEffect, useCallback } from "react";
import ProductGrid from "@/components/catalog/ProductGrid";
import CatalogFilterBar from "@/components/catalog/CatalogFilterBar";
import { Product, Category, StoreSettings } from "@/types";

export default function CatalogPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pageSize: "100" });
      if (search) params.set("search", search);
      if (selectedCategory) params.set("categoryId", selectedCategory);

      const [pRes, cRes, sRes] = await Promise.all([
        fetch(`/api/products?${params}`),
        fetch("/api/categories"),
        fetch("/api/settings"),
      ]);
      const [pData, cData, sData] = await Promise.all([pRes.json(), cRes.json(), sRes.json()]);
      if (pData.success) setProducts(pData.data.items);
      if (cData.success) setCategories(cData.data);
      if (sData.success) setSettings(sData.data);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isFiltering = !!(search || selectedCategory);

  return (
    <div>
      {/* ── Hero ── */}
      {!isFiltering && (
        <div className="relative overflow-hidden bg-gray-950">
          {/* Gradient bg */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,_#312e81_0%,_transparent_65%)] opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_80%,_#4f46e5_0%,_transparent_55%)] opacity-40" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Cpath d=%22M60 0H0v60%22 fill=%22none%22 stroke=%22white%22 stroke-opacity=%220.04%22 stroke-width=%221%22/%3E%3C/svg%3E')]" />

          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs font-medium mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {settings?.storeName ?? "GoRetail"} · Digital Catalog
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
              {settings?.storeTagline
                ? settings.storeTagline
                : <>Discover Our<br /><span className="text-white/40">Collection.</span></>}
            </h1>
            <p className="text-white/50 text-base sm:text-lg max-w-lg">
              Browse our full catalog. Scan. Explore. Shop — right from your phone.
            </p>

            {/* Stats row */}
            {!loading && (
              <div className="flex flex-wrap items-center gap-6 mt-10">
                <div>
                  <p className="text-2xl font-bold text-white">{products.length}</p>
                  <p className="text-xs text-white/40 mt-0.5">Products</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <p className="text-2xl font-bold text-white">{categories.length}</p>
                  <p className="text-xs text-white/40 mt-0.5">Categories</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {products.filter(p => p.inStock).length}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">In Stock</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Products section ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        {/* Filter bar */}
        <CatalogFilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={search}
          onSearchChange={setSearch}
          totalCount={products.length}
        />

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-gray-50">
                <div className="aspect-[4/5] bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2.5">
                  <div className="h-2.5 bg-gray-100 rounded-full animate-pulse w-1/3" />
                  <div className="h-3.5 bg-gray-100 rounded-full animate-pulse" />
                  <div className="h-3.5 bg-gray-100 rounded-full animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-fade-in mt-8">
            <ProductGrid
              products={products}
              currencySymbol={settings?.currencySymbol ?? "$"}
              emptyMessage={
                isFiltering
                  ? "No products match your search."
                  : "No products in the catalog yet."
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
