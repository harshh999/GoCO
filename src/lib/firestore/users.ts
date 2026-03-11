import admin from 'firebase-admin'
import getAdminFirestore from '../firestoreAdmin'
import type { User } from './types'

// Helper function to get users collection
const usersColl = () => getAdminFirestore().collection('users')

export async function getUserById(id: string): Promise<User | null> {
  const snap = await usersColl().doc(id).get()
  return snap.exists ? ({ id: snap.id, ...(snap.data() as any) } as User) : null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const db = getAdminFirestore()
    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as User
  } catch (error) {
    console.error("[getUserByEmail] Error fetching user by email:", error)
    return null
  }
}

export async function createUser(data: Partial<User>): Promise<User> {
  const ref = data.id ? usersColl().doc(data.id) : usersColl().doc()
  const payload = { ...data, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }
  await ref.set(payload)
  const snap = await ref.get()
  return { id: snap.id, ...(snap.data() as any) } as User
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  const ref = usersColl().doc(id)
  await ref.set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
}

export async function deleteUser(id: string): Promise<void> {
  await usersColl().doc(id).delete()
}

export default {
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
}
