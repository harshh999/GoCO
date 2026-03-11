import type admin from 'firebase-admin'

export interface User {
  id: string
  email: string
  password: string
  name: string
  role?: string
  storeName?: string | null
  storeDesc?: string | null
  storeType?: string | null
  is2FAEnabled?: boolean
  secretKey?: string | null
  createdAt?: admin.firestore.Timestamp | null
  updatedAt?: admin.firestore.Timestamp | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  createdAt?: admin.firestore.Timestamp | null
  updatedAt?: admin.firestore.Timestamp | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number
  comparePrice?: number | null
  sku?: string | null
  inStock?: boolean
  featured?: boolean
  categoryId?: string | null
  storeId?: string | null
  createdAt?: admin.firestore.Timestamp | null
  updatedAt?: admin.firestore.Timestamp | null
}

export interface ProductImage {
  id: string
  url: string
  alt?: string | null
  isPrimary?: boolean
  order?: number
  createdAt?: admin.firestore.Timestamp | null
}

export interface StoreSettings {
  id?: string
  storeName?: string
  storeTagline?: string | null
  storeLogo?: string | null
  currency?: string
  currencySymbol?: string
  primaryColor?: string
  accentColor?: string
  updatedAt?: admin.firestore.Timestamp | null
}

export interface Customer {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  businessName?: string | null
  address?: string | null
  city?: string | null
  notes?: string | null
  status?: string
  storeId?: string | null
  totalPurchases?: number
  lastPurchaseDate?: admin.firestore.Timestamp | null
  createdAt?: admin.firestore.Timestamp | null
  updatedAt?: admin.firestore.Timestamp | null
}

export interface NonPurchaseLead {
  id: string
  name: string
  phone: string
  reason?: string | null
  message?: string | null
  storeId?: string | null
  createdAt?: admin.firestore.Timestamp | null
}

export interface Subscription {
  id: string
  storeId: string
  planName?: string
  startDate?: admin.firestore.Timestamp | null
  endDate?: admin.firestore.Timestamp | null
  status?: string
  createdAt?: admin.firestore.Timestamp | null
  updatedAt?: admin.firestore.Timestamp | null
}
