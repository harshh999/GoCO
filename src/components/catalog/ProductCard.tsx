import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice, getPrimaryImage } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  currencySymbol?: string;
  storeId?: string;
}

export default function ProductCard({ product, currencySymbol = "$", storeId }: ProductCardProps) {
  const imageUrl = getPrimaryImage(product.images);
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.comparePrice!) * 100)
    : null;
  const href = storeId
    ? `/catalog/${storeId}/product/${product.slug}`
    : `/catalog/product/${product.slug}`;

  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.14)]">
        {/* Image container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.images[0]?.alt ?? product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {!product.inStock && (
              <span className="px-2.5 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-[11px] font-semibold rounded-full">
                Sold Out
              </span>
            )}
            {hasDiscount && (
              <span className="px-2.5 py-1 bg-red-500 text-white text-[11px] font-semibold rounded-full">
                -{discountPct}%
              </span>
            )}
            {product.featured && !hasDiscount && (
              <span className="px-2.5 py-1 bg-brand-600 text-white text-[11px] font-semibold rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Quick view pill — appears on hover */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
            <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full shadow-lg whitespace-nowrap">
              View Details →
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 py-3.5">
          {product.category && (
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-1">
              {product.category.name}
            </p>
          )}
          <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-bold text-gray-950">
              {formatPrice(product.price, currencySymbol)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.comparePrice!, currencySymbol)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
