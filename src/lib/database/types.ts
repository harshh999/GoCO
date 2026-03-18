// User roles
export type UserRole = 'superadmin' | 'admin' | 'customer'
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN'

// Store - represents a store in the multi-tenant system
export interface Store {
  id: string
  name?: string
  ownerEmail?: string
  storeName?: string | null
  storeDesc?: string | null
  storeType?: string | null
  createdAt?: number
  subscriptionStart?: number
  subscriptionEnd?: number
  plan?: string
  status?: string
}

// User - represents admin users in the system
export interface User {
  id: string
  email: string
  password?: string
  passwordHash?: string
  name: string
  role?: AdminRole | string
  storeId?: string | null
  storeName?: string | null
  storeDesc?: string | null
  storeType?: string | null
  is2FAEnabled?: boolean
  secretKey?: string | null
  createdAt?: number
  updatedAt?: number
}

// Category with storeId for multi-tenant support
export interface Category {
  id: string
  storeId: string
  name: string
  slug: string
  description?: string | null
  createdAt?: number
  updatedAt?: number
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
  category?: Category | null
  storeId?: string | null
  createdAt?: number
  updatedAt?: number
  images?: ProductImage[]
}

export interface ProductImage {
  id?: string
  url: string
  alt?: string | null
  isPrimary?: boolean
  order?: number
  productId?: string | null
  createdAt?: number
}

export type { ProductImage as ProductImageType }

export interface StoreSettings {
  id?: string
  storeName?: string
  storeTagline?: string | null
  storeLogo?: string | null
  currency?: string
  currencySymbol?: string
  primaryColor?: string
  accentColor?: string
  updatedAt?: number
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
  lastPurchaseDate?: number
  createdAt?: number
  updatedAt?: number
}

export interface NonPurchaseLead {
  id: string
  name: string
  phone: string
  reason?: string | null
  message?: string | null
  storeId?: string | null
  createdAt?: number
}

export interface Subscription {
  id: string
  storeId: string
  startDate?: number
  endDate?: number
  plan?: string
  status?: string
  createdAt?: number
  updatedAt?: number
}

// Request - product requests from customers
export interface Request {
  id: string
  storeId: string
  productId?: string | null
  customerName: string
  customerPhone?: string | null
  customerEmail?: string | null
  message?: string | null
  status?: string
  createdAt?: number
  updatedAt?: number
}
