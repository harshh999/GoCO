import getAdminDB from "../firebaseAdmin"
import type { StoreSettings } from "./types"

export async function getStoreSettings(storeId?: string): Promise<StoreSettings | null> {
  const db = getAdminDB()
  const docId = storeId ?? 'default'
  const snapshot = await db.ref(`storeSettings/${docId}`).once("value")
  
  if (!snapshot.exists()) return null
  
  return {
    id: docId,
    ...snapshot.val()
  } as StoreSettings
}

export async function updateStoreSettings(storeId: string | undefined, data: Partial<StoreSettings>): Promise<void> {
  const db = getAdminDB()
  const docId = storeId ?? 'default'
  await db.ref(`storeSettings/${docId}`).update({
    ...data,
    updatedAt: Date.now()
  })
}

export async function createStoreSettings(storeId: string | undefined, data: Omit<StoreSettings, "id">): Promise<void> {
  const db = getAdminDB()
  const docId = storeId ?? 'default'
  await db.ref(`storeSettings/${docId}`).set({
    ...data,
    updatedAt: Date.now()
  })
}
