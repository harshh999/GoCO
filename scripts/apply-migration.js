const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const db = new Database(path.join(process.cwd(), 'prisma', 'dev.db'));

// Apply migration SQL
const sql = fs.readFileSync(
  path.join(process.cwd(), 'prisma/migrations/20260305163050_init/migration.sql'),
  'utf8'
);
db.exec(sql);

// Record migration as applied
db.exec(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  id TEXT PRIMARY KEY,
  checksum TEXT NOT NULL,
  finished_at DATETIME,
  migration_name TEXT NOT NULL,
  logs TEXT,
  rolled_back_at DATETIME,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  applied_steps_count INTEGER NOT NULL DEFAULT 0
)`);

db.prepare(
  `INSERT OR IGNORE INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count) VALUES (?, ?, datetime('now'), ?, 1)`
).run('migration-init-001', 'abc123', '20260305163050_init');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables created:', tables.map(t => t.name).join(', '));
db.close();
console.log('Done!');
