import admin from "firebase-admin"

let app: admin.app.App
let db: admin.database.Database

export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  } else {
    app = admin.app()
  }

  return app
}

export function getAdminDB(): admin.database.Database {
  if (!db) {
    getFirebaseAdmin()
    db = admin.database()
  }
  return db
}

// Default export for compatibility with default imports
const defaultGetAdminDB = getAdminDB
export default defaultGetAdminDB