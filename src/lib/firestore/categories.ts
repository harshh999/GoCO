import admin from 'firebase-admin'
import getAdminFirestore from '../firestoreAdmin'
import type { Category } from './types'

const db = getAdminFirestore()
const coll = () => db.collection('categories')

export async function getCategories(): Promise<Category[]> {
  const q = await coll().orderBy('name', 'asc').get()
  return q.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Category))
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const q = await coll().where('slug', '==', slug).limit(1).get()
  if (q.empty) return null
  const d = q.docs[0]
  return { id: d.id, ...(d.data() as any) } as Category
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const snap = await coll().doc(id).get()
  return snap.exists ? ({ id: snap.id, ...(snap.data() as any) } as Category) : null
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const ref = data.id ? coll().doc(data.id) : coll().doc()
  const payload = { ...data, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }
  await ref.set(payload)
  const snap = await ref.get()
  return { id: snap.id, ...(snap.data() as any) } as Category
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  await coll().doc(id).set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
  const snap = await coll().doc(id).get()
  return { id: snap.id, ...(snap.data() as any) } as Category
}

export async function deleteCategory(id: string): Promise<void> {
  await coll().doc(id).delete()
}

export default { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory }
