/**
 * Nu Fried Chicken & Burger — Web & Admin CMS Server
 * Mendukung database MySQL Online (via db.js) maupun fallback JSON lokal.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createDb } = require('./db');

const ROOT = __dirname;
const UPLOAD_DIR = path.join(ROOT, 'assets', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = createDb(ROOT);
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password, salt, expectedHex) {
  const actual = Buffer.from(hashPassword(password, salt), 'hex');
  const expected = Buffer.from(expectedHex, 'hex');
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function createToken(username, secret) {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + 12 * 60 * 60 * 1000 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function readJsonBody(req, maxBytes = 8 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Payload terlalu besar (maksimal 8MB).'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const str = Buffer.concat(chunks).toString('utf8');
        resolve(str ? JSON.parse(str) : {});
      } catch {
        reject(new Error('Format JSON tidak valid.'));
      }
    });
    req.on('error', reject);
  });
}

async function requireAuth(req, res) {
  const authStore = await db.ensureAdminUser();
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const session = verifyToken(token, authStore.tokenSecret);
  if (!session) {
    sendJson(res, 401, { error: 'Sesi admin tidak valid atau sudah berakhir. Silakan login ulang.' });
    return null;
  }
  return { session, authStore };
}

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  try {
    if (urlPath === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, { ok: true, storage: db.getMode() });
    }

    if (urlPath === '/api/login' && req.method === 'POST') {
      const body = await readJsonBody(req, 64 * 1024);
      const authStore = await db.ensureAdminUser();
      const username = String(body.username || '').trim();
      const password = String(body.password || '');

      if (
        username !== authStore.username ||
        !verifyPassword(password, authStore.salt, authStore.passwordHash)
      ) {
        return sendJson(res, 401, { error: 'Username atau password salah.' });
      }

      const token = createToken(username, authStore.tokenSecret);
      return sendJson(res, 200, { token, username, storage: db.getMode() });
    }

    if (urlPath === '/api/auth/me' && req.method === 'GET') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      return sendJson(res, 200, { username: auth.session.u, storage: db.getMode() });
    }

    if (urlPath === '/api/auth/password' && req.method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const body = await readJsonBody(req, 64 * 1024);
      const currentPassword = String(body.currentPassword || '');
      const newPassword = String(body.newPassword || '');

      if (!verifyPassword(currentPassword, auth.authStore.salt, auth.authStore.passwordHash)) {
        return sendJson(res, 400, { error: 'Password saat ini tidak sesuai.' });
      }
      if (newPassword.length < 6) {
        return sendJson(res, 400, { error: 'Password baru minimal 6 karakter.' });
      }

      await db.updateAdminPassword(auth.authStore.username, newPassword);
      return sendJson(res, 200, { ok: true });
    }

    if (urlPath === '/api/content' && req.method === 'GET') {
      return sendJson(res, 200, { overrides: await db.getOverrides(), storage: db.getMode() });
    }

    if (urlPath === '/api/content' && req.method === 'PUT') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const body = await readJsonBody(req, 4 * 1024 * 1024);
      if (!body || typeof body.overrides !== 'object') {
        return sendJson(res, 400, { error: 'Data overrides tidak valid.' });
      }
      await db.saveOverrides(body.overrides);
      return sendJson(res, 200, { ok: true, overrides: body.overrides, storage: db.getMode() });
    }

    if (urlPath === '/api/reset' && req.method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      await db.saveOverrides({});
      return sendJson(res, 200, { ok: true });
    }

    if (urlPath === '/api/leads' && req.method === 'POST') {
      const body = await readJsonBody(req, 64 * 1024);
      const name = String(body.name || '').trim();
      const phone = String(body.phone || '').trim();
      const city = String(body.city || '').trim();
      const packageName = String(body.packageName || '').trim();
      const notes = String(body.notes || '').trim();
      if (!name || !phone || !city) {
        return sendJson(res, 400, { error: 'Nama, Nomor WhatsApp, dan Kota wajib diisi.' });
      }
      const entry = {
        id: `lead-${Date.now()}`,
        name,
        phone,
        city,
        packageName: packageName || 'Belum Memilih',
        notes,
        status: 'Baru',
        createdAt: new Date().toISOString(),
      };
      await db.addLead(entry);
      return sendJson(res, 201, { ok: true, lead: entry });
    }

    if (urlPath === '/api/leads' && req.method === 'GET') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      return sendJson(res, 200, { leads: await db.getLeads() });
    }

    if (urlPath === '/api/leads' && req.method === 'PATCH') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const body = await readJsonBody(req, 32 * 1024);
      const ok = await db.updateLeadStatus(body.id, String(body.status || 'Sudah Dihubungi'));
      if (!ok) return sendJson(res, 404, { error: 'Data prospek tidak ditemukan.' });
      return sendJson(res, 200, { ok: true });
    }

    if (urlPath === '/api/leads' && req.method === 'DELETE') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const body = await readJsonBody(req, 32 * 1024);
      await db.deleteLead(body.id);
      return sendJson(res, 200, { ok: true });
    }

    if (urlPath === '/api/upload' && req.method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const body = await readJsonBody(req, 8 * 1024 * 1024);
      const dataUrl = String(body.dataUrl || '');
      const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/);
      if (!match) {
        return sendJson(res, 400, { error: 'Format gambar harus PNG, JPG, atau WEBP.' });
      }
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.length > 5 * 1024 * 1024) {
        return sendJson(res, 400, { error: 'Ukuran gambar maksimal 5MB.' });
      }

      const rawBase = path.basename(String(body.filename || 'upload'), path.extname(String(body.filename || '')));
      const safeBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40) || 'image';
      const finalName = `${safeBase}-${Date.now()}.${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, finalName), buffer);

      return sendJson(res, 200, { url: `./assets/uploads/${finalName}` });
    }

    // ---- Static Files (Block direct access to internal config/db files) ----
    const relPath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
    if (
      relPath.startsWith('data/') ||
      relPath === 'data' ||
      relPath.startsWith('database/') ||
      relPath === 'database' ||
      relPath === 'server.js' ||
      relPath === 'db.js' ||
      relPath === '.env' ||
      relPath === 'package.json'
    ) {
      res.statusCode = 403;
      return res.end('Forbidden');
    }

    const fullPath = path.resolve(ROOT, relPath);
    if (!fullPath.startsWith(path.resolve(ROOT))) {
      res.statusCode = 403;
      return res.end('Forbidden');
    }

    fs.readFile(fullPath, (err, fileData) => {
      if (err) {
        res.statusCode = 404;
        return res.end('Not Found');
      }
      const ext = path.extname(fullPath).toLowerCase();
      res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
      res.statusCode = 200;
      res.end(fileData);
    });
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Terjadi kesalahan server.' });
  }
});

db.init().then((activeMode) => {
  server.listen(PORT, HOST, () => {
    console.log(`Nu Fried Chicken & Burger server running at http://localhost:${PORT} (storage: ${activeMode})`);
  });
});
