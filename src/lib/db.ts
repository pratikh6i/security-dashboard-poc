import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'cloudguard.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  const database = db!;

  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT
    )
  `);

  // Clients table
  database.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      gcp_project_id TEXT,
      industry TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Uploads table
  database.exec(`
    CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'manual',
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      findings_json TEXT,
      total_findings INTEGER DEFAULT 0,
      critical_count INTEGER DEFAULT 0,
      high_count INTEGER DEFAULT 0,
      medium_count INTEGER DEFAULT 0,
      low_count INTEGER DEFAULT 0,
      passed_count INTEGER DEFAULT 0,
      failed_count INTEGER DEFAULT 0,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
    CREATE INDEX IF NOT EXISTS idx_uploads_client ON uploads(client_id);
    CREATE INDEX IF NOT EXISTS idx_uploads_timestamp ON uploads(timestamp);
  `);
}

// User operations
export function createUser(username: string, passwordHash: string) {
  const db = getDb();
  const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
  return stmt.run(username, passwordHash);
}

export function getUserByUsername(username: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username) as { id: number; username: string; password_hash: string } | undefined;
}

export function updateLastLogin(userId: number) {
  const db = getDb();
  const stmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
  return stmt.run(userId);
}

// Client operations
export function createClient(userId: number, name: string, gcpProjectId?: string, industry?: string, notes?: string) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO clients (user_id, name, gcp_project_id, industry, notes) 
    VALUES (?, ?, ?, ?, ?)
  `);
  return stmt.run(userId, name, gcpProjectId || null, industry || null, notes || null);
}

export function getClientsByUser(userId: number) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId);
}

export function getClientById(clientId: number, userId: number) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?');
  return stmt.get(clientId, userId);
}

export function updateClient(clientId: number, userId: number, data: { name?: string; gcpProjectId?: string; industry?: string; notes?: string }) {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name) { fields.push('name = ?'); values.push(data.name); }
  if (data.gcpProjectId !== undefined) { fields.push('gcp_project_id = ?'); values.push(data.gcpProjectId || null); }
  if (data.industry !== undefined) { fields.push('industry = ?'); values.push(data.industry || null); }
  if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes || null); }

  if (fields.length === 0) return;

  values.push(clientId, userId);
  const stmt = db.prepare(`UPDATE clients SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`);
  return stmt.run(...values);
}

export function deleteClient(clientId: number, userId: number) {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM clients WHERE id = ? AND user_id = ?');
  return stmt.run(clientId, userId);
}

// Upload operations
export interface UploadData {
  clientId: number;
  name: string;
  type: 'scan' | 'manual' | 'import';
  findings: unknown[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    passed: number;
    failed: number;
  };
}

export function createUpload(data: UploadData) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO uploads (
      client_id, name, type, findings_json, 
      total_findings, critical_count, high_count, medium_count, low_count,
      passed_count, failed_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    data.clientId,
    data.name,
    data.type,
    JSON.stringify(data.findings),
    data.summary.total,
    data.summary.critical,
    data.summary.high,
    data.summary.medium,
    data.summary.low,
    data.summary.passed,
    data.summary.failed
  );
}

export function getUploadsByClient(clientId: number) {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, client_id, name, type, timestamp, 
           total_findings, critical_count, high_count, medium_count, low_count,
           passed_count, failed_count
    FROM uploads 
    WHERE client_id = ? 
    ORDER BY timestamp DESC
  `);
  return stmt.all(clientId);
}

export function getUploadById(uploadId: number, clientId: number) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM uploads WHERE id = ? AND client_id = ?');
  const row = stmt.get(uploadId, clientId) as Record<string, unknown> | undefined;
  if (row && row.findings_json) {
    row.findings = JSON.parse(row.findings_json as string);
    delete row.findings_json;
  }
  return row;
}

export function getUploadsByDateRange(clientId: number, startDate: string, endDate: string) {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM uploads 
    WHERE client_id = ? AND timestamp >= ? AND timestamp <= ?
    ORDER BY timestamp DESC
  `);
  const rows = stmt.all(clientId, startDate, endDate) as Array<Record<string, unknown>>;
  return rows.map((row) => {
    if (row.findings_json) {
      row.findings = JSON.parse(row.findings_json as string);
      delete row.findings_json;
    }
    return row;
  });
}

export function deleteUpload(uploadId: number, clientId: number) {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM uploads WHERE id = ? AND client_id = ?');
  return stmt.run(uploadId, clientId);
}

export function getClientStats(clientId: number) {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total_uploads,
      SUM(total_findings) as total_findings,
      SUM(critical_count) as total_critical,
      SUM(high_count) as total_high,
      SUM(medium_count) as total_medium,
      SUM(low_count) as total_low,
      SUM(passed_count) as total_passed,
      SUM(failed_count) as total_failed
    FROM uploads 
    WHERE client_id = ?
  `);
  return stmt.get(clientId);
}
