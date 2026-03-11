import admin from 'firebase-admin'
import getAdminFirestore from '../firestoreAdmin'
import type { NonPurchaseLead } from './types'

const db = getAdminFirestore()
const coll = () => db.collection('nonPurchaseLeads')

export async function getLeadsByStore(storeId: string): Promise<NonPurchaseLead[]> {
  const q = await coll().where('storeId', '==', storeId).orderBy('createdAt', 'desc').get()
  return q.docs.map(d => ({ id: d.id, ...(d.data() as any) } as NonPurchaseLead))
}

export async function createLead(data: Partial<NonPurchaseLead>): Promise<NonPurchaseLead> {
  const ref = data.id ? coll().doc(data.id) : coll().doc()
  const payload = { ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() }
  await ref.set(payload)
  const snap = await ref.get()
  return { id: snap.id, ...(snap.data() as any) } as NonPurchaseLead
}

export async function deleteLead(id: string): Promise<void> {
  await coll().doc(id).delete()
}

export default { getLeadsByStore, createLead, deleteLead }
