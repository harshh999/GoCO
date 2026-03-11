import admin from 'firebase-admin'
import getAdminFirestore from '../firestoreAdmin'
import type { Product, ProductImage } from './types'

const db = getAdminFirestore()

const productsColl = () => db.collection('products')

export async function listProductsByStore(storeId: string): Promise<Product[]> {
  const q = await productsColl().where('storeId', '==', storeId).get()
  return q.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Product))
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await productsColl().doc(id).get()
  if (!snap.exists) return null
  const data = { id: snap.id, ...(snap.data() as any) } as Product
  const imgsSnap = await productsColl().doc(id).collection('images').orderBy('order', 'asc').get()
  ;(data as any).images = imgsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
  return data
}

export async function createProduct(id: string | undefined, payload: Partial<Product> & { images?: any[] }): Promise<Product> {
  const ref = id ? productsColl().doc(id) : productsColl().doc()
  const data = { ...payload, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }
  await ref.set(data, { merge: true })
  // write images if provided
  if (payload.images && Array.isArray(payload.images)) {
    for (let i = 0; i < payload.images.length; i++) {
      const img = payload.images[i]
      const imgRef = ref.collection('images').doc(img.id)
      await imgRef.set({ url: img.url, alt: img.alt ?? null, isPrimary: img.isPrimary ?? (i === 0), order: img.order ?? i, createdAt: admin.firestore.FieldValue.serverTimestamp() })
    }
  }
  const snap = await ref.get()
  const created = { id: ref.id, ...(snap.data() as any) } as Product
  const imgsSnap = await ref.collection('images').orderBy('order', 'asc').get()
  ;(created as any).images = imgsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
  return created
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<void> {
  await productsColl().doc(id).set({ ...payload, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const q = await productsColl().where('categoryId', '==', categoryId).get()
  const items: Product[] = []
  for (const d of q.docs) {
    const prod = { id: d.id, ...(d.data() as any) } as Product
    const imgsSnap = await productsColl().doc(d.id).collection('images').orderBy('order', 'asc').get()
    ;(prod as any).images = imgsSnap.docs.map(img => ({ id: img.id, ...(img.data() as any) }))
    items.push(prod)
  }
  return items
}

export async function deleteProduct(id: string): Promise<void> {
  // delete images subcollection then product doc
  const imagesRef = productsColl().doc(id).collection('images')
  // delete in batches
  async function deleteCollection(collRef: FirebaseFirestore.CollectionReference) {
    const snapshot = await collRef.limit(500).get()
    if (snapshot.empty) return
    const batch = db.batch()
    snapshot.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
    if (snapshot.size === 500) return deleteCollection(collRef)
  }
  await deleteCollection(imagesRef)
  await productsColl().doc(id).delete()
}

// Product image helpers (products/{productId}/images)
export async function addProductImage(productId: string, image: Partial<ProductImage>): Promise<string> {
  const ref = productsColl().doc(productId).collection('images').doc(image.id)
  const data = { ...image, createdAt: admin.firestore.FieldValue.serverTimestamp() }
  await ref.set(data, { merge: true })
  return ref.id
}

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const q = await productsColl().doc(productId).collection('images').orderBy('order', 'asc').get()
  return q.docs.map(d => ({ id: d.id, ...(d.data() as any) } as ProductImage))
}

export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  await productsColl().doc(productId).collection('images').doc(imageId).delete()
}

export default {
  listProductsByStore,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImage,
  getProductImages,
  deleteProductImage,
}
