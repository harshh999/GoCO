import getAdminDB from "../firebaseAdmin"
import type { Customer } from "./types"

export async function getCustomersByStore(storeId: string): Promise<Customer[]> {
  const db = getAdminDB()
  const snapshot = await db.ref(`customers/${storeId}`).once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  return Object.entries(data).map(([id, customer]) => ({
    id,
    storeId,
    ...(customer as Omit<Customer, 'id' | 'storeId'>)
  }))
}

export async function getCustomer(storeId: string, customerId: string): Promise<Customer | null> {
  const db = getAdminDB()
  const snapshot = await db.ref(`customers/${storeId}/${customerId}`).once("value")
  
  if (!snapshot.exists()) return null
  
  return {
    id: customerId,
    storeId,
    ...snapshot.val()
  } as Customer
}

export async function createCustomer(storeId: string, customer: Omit<Customer, "id" | "storeId">): Promise<string> {
  const db = getAdminDB()
  const ref = db.ref(`customers/${storeId}`).push()
  
  await ref.set({
    ...customer,
    createdAt: customer.createdAt || Date.now()
  })
  
  return ref.key!
}

export async function updateCustomer(storeId: string, customerId: string, updates: Partial<Customer>): Promise<void> {
  const db = getAdminDB()
  await db.ref(`customers/${storeId}/${customerId}`).update({
    ...updates,
    updatedAt: Date.now()
  })
}

export async function deleteCustomer(storeId: string, customerId: string): Promise<void> {
  const db = getAdminDB()
  await db.ref(`customers/${storeId}/${customerId}`).remove()
}

export async function getAllCustomers(): Promise<Customer[]> {
  const db = getAdminDB()
  const snapshot = await db.ref("customers").once("value")
  const data = snapshot.val()
  
  if (!data) return []
  
  const customers: Customer[] = []
  for (const [storeId, storeCustomers] of Object.entries(data)) {
    for (const [customerId, customer] of Object.entries(storeCustomers as Record<string, any>)) {
      customers.push({
        id: customerId,
        storeId,
        ...customer
      } as Customer)
    }
  }
  
  return customers
}
