import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { createDefaultState } from '../src/services/defaultState.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const DB_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DB_DIR, 'lippboard.sqlite');
const PORT = Number(process.env.PORT || process.env.LIPPBOARD_PORT || 4174);
const COOKIE_NAME = 'lippboard_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_hash TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const defaultState = createDefaultState();
const existingState = db.prepare('SELECT payload FROM app_state WHERE id = 1').get();
if (!existingState) {
  db.prepare('INSERT INTO app_state (id, payload, updated_at) VALUES (1, ?, ?)')
    .run(JSON.stringify(defaultState), new Date().toISOString());
}

function nowIso() {
  return new Date().toISOString();
}

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function text(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function parseCookies(header = '') {
  return Object.fromEntries(
    header.split(';').filter(Boolean).map((part) => {
      const index = part.indexOf('=');
      if (index === -1) return [part.trim(), ''];
      return [decodeURIComponent(part.slice(0, index).trim()), decodeURIComponent(part.slice(index + 1).trim())];
    })
  );
}

function isSecureRequest(req) {
  return req.socket.encrypted || String(req.headers['x-forwarded-proto'] || '').includes('https');
}

function setSessionCookie(res, token, req = null) {
  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (process.env.NODE_ENV === 'production' || process.env.LIPPBOARD_COOKIE_SECURE === '1' || process.env.LIPPBOARD_COOKIE_SECURE === 'true' || (req && isSecureRequest(req))) {
    attrs.push('Secure');
  }
  res.setHeader('Set-Cookie', attrs.join('; '));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('base64')) {
  const hash = crypto.pbkdf2Sync(password, salt, 210000, 32, 'sha256').toString('base64');
  return { hash, salt };
}

function verifyPassword(password, storedHash, storedSalt) {
  const derived = crypto.pbkdf2Sync(password, storedSalt, 210000, 32, 'sha256').toString('base64');
  return crypto.timingSafeEqual(Buffer.from(derived), Buffer.from(storedHash));
}

function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase();
}

function getUserCount() {
  return db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
}

function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  const tokenHash = hashToken(token);
  const row = db.prepare(`
    SELECT sessions.id, sessions.user_id, sessions.expires_at, users.username, users.display_name
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ?
  `).get(tokenHash);

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(row.id);
    return null;
  }

  return row;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
      if (Buffer.concat(chunks).length > 2 * 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (err) {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

function withAppState(handler) {
  const row = db.prepare('SELECT payload FROM app_state WHERE id = 1').get();
  const state = row ? JSON.parse(row.payload) : createDefaultState();
  return handler(state);
}

function saveAppState(state) {
  db.prepare('UPDATE app_state SET payload = ?, updated_at = ? WHERE id = 1').run(JSON.stringify(state), nowIso());
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
  db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(tokenHash, userId, createdAt, expiresAt);
  return token;
}

function buildAuthPayload(req) {
  const session = getSessionFromRequest(req);
  const firstRun = getUserCount() === 0;
  if (!session) {
    return { backendAvailable: true, authenticated: false, firstRun, user: null };
  }
  return {
    backendAvailable: true,
    authenticated: true,
    firstRun: false,
    user: {
      username: session.username,
      displayName: session.display_name,
    },
  };
}

function serveStatic(req, res) {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const publicPath = path.join(DIST_DIR, safePath);
  const resolved = path.normalize(publicPath);
  if (!resolved.startsWith(DIST_DIR)) {
    return text(res, 403, 'Forbidden');
  }

  let filePath = resolved;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) {
    const fallback = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(fallback)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      return fs.createReadStream(fallback).pipe(res);
    }
    return text(res, 404, 'Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
  };
  res.writeHead(200, {
    'Content-Type': contentTypes[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/health' && req.method === 'GET') {
      return json(res, 200, { ok: true, database: true, userCount: getUserCount() });
    }

    if (url.pathname === '/api/auth/status' && req.method === 'GET') {
      return json(res, 200, buildAuthPayload(req));
    }

    if (url.pathname === '/api/auth/bootstrap' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const username = normalizeUsername(body.username);
      const displayName = String(body.displayName || body.username || '').trim();
      const password = String(body.password || '');

      if (getUserCount() > 0) {
        return json(res, 409, { error: 'Já existe um usuário. Use login.' });
      }
      if (!username || !displayName || password.length < 8) {
        return json(res, 400, { error: 'Preencha usuário, nome e senha com pelo menos 8 caracteres.' });
      }

      const { hash, salt } = hashPassword(password);
      const createdAt = nowIso();
      const result = db.prepare(`
        INSERT INTO users (username, display_name, password_hash, password_salt, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(username, displayName, hash, salt, createdAt, createdAt);
      const token = createSession(result.lastInsertRowid);
      setSessionCookie(res, token, req);
      return json(res, 200, { ok: true, user: { username, displayName } });
    }

    if (url.pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const username = normalizeUsername(body.username);
      const password = String(body.password || '');
      const user = db.prepare('SELECT id, username, display_name, password_hash, password_salt FROM users WHERE username = ?').get(username);
      if (!user || !password || !verifyPassword(password, user.password_hash, user.password_salt)) {
        return json(res, 401, { error: 'Usuário ou senha inválidos.' });
      }
      const token = createSession(user.id);
      setSessionCookie(res, token, req);
      return json(res, 200, { ok: true, user: { username: user.username, displayName: user.display_name } });
    }

    if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
      const session = getSessionFromRequest(req);
      if (session) db.prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
      clearSessionCookie(res);
      return json(res, 200, { ok: true });
    }

    if (url.pathname === '/api/state' && req.method === 'GET') {
      const session = getSessionFromRequest(req);
      if (!session) return json(res, 401, { error: 'Não autenticado.' });
      return withAppState((state) => json(res, 200, { ok: true, state }));
    }

    if (url.pathname === '/api/state' && req.method === 'PUT') {
      const session = getSessionFromRequest(req);
      if (!session) return json(res, 401, { error: 'Não autenticado.' });
      const body = await readJsonBody(req);
      if (!body || typeof body.state !== 'object' || Array.isArray(body.state)) {
        return json(res, 400, { error: 'Estado inválido.' });
      }
      const nextState = { ...createDefaultState(), ...body.state };
      saveAppState(nextState);
      return json(res, 200, { ok: true });
    }

    if (url.pathname === '/api/state/reset' && req.method === 'POST') {
      const session = getSessionFromRequest(req);
      if (!session) return json(res, 401, { error: 'Não autenticado.' });
      const nextState = createDefaultState();
      saveAppState(nextState);
      return json(res, 200, { ok: true });
    }

    if (req.method === 'GET') {
      return serveStatic(req, res);
    }

    return text(res, 404, 'Not Found');
  } catch (err) {
    console.error('Server error:', err);
    return json(res, 500, { error: err.message || 'Erro interno' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lipp Board server listening on http://0.0.0.0:${PORT}`);
});
