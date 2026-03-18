import getAdminDB from "../firebaseAdmin"
import type { Subscription } from "./types"

export async function getSubscriptionsByStore(storeId: string): Promise<Subscription[]> {
  const db = getAdminDB()
  const snapshot = await db.ref(`subscriptions/${storeId}`).once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  return Object.entries(data).map(([id, subscription]) => ({
    id,
    storeId,
    ...(subscription as Omit<Subscription, 'id' | 'storeId'>)
  }))
}

export async function getSubscription(storeId: string, subscriptionId: string): Promise<Subscription | null> {
  const db = getAdminDB()
  const snapshot = await db.ref(`subscriptions/${storeId}/${subscriptionId}`).once("value")
  
  if (!snapshot.exists()) return null
  
  return {
    id: subscriptionId,
    storeId,
    ...snapshot.val()
  } as Subscription
}

export async function createSubscription(storeId: string, subscription: Omit<Subscription, "id" | "storeId">): Promise<string> {
  const db = getAdminDB()
  const ref = db.ref(`subscriptions/${storeId}`).push()
  
  await ref.set({
    ...subscription,
    createdAt: subscription.createdAt || Date.now()
  })
  
  return ref.key!
}

export async function updateSubscription(storeId: string, subscriptionId: string, updates: Partial<Subscription>): Promise<void> {
  const db = getAdminDB()
  await db.ref(`subscriptions/${storeId}/${subscriptionId}`).update({
    ...updates,
    updatedAt: Date.now()
  })
}

export async function deleteSubscription(storeId: string, subscriptionId: string): Promise<void> {
  const db = getAdminDB()
  await db.ref(`subscriptions/${storeId}/${subscriptionId}`).remove()
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const db = getAdminDB()
  const snapshot = await db.ref("subscriptions").once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  const subscriptions: Subscription[] = []
  for (const [storeId, storeSubscriptions] of Object.entries(data)) {
    for (const [subscriptionId, subscription] of Object.entries(storeSubscriptions as Record<string, any>)) {
      subscriptions.push({
        id: subscriptionId,
        storeId,
        ...subscription
      } as Subscription)
    }
  }
  
  return subscriptions
}
