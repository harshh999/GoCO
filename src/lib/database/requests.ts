import getAdminDB from "../firebaseAdmin"
import type { Request } from "./types"

export async function getRequestsByStore(storeId: string): Promise<Request[]> {
  const db = getAdminDB()
  const snapshot = await db.ref(`requests/${storeId}`).once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  return Object.entries(data).map(([id, request]) => ({
    id,
    storeId,
    ...(request as Omit<Request, 'id' | 'storeId'>)
  }))
}

export async function getRequest(storeId: string, requestId: string): Promise<Request | null> {
  const db = getAdminDB()
  const snapshot = await db.ref(`requests/${storeId}/${requestId}`).once("value")
  
  if (!snapshot.exists()) return null
  
  return {
    id: requestId,
    storeId,
    ...snapshot.val()
  } as Request
}

export async function createRequest(storeId: string, request: Omit<Request, "id" | "storeId">): Promise<string> {
  const db = getAdminDB()
  const ref = db.ref(`requests/${storeId}`).push()
  
  await ref.set({
    ...request,
    createdAt: request.createdAt || Date.now()
  })
  
  return ref.key!
}

export async function updateRequest(storeId: string, requestId: string, updates: Partial<Request>): Promise<void> {
  const db = getAdminDB()
  await db.ref(`requests/${storeId}/${requestId}`).update({
    ...updates,
    updatedAt: Date.now()
  })
}

export async function deleteRequest(storeId: string, requestId: string): Promise<void> {
  const db = getAdminDB()
  await db.ref(`requests/${storeId}/${requestId}`).remove()
}

export async function getAllRequests(): Promise<Request[]> {
  const db = getAdminDB()
  const snapshot = await db.ref("requests").once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  const requests: Request[] = []
  for (const [storeId, storeRequests] of Object.entries(data)) {
    for (const [requestId, request] of Object.entries(storeRequests as Record<string, any>)) {
      requests.push({
        id: requestId,
        storeId,
        ...request
      } as Request)
    }
  }
  
  return requests
}
