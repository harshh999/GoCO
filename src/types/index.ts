export type UserRole = "SUPER_ADMIN" | "ADMIN" | "GUEST";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  order: number;
  productId: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  sku?: string | null;
  inStock: boolean;
  featured: boolean;
  categoryId?: string | null;
  category?: Category | null;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  storeTagline?: string | null;
  storeLogo?: string | null;
  currency: string;
  currencySymbol: string;
  primaryColor: string;
  accentColor: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
