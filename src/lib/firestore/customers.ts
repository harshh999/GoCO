import admin from 'firebase-admin'
import getAdminFirestore from '../firestoreAdmin'
import type { Customer } from './types'

const db = getAdminFirestore()
const coll = () => db.collection('customers')

export async function getCustomersByStore(storeId: string): Promise<Customer[]> {
  const q = await coll().where('storeId', '==', storeId).orderBy('createdAt', 'desc').get()
  return q.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Customer))
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const snap = await coll().doc(id).get()
  return snap.exists ? ({ id: snap.id, ...(snap.data() as any) } as Customer) : null
}

export async function createCustomer(data: Partial<Customer>): Promise<Customer> {
  const ref = data.id ? coll().doc(data.id) : coll().doc()
  const payload = { ...data, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }
  await ref.set(payload)
  const snap = await ref.get()
  return { id: snap.id, ...(snap.data() as any) } as Customer
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  await coll().doc(id).set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
  const snap = await coll().doc(id).get()
  return { id: snap.id, ...(snap.data() as any) } as Customer
}

export async function deleteCustomer(id: string): Promise<void> {
  await coll().doc(id).delete()
}

export default { getCustomersByStore, getCustomer, createCustomer, updateCustomer, deleteCustomer }
