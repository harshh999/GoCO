import admin from 'firebase-admin'
import getAdminFirestore from '../firestoreAdmin'
import type { StoreSettings } from './types'

const db = getAdminFirestore()
const docRef = () => db.collection('storeSettings').doc('default')

export async function getStoreSettings(): Promise<StoreSettings | null> {
  try {
    const snap = await docRef().get()
    return snap.exists ? (snap.data() as StoreSettings) : null
  } catch (err: any) {
    // Firestore can surface a NOT_FOUND error when project/collection isn't available
    // Treat as absence of settings and return null so callers can handle defaults.
    if (err && (err.code === 5 || String(err).includes('NOT_FOUND'))) {
      return null
    }
    throw err
  }
}

export async function updateStoreSettings(data: Partial<StoreSettings>): Promise<void> {
  await docRef().set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
}

export default { getStoreSettings, updateStoreSettings }
