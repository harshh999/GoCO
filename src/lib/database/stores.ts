import getAdminDB from "../firebaseAdmin"
import type { Store } from "./types"

export async function getAllStores(): Promise<Store[]> {
  const db = getAdminDB()
  const snapshot = await db.ref("users").once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  // Filter for admin users and map to store-like structure
  return Object.entries(data)
    .filter(([_unused, user]: [string, any]) => user.role === "ADMIN" || user.role === "admin")
    .map(([id, user]: [string, any]) => {
      return {
        id,
        name: user.name,
        storeName: user.storeName,
        storeDesc: user.storeDesc,
        storeType: user.storeType,
        createdAt: user.createdAt,
      } as Store
    })
}

export async function getStore(storeId: string): Promise<Store | null> {
  const db = getAdminDB()
  const snapshot = await db.ref(`users/${storeId}`).once("value")
  
  if (!snapshot.exists()) return null
  
  const user = snapshot.val()
  // Only return if this user is actually a store (admin)
  if (user.role !== "ADMIN" && user.role !== "admin") return null
  
  return {
    id: storeId,
    name: user.name,
    storeName: user.storeName,
    storeDesc: user.storeDesc,
    storeType: user.storeType,
    createdAt: user.createdAt,
  } as Store
}

export async function createStore(storeId: string, store: Omit<Store, "id">): Promise<void> {
  const db = getAdminDB()
  await db.ref(`stores/${storeId}`).set({
    ...store,
    createdAt: store.createdAt || Date.now()
  })
}

export async function updateStore(storeId: string, updates: Partial<Store>): Promise<void> {
  const db = getAdminDB()
  await db.ref(`stores/${storeId}`).update(updates)
}

export async function deleteStore(storeId: string): Promise<void> {
  const db = getAdminDB()
  await db.ref(`stores/${storeId}`).remove()
}

export async function getStores(): Promise<Store[]> {
  return getAllStores()
}
