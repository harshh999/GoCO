import getAdminDB from "../firebaseAdmin"
import type { NonPurchaseLead } from "./types"

export async function getLeadsByStore(storeId: string): Promise<NonPurchaseLead[]> {
  const db = getAdminDB()
  const snapshot = await db.ref(`nonPurchaseLeads/${storeId}`).once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  return Object.entries(data).map(([id, lead]) => ({
    id,
    storeId,
    ...(lead as Omit<NonPurchaseLead, 'id' | 'storeId'>)
  }))
}

export async function getLead(storeId: string, leadId: string): Promise<NonPurchaseLead | null> {
  const db = getAdminDB()
  const snapshot = await db.ref(`nonPurchaseLeads/${storeId}/${leadId}`).once("value")
  
  if (!snapshot.exists()) return null
  
  return {
    id: leadId,
    storeId,
    ...snapshot.val()
  } as NonPurchaseLead
}

export async function createLead(storeId: string, lead: Omit<NonPurchaseLead, "id" | "storeId">): Promise<string> {
  const db = getAdminDB()
  const ref = db.ref(`nonPurchaseLeads/${storeId}`).push()
  
  await ref.set({
    ...lead,
    createdAt: lead.createdAt || Date.now()
  })
  
  return ref.key!
}

export async function getAllLeads(): Promise<NonPurchaseLead[]> {
  const db = getAdminDB()
  const snapshot = await db.ref("nonPurchaseLeads").once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  const leads: NonPurchaseLead[] = []
  for (const [storeId, storeLeads] of Object.entries(data)) {
    for (const [leadId, lead] of Object.entries(storeLeads as Record<string, any>)) {
      leads.push({
        id: leadId,
        storeId,
        ...lead
      } as NonPurchaseLead)
    }
  }
  
  return leads
}
