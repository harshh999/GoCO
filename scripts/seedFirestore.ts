/**
 * Firestore Seed Script
 * 
 * This script seeds the Firestore database with initial data:
 * - Admin user
 * - Basic categories
 * - Default store settings
 * 
 * Usage:
 *   npx tsx scripts/seedFirestore.ts
 * 
 * Or add to package.json scripts:
 *   "seed": "npx tsx scripts/seedFirestore.ts"
 */

import 'dotenv/config'
import admin from 'firebase-admin'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// Initialize Firebase Admin
function initializeFirebase(): admin.firestore.Firestore {
  if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      admin.initializeApp({ credential: admin.credential.cert(sa) })
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp()
    } else {
      throw new Error(
        'Missing Firebase service account credentials. ' +
        'Set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS'
      )
    }
  }
  return admin.firestore()
}

// Seed data
const ADMIN_USER = {
  id: 'admin-user-001',
  email: 'admin@goco.com',
  // Password: "admin123" - hashed with bcrypt
  password: '$2b$12$KIXxP.VJmC3rJwtL5wE6XeFLW5.1J5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y',
  name: 'Admin',
  role: 'SUPERADMIN',
  storeName: 'GoCo Platform',
  storeDesc: 'The GoCo E-commerce Platform',
  storeType: 'ecommerce',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
}

const BASIC_CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' },
  { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel' },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and garden supplies' },
  { name: 'Sports', slug: 'sports', description: 'Sports equipment and accessories' },
  { name: 'Books', slug: 'books', description: 'Books and publications' },
]

const DEFAULT_STORE_SETTINGS = {
  id: 'default',
  storeName: 'GoCo Store',
  storeTagline: 'Your one-stop shop for everything',
  storeLogo: null,
  currency: 'USD',
  currencySymbol: '$',
  primaryColor: '#3B82F6',
  accentColor: '#10B981',
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
}

async function seedUsers(db: admin.firestore.Firestore) {
  console.log('\n📦 Seeding users...')
  
  const usersRef = db.collection('users')
  
  // Check if admin user already exists
  const existingAdmin = await usersRef.where('email', '==', ADMIN_USER.email).limit(1).get()
  
  if (!existingAdmin.empty) {
    console.log('  ✅ Admin user already exists, skipping...')
    return
  }
  
  // Hash the password properly
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = {
    ...ADMIN_USER,
    password: hashedPassword,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }
  
  await usersRef.doc(ADMIN_USER.id).set(adminUser)
  console.log('  ✅ Created admin user:', ADMIN_USER.email)
}

async function seedCategories(db: admin.firestore.Firestore) {
  console.log('\n📦 Seeding categories...')
  
  const categoriesRef = db.collection('categories')
  
  // Check if categories already exist
  const existingCategories = await categoriesRef.limit(1).get()
  
  if (!existingCategories.empty) {
    console.log('  ✅ Categories already exist, skipping...')
    return
  }
  
  for (const category of BASIC_CATEGORIES) {
    const docRef = categoriesRef.doc()
    await docRef.set({
      ...category,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log(`  ✅ Created category: ${category.name}`)
  }
}

async function seedStoreSettings(db: admin.firestore.Firestore) {
  console.log('\n📦 Seeding store settings...')
  
  const settingsRef = db.collection('storeSettings').doc('default')
  
  // Check if settings already exist
  const existingSettings = await settingsRef.get()
  
  if (existingSettings.exists) {
    console.log('  ✅ Store settings already exist, skipping...')
    return
  }
  
  await settingsRef.set({
    ...DEFAULT_STORE_SETTINGS,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  })
  console.log('  ✅ Created default store settings')
}

async function main() {
  console.log('🚀 Starting Firestore seed...\n')
  console.log('Project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'goretail-b0fa9')
  
  try {
    const db = initializeFirebase()
    
    await seedUsers(db)
    await seedCategories(db)
    await seedStoreSettings(db)
    
    console.log('\n✅ Firestore seed completed successfully!\n')
    console.log('📝 Login credentials:')
    console.log('   Email: admin@goco.com')
    console.log('   Password: admin123')
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  }
}

main()
