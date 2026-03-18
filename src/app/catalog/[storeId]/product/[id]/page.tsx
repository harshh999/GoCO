import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ImageGallery from "@/components/catalog/ImageGallery";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import NonPurchaseLeadForm from "@/components/catalog/NonPurchaseLeadForm";
import { getProductBySlug, getProductsByStore } from "@/lib/database/products";
import { getStore } from "@/lib/database/stores";
import { getStoreSettings } from "@/lib/database/storeSettings";
import { getCategoriesByStore } from "@/lib/database/categories";

interface Props {
  params: Promise<{ storeId: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeId, id } = await params;
  
  const product = await getProductBySlug(storeId, id);
  if (!product) return { title: "Product Not Found" };
  
  return { title: product.name, description: product.description ?? undefined };
}

export default async function StoreProductPage({ params }: Props) {
  const { storeId, id } = await params;
  
  // Get product by slug for this store
  const product = await getProductBySlug(storeId, id);
  
  // Get store info
  const store = await getStore(storeId);
  
  if (!product || !store) notFound();

  // Get store settings
  const settings = await getStoreSettings(storeId);
  const currencySymbol = settings?.currencySymbol ?? "₹";

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.comparePrice!) * 100)
    : null;

  // Get categories for this store to find the category name
  const categories = await getCategoriesByStore(storeId);
  const category = categories.find(c => c.id === product.categoryId);

  // Get related products (same category)
  const storeProducts = await getProductsByStore(storeId);
  const related = product.categoryId
    ? storeProducts.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4)
    : [];

  const storeName = store.name ?? "Store";

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-10">
        <Link href="/catalog" className="hover:text-gray-700 transition-colors font-medium">
          Stores
        </Link>
        <span className="text-gray-300">/</span>
        <Link href={`/catalog/${storeId}`} className="hover:text-gray-700 transition-colors font-medium">
          {storeName}
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
          {category && (
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.12em]">
              {category.name}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 leading-tight tracking-tight">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-950">
              {formatPrice(product.price, currencySymbol)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.comparePrice!, currencySymbol)}
                </span>
                <Badge variant="red">-{discountPercent}%</Badge>
              </>
            )}
          </div>

          {!product.inStock && (
            <Badge variant="default">Out of Stock</Badge>
          )}

          {product.description && (
            <p className="text-gray-600 text-base leading-relaxed border-t border-gray-100 pt-5">
              {product.description}
            </p>
          )}

          {product.sku && (
            <p className="text-xs text-gray-400">
              SKU: <span className="font-mono font-medium text-gray-600">{product.sku}</span>
            </p>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <a
              href={`https://wa.me/?text=Hi, I'm interested in ${encodeURIComponent(product.name)} from ${encodeURIComponent(storeName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Enquire on WhatsApp
            </a>
          </div>

          {/* Non-purchase lead form */}
          <NonPurchaseLeadForm storeId={storeId} />
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20 pt-10 border-t border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-950">More from {storeName}</h2>
            <Link
              href={`/catalog/${storeId}`}
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
                  href={`/catalog/${storeId}/product/${rel.id}`}
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
                        <div className="w-full h-full flex items-center justify-center">
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
