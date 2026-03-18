import getAdminDB from "../firebaseAdmin"
import type { Category } from "./types"

export async function getCategoriesByStore(storeId: string): Promise<Category[]> {
  const db = getAdminDB()
  const snapshot = await db.ref(`categories/${storeId}`).once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  return Object.entries(data).map(([id, category]) => ({
    id,
    storeId,
    ...(category as Omit<Category, 'id' | 'storeId'>)
  }))
}

export async function getCategory(storeId: string, categoryId: string): Promise<Category | null> {
  const db = getAdminDB()
  const snapshot = await db.ref(`categories/${storeId}/${categoryId}`).once("value")
  
  if (!snapshot.exists()) return null
  
  return {
    id: categoryId,
    storeId,
    ...snapshot.val()
  } as Category
}

export async function createCategory(storeId: string, category: Omit<Category, "id" | "storeId">): Promise<string> {
  const db = getAdminDB()
  const ref = db.ref(`categories/${storeId}`).push()
  
  await ref.set({
    ...category,
    createdAt: category.createdAt || Date.now()
  })
  
  return ref.key!
}

export async function updateCategory(storeId: string, categoryId: string, updates: Partial<Category>): Promise<void> {
  const db = getAdminDB()
  await db.ref(`categories/${storeId}/${categoryId}`).update({
    ...updates,
    updatedAt: Date.now()
  })
}

export async function deleteCategory(storeId: string, categoryId: string): Promise<void> {
  const db = getAdminDB()
  await db.ref(`categories/${storeId}/${categoryId}`).remove()
}

export async function getAllCategories(): Promise<Category[]> {
  const db = getAdminDB()
  const snapshot = await db.ref("categories").once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  const categories: Category[] = []
  for (const [storeId, storeCategories] of Object.entries(data)) {
    for (const [categoryId, category] of Object.entries(storeCategories as Record<string, any>)) {
      categories.push({
        id: categoryId,
        storeId,
        ...category
      } as Category)
    }
  }
  
  return categories
}
