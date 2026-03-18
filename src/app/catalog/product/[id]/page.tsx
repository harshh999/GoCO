import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ImageGallery from "@/components/catalog/ImageGallery";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import NonPurchaseLeadForm from "@/components/catalog/NonPurchaseLeadForm";
import { getProductBySlugAnyStore, getAllProducts } from "@/lib/database/products";
import { getStoreSettings } from "@/lib/database/storeSettings";
import { getCategoriesByStore } from "@/lib/database/categories";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  // Search for product by slug across all stores
  const { product } = await getProductBySlugAnyStore(id);

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  // Search for product by slug across all stores
  const { product, storeId } = await getProductBySlugAnyStore(id);
  
  if (!product || !storeId) notFound();

  // Get store settings for this product's store
  const settings = await getStoreSettings(storeId);
  const currencySymbol = settings?.currencySymbol ?? "₹";

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.comparePrice!) * 100)
    : null;

  // Get categories for the store to find the category name
  const categories = await getCategoriesByStore(storeId);
  const category = categories.find(c => c.id === product.categoryId);

  // Get related products (same category)
  const allProducts = await getAllProducts();
  const related = product.categoryId 
    ? allProducts.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-10">
        <Link href="/catalog" className="hover:text-gray-700 transition-colors font-medium">
          Catalog
        </Link>
        {category && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400">{category.name}</span>
          </>
        )}
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main content */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="animate-slide-up">
          <ImageGallery
            images={(product.images || []).map((img) => ({
              id: img.id,
              url: img.url,
              alt: img.alt ?? undefined,
              isPrimary: img.isPrimary ?? false,
              order: img.order ?? 0,
            }))}
            productName={product.name}
          />
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-5 animate-slide-up">
          {/* Category */}
          {category && (
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.12em]">
              {category.name}
            </span>
          )}

          {/* Name */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 leading-tight tracking-tight">
            {product.name}
          </h1>

          {/* Price row */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-950">
              {formatPrice(product.price, currencySymbol)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.comparePrice!, currencySymbol)}
                </span>
                <Badge variant="red">
                  -{discountPercent}%
                </Badge>
              </>
            )}
          </div>

          {/* Status + SKU */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant={product.inStock ? "green" : "red"}>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </Badge>
            {product.featured && <Badge variant="yellow">Featured</Badge>}
            {product.sku && (
              <Badge>SKU: {product.sku}</Badge>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* CTA — visit store notice */}
          <div className="mt-auto rounded-2xl overflow-hidden">
            <div className="bg-gray-950 text-white px-5 py-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Available in Store</p>
                <p className="text-xs text-white/50 mt-0.5">Visit us to try, touch & purchase this item</p>
              </div>
            </div>

            {/* Didn't find what you need */}
            <NonPurchaseLeadForm />
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20 pt-10 border-t border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-950">More from this category</h2>
            <Link
              href={`/catalog?category=${product.categoryId}`}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {related.map((rel) => {
              const relImages = rel.images || [];
              const img = relImages.find((i) => i.isPrimary) ?? relImages[0];
              return (
                <Link
                  key={rel.id}
                  href={`/catalog/product/${rel.id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.14)]">
                    <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.url}
                          alt={img.alt ?? rel.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                        {rel.name}
                      </p>
                      <p className="text-[15px] font-bold text-gray-950">
                        {formatPrice(rel.price, currencySymbol)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
