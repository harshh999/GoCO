import getAdminDB from "../firebaseAdmin"
import type { Product } from "./types"

export async function getProductsByStore(storeId: string): Promise<Product[]> {
  const db = getAdminDB()
  const snapshot = await db.ref(`products/${storeId}`).once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  return Object.entries(data).map(([id, product]) => ({
    id,
    storeId,
    ...(product as Omit<Product, 'id' | 'storeId'>)
  }))
}

export async function getProduct(storeId: string, productId: string): Promise<Product | null> {
  const db = getAdminDB()
  const snapshot = await db.ref(`products/${storeId}/${productId}`).once("value")
  
  if (!snapshot.exists()) return null
  
  return {
    id: productId,
    storeId,
    ...snapshot.val()
  } as Product
}

export async function createProduct(storeId: string, product: Omit<Product, "id" | "storeId">): Promise<string> {
  const db = getAdminDB()
  const ref = db.ref(`products/${storeId}`).push()
  
  await ref.set({
    ...product,
    createdAt: product.createdAt || Date.now()
  })
  
  return ref.key!
}

export async function updateProduct(storeId: string, productId: string, updates: Partial<Product>): Promise<void> {
  const db = getAdminDB()
  await db.ref(`products/${storeId}/${productId}`).update({
    ...updates,
    updatedAt: Date.now()
  })
}

export async function deleteProduct(storeId: string, productId: string): Promise<void> {
  const db = getAdminDB()
  await db.ref(`products/${storeId}/${productId}`).remove()
}

export async function getAllProducts(): Promise<Product[]> {
  const db = getAdminDB()
  const snapshot = await db.ref("products").once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  const products: Product[] = []
  for (const [storeId, storeProducts] of Object.entries(data)) {
    for (const [productId, product] of Object.entries(storeProducts as Record<string, any>)) {
      products.push({
        id: productId,
        storeId,
        ...product
      } as Product)
    }
  }
  
  return products
}

export async function getProductBySlug(storeId: string, slug: string): Promise<Product | null> {
  const db = getAdminDB()
  const snapshot = await db.ref(`products/${storeId}`).once("value")
  const data = snapshot.val()
  
  if (!data) return null
  
  // First try direct ID lookup
  if (data[slug]) {
    const product = data[slug] as any
    return {
      id: slug,
      storeId,
      ...product
    } as Product
  }
  
  // Then try slug lookup
  for (const [productId, product] of Object.entries(data)) {
    const p = product as any
    if (p.slug === slug) {
      return {
        id: productId,
        storeId,
        ...p
      } as Product
    }
  }
  
  return null
}

export async function getProductBySlugAnyStore(slug: string): Promise<{ product: Product | null; storeId: string | null }> {
  const db = getAdminDB()
  const storesSnapshot = await db.ref("stores").once("value")
  const storesData = storesSnapshot.val()
  
  if (!storesData) return { product: null, storeId: null }
  
  for (const [storeId] of Object.entries(storesData)) {
    const productsSnapshot = await db.ref(`products/${storeId}`).once("value")
    const productsData = productsSnapshot.val()
    
    if (productsData) {
      // First, try to find by ID (direct lookup for better performance)
      if (productsData[slug]) {
        const product = productsData[slug] as any
        return {
          product: {
            id: slug,
            storeId,
            ...product
          } as Product,
          storeId
        }
      }
      // Then, try to find by slug
      for (const [productId, product] of Object.entries(productsData)) {
        const p = product as any
        if (p.slug === slug) {
          return {
            product: {
              id: productId,
              storeId,
              ...p
            } as Product,
            storeId
          }
        }
      }
    }
  }
  
  return { product: null, storeId: null }
}
