const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'prisma', 'dev.db'));

// Check if column already exists
const cols = db.prepare("PRAGMA table_info(User)").all();
const hasStoreName = cols.some(c => c.name === 'storeName');

if (hasStoreName) {
  console.log('storeName column already exists, skipping.');
} else {
  db.exec('ALTER TABLE "User" ADD COLUMN "storeName" TEXT');
  console.log('✅ Added storeName column to User table.');
}

db.close();
