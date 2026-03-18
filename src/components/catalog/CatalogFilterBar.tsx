"use client";

import { useState, useEffect, useRef } from "react";
import { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CatalogFilterBarProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
}

// Search icon
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Clear icon
const ClearIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function CatalogFilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  totalCount,
}: CatalogFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(localSearch);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localSearch, onSearchChange]);

  return (
    <div className="space-y-5">
      {/* Search + count row */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xl">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
          />
          {localSearch && (
            <button
              onClick={() => { setLocalSearch(""); onSearchChange(""); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <ClearIcon />
            </button>
          )}
        </div>
        
        {/* Results count */}
        {(localSearch || selectedCategory) && (
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs text-slate-500 bg-indigo-50 px-4 py-2.5 rounded-xl font-semibold border border-indigo-100">
              {totalCount} result{totalCount !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => { setLocalSearch(""); onSearchChange(""); onCategoryChange(""); }}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-2.5 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <style jsx>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>
          <button
            onClick={() => onCategoryChange("")}
            className={cn(
              "shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm",
              selectedCategory === ""
                ? "bg-indigo-600 text-white shadow-indigo-600/25"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm",
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-indigo-600/25"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
