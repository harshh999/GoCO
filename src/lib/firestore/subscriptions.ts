import admin from 'firebase-admin'
import getAdminFirestore from '../firestoreAdmin'
import type { Subscription } from './types'

const db = getAdminFirestore()
const coll = () => db.collection('subscriptions')

export async function getSubscriptionByStore(storeId: string): Promise<Subscription | null> {
  const q = await coll().where('storeId', '==', storeId).limit(1).get()
  if (q.empty) return null
  const d = q.docs[0]
  return { id: d.id, ...(d.data() as any) } as Subscription
}

export async function createSubscription(data: Partial<Subscription>): Promise<string> {
  const ref = data.id ? coll().doc(data.id) : coll().doc()
  const payload = { ...data, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }
  await ref.set(payload)
  return ref.id
}

export async function updateSubscription(id: string, data: Partial<Subscription>): Promise<void> {
  await coll().doc(id).set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
}

export async function cancelSubscription(id: string): Promise<void> {
  await coll().doc(id).set({ status: 'cancelled', endDate: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
}

export default { getSubscriptionByStore, createSubscription, updateSubscription, cancelSubscription }
