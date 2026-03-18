import * as admin from "firebase-admin"

let db: admin.database.Database | undefined

/**
 * Canonical Firebase Admin initialization for Realtime Database.
 * Uses singleton pattern to prevent multiple initializations.
 * 
 * Environment variables required:
 * - FIREBASE_SERVICE_ACCOUNT_JSON: Service account credentials JSON
 * - FIREBASE_DATABASE_URL: Firebase Realtime Database URL
 */
export function getFirebaseAdmin(): typeof admin {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
      '{"type":"service_account","project_id":"goretail-b0fa9"}'
    )

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`
    })
  }

  return admin
}

/**
 * Returns the Firebase Realtime Database instance.
 * Initializes Firebase Admin if not already initialized.
 */
export function getAdminDB(): admin.database.Database {
  if (!db) {
    getFirebaseAdmin()
    db = admin.database()
  }
  return db
}

/**
 * Default export for backward compatibility
 */
export default getAdminDB
