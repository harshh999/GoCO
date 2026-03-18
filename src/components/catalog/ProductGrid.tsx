import { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  currencySymbol?: string;
  emptyMessage?: string;
  storeId?: string;
}

// Empty state icon
const EmptyIcon = () => (
  <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

export default function ProductGrid({
  products,
  currencySymbol = "₹",
  emptyMessage = "No products found.",
  storeId,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <EmptyIcon />
        </div>
        <p className="text-slate-600 text-base font-semibold mb-2">{emptyMessage}</p>
        <p className="text-slate-400 text-sm">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
      {products.map((product, index) => (
        <div 
          key={product.id} 
          className="animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ProductCard
            product={product}
            currencySymbol={currencySymbol}
            storeId={storeId}
          />
        </div>
      ))}
    </div>
  );
}
