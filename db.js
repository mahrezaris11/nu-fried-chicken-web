/**
 * Database Adapter (SQLite) — Nu Fried Chicken & Burger
 * Menggunakan built-in node:sqlite (Node >= 22.5) tanpa dependency eksternal.
 * Otomatis membuat tabel dari database/schema.sql & memigrasikan data JSON lama jika ada.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

function loadEnvFile(rootDir) {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function createDb(rootDir) {
  loadEnvFile(rootDir);

  const DATA_DIR = path.join(rootDir, 'data');
  const DB_PATH = process.env.SQLITE_PATH
    ? path.resolve(rootDir, process.env.SQLITE_PATH)
    : path.join(DATA_DIR, 'webnu.sqlite');

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  let sqlite = null;
  const mode = 'sqlite';

  function getConn() {
    if (!sqlite) {
      sqlite = new DatabaseSync(DB_PATH);
      sqlite.exec('PRAGMA journal_mode = WAL;');
      sqlite.exec('PRAGMA foreign_keys = ON;');
    }
    return sqlite;
  }

  function migrateLegacyJsonIfNeeded(db) {
    const legacyAuth = path.join(DATA_DIR, 'admin-auth.json');
    const authCount = db.prepare('SELECT COUNT(*) AS cnt FROM admin_users').get().cnt;
    if (authCount === 0 && fs.existsSync(legacyAuth)) {
      try {
        const a = JSON.parse(fs.readFileSync(legacyAuth, 'utf8'));
        if (a && a.username && a.salt && a.passwordHash && a.tokenSecret) {
          db.prepare(
            'INSERT OR IGNORE INTO admin_users (username, salt, password_hash, token_secret) VALUES (?, ?, ?, ?)'
          ).run(a.username, a.salt, a.passwordHash, a.tokenSecret);
        }
      } catch {}
    }

    const legacyOverrides = path.join(DATA_DIR, 'site-overrides.json');
    const cfgCount = db.prepare('SELECT COUNT(*) AS cnt FROM site_config WHERE config_key = ?').get('overrides').cnt;
    if (cfgCount === 0 && fs.existsSync(legacyOverrides)) {
      try {
        const o = JSON.parse(fs.readFileSync(legacyOverrides, 'utf8'));
        if (o && typeof o === 'object') {
          db.prepare('INSERT OR IGNORE INTO site_config (config_key, config_value) VALUES (?, ?)').run(
            'overrides',
            JSON.stringify(o)
          );
        }
      } catch {}
    }

    const legacyLeads = path.join(DATA_DIR, 'leads.json');
    const leadsCount = db.prepare('SELECT COUNT(*) AS cnt FROM leads').get().cnt;
    if (leadsCount === 0 && fs.existsSync(legacyLeads)) {
      try {
        const list = JSON.parse(fs.readFileSync(legacyLeads, 'utf8'));
        if (Array.isArray(list)) {
          const stmt = db.prepare(
            'INSERT OR IGNORE INTO leads (id, name, phone, city, package_name, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          );
          for (const l of list) {
            stmt.run(
              String(l.id || `lead-${Date.now()}`),
              String(l.name || ''),
              String(l.phone || ''),
              String(l.city || ''),
              String(l.packageName || 'Belum Memilih'),
              String(l.notes || ''),
              String(l.status || 'Baru'),
              String(l.createdAt || new Date().toISOString())
            );
          }
        }
      } catch {}
    }
  }

  async function init() {
    const db = getConn();
    const schemaPath = path.join(rootDir, 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schemaSql);
    }
    migrateLegacyJsonIfNeeded(db);
    await ensureAdminUser();
    console.log(`Database connected: SQLite (${DB_PATH})`);
    return mode;
  }

  async function ensureAdminUser() {
    const db = getConn();
    const row = db
      .prepare('SELECT username, salt, password_hash, token_secret FROM admin_users WHERE username = ? LIMIT 1')
      .get('admin');
    if (row) {
      return {
        username: row.username,
        salt: row.salt,
        passwordHash: row.password_hash,
        tokenSecret: row.token_secret,
      };
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword('nuchicken2026', salt);
    const tokenSecret = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO admin_users (username, salt, password_hash, token_secret) VALUES (?, ?, ?, ?)').run(
      'admin',
      salt,
      passwordHash,
      tokenSecret
    );
    return { username: 'admin', salt, passwordHash, tokenSecret };
  }

  async function updateAdminPassword(username, newPassword) {
    const db = getConn();
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashPassword(newPassword, newSalt);
    db.prepare(
      'UPDATE admin_users SET salt = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?'
    ).run(newSalt, newHash, username);
  }

  async function getOverrides() {
    const db = getConn();
    const row = db.prepare('SELECT config_value FROM site_config WHERE config_key = ? LIMIT 1').get('overrides');
    if (!row) return {};
    try {
      return JSON.parse(row.config_value);
    } catch {
      return {};
    }
  }

  async function saveOverrides(overrides) {
    const db = getConn();
    const clean = overrides || {};

    db.exec('BEGIN');
    try {
      db.prepare(
        `INSERT INTO site_config (config_key, config_value, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(config_key) DO UPDATE SET
           config_value = excluded.config_value,
           updated_at = CURRENT_TIMESTAMP`
      ).run('overrides', JSON.stringify(clean));

      if (Array.isArray(clean.packages)) {
        db.exec('DELETE FROM partnership_packages');
        const pkgStmt = db.prepare(
          `INSERT INTO partnership_packages
            (id, name, price, price_label, price_unit, badge, popular, tagline, image_url, unit_name, material, dimensions, has_branding_promo, facilities_json, bep_json, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        for (let i = 0; i < clean.packages.length; i++) {
          const p = clean.packages[i];
          pkgStmt.run(
            String(p.id),
            String(p.name || ''),
            Number(p.price) || 0,
            String(p.priceLabel || ''),
            String(p.priceUnit || 'JUTA'),
            String(p.badge || ''),
            p.popular ? 1 : 0,
            String(p.tagline || ''),
            String(p.image || ''),
            String(p.unitName || ''),
            String(p.material || ''),
            String(p.dimensions || ''),
            p.hasBrandingPromo ? 1 : 0,
            JSON.stringify(p.facilities || []),
            JSON.stringify(p.bep || {}),
            i
          );
        }
      } else {
        db.exec('DELETE FROM partnership_packages');
      }

      if (Array.isArray(clean.menuItems)) {
        db.exec('DELETE FROM menu_items');
        const menuStmt = db.prepare(
          `INSERT INTO menu_items
            (id, category, name, badge, badge_color, price_start, image_url, description, variants_json, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        for (let i = 0; i < clean.menuItems.length; i++) {
          const m = clean.menuItems[i];
          menuStmt.run(
            String(m.id),
            String(m.category || ''),
            String(m.name || ''),
            String(m.badge || ''),
            String(m.badgeColor || 'red'),
            String(m.priceStart || ''),
            String(m.image || ''),
            String(m.description || ''),
            JSON.stringify(m.variants || []),
            i
          );
        }
      } else {
        db.exec('DELETE FROM menu_items');
      }

      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  async function getLeads() {
    const db = getConn();
    return db
      .prepare(
        'SELECT id, name, phone, city, package_name AS packageName, notes, status, created_at AS createdAt FROM leads ORDER BY created_at DESC'
      )
      .all();
  }

  async function addLead(entry) {
    const db = getConn();
    db.prepare(
      'INSERT INTO leads (id, name, phone, city, package_name, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      entry.id,
      entry.name,
      entry.phone,
      entry.city,
      entry.packageName,
      entry.notes || '',
      entry.status || 'Baru',
      entry.createdAt || new Date().toISOString()
    );
    return entry;
  }

  async function updateLeadStatus(id, status) {
    const db = getConn();
    const res = db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, id);
    return res.changes > 0;
  }

  async function deleteLead(id) {
    const db = getConn();
    db.prepare('DELETE FROM leads WHERE id = ?').run(id);
  }

  return {
    init,
    getMode: () => mode,
    ensureAdminUser,
    updateAdminPassword,
    getOverrides,
    saveOverrides,
    getLeads,
    addLead,
    updateLeadStatus,
    deleteLead,
  };
}

module.exports = { createDb };
