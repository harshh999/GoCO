import getAdminDB from "../firebaseAdmin"
import type { User } from "./types"

export async function getAllUsers(): Promise<User[]> {
  const db = getAdminDB()
  const snapshot = await db.ref("users").once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  return Object.entries(data).map(([id, user]) => {
    return Object.assign({ id }, user as User)
  })
}

export async function getUser(userId: string): Promise<User | null> {
  const db = getAdminDB()
  const snapshot = await db.ref(`users/${userId}`).once("value")
  
  if (!snapshot.exists()) return null
  
  return Object.assign({ id: userId }, snapshot.val()) as User
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getAdminDB()
  const snapshot = await db.ref("users").orderByChild("email").equalTo(email).once("value")
  const data = snapshot.val()
  
  if (!data) return null
  
  const [id, user] = Object.entries(data)[0]
  return Object.assign({ id }, user as User) as User
}

export async function createUser(userId: string, user: Omit<User, "id">): Promise<void> {
  const db = getAdminDB()
  await db.ref(`users/${userId}`).set({
    ...user,
    createdAt: user.createdAt || Date.now()
  })
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const db = getAdminDB()
  await db.ref(`users/${userId}`).update({
    ...updates,
    updatedAt: Date.now()
  })
}

export async function deleteUser(userId: string): Promise<void> {
  const db = getAdminDB()
  await db.ref(`users/${userId}`).remove()
}

export async function getUsers(): Promise<User[]> {
  return getAllUsers()
}

export async function getUserByStoreId(storeId: string): Promise<User | null> {
  const db = getAdminDB()
  const snapshot = await db.ref("users").orderByChild("storeId").equalTo(storeId).once("value")
  const data = snapshot.val()
  
  if (!data) return null
  
  const [id, user] = Object.entries(data)[0]
  return Object.assign({ id }, user as User) as User
}
