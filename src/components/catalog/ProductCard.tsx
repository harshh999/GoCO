import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice, getPrimaryImage } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  currencySymbol?: string;
  storeId?: string;
}

export default function ProductCard({ product, currencySymbol = "₹", storeId }: ProductCardProps) {
  const imageUrl = getPrimaryImage(product.images);
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.comparePrice!) * 100)
    : null;
  const href = storeId
    ? `/catalog/${storeId}/product/${product.id}`
    : `/catalog/product/${product.id}`;

  return (
    <Link href={href} className="group block">
      <div className="relative rounded-2xl border border-slate-200/60 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-900/8 hover:border-slate-300/80">
        
        {/* Image container */}
        <div className="relative aspect-[4/5] bg-slate-100 flex items-center justify-center overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.images?.[0]?.alt ?? product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {!product.inStock && (
              <span className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                Sold Out
              </span>
            )}
            {hasDiscount && (
              <span className="px-2.5 py-1 bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Quick action overlay on hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-center gap-2">
              <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-semibold rounded-lg shadow-lg">
                View Details
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2.5">
          {product.category && (
            <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
              {product.category.name}
            </p>
          )}
          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-700 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(product.price, currencySymbol)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-slate-400 line-through font-medium">
                {formatPrice(product.comparePrice!, currencySymbol)}
              </span>
            )}
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </Link>
  );
}
