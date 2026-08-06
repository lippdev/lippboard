import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDefaultState } from '../src/services/defaultState.js';
import { createAuth } from './auth.js';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const DB_PATH = process.env.LIPPBOARD_DB_PATH || path.join(ROOT, 'data', 'lippboard.sqlite');
const DB_DIR = path.dirname(DB_PATH);
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_SYNC_ENABLED = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const PORT = Number(process.env.PORT || process.env.LIPPBOARD_PORT || 4174);
const supabase = SUPABASE_SYNC_ENABLED
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const { authHandler, database, getSessionFromRequest, isFirstRun } = createAuth(DB_PATH);

database.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const defaultState = createDefaultState();
const existingState = database.prepare('SELECT payload FROM app_state WHERE id = 1').get();
if (!existingState) {
  database.prepare('INSERT INTO app_state (id, payload, updated_at) VALUES (1, ?, ?)')
    .run(JSON.stringify(defaultState), new Date().toISOString());
}

function nowIso() {
  return new Date().toISOString();
}

async function ensureSupabaseAppStateRow() {
  if (!supabase) return;
  const { data, error } = await supabase.from('app_state').select('id').eq('id', 1).maybeSingle();
  if (error) throw error;
  if (!data) {
    const { error: insertError } = await supabase.from('app_state').insert({
      id: 1,
      payload: defaultState,
      updated_at: nowIso(),
    });
    if (insertError) throw insertError;
  }
}

async function readAppState() {
  if (supabase) {
    await ensureSupabaseAppStateRow();
    const { data, error } = await supabase.from('app_state').select('payload').eq('id', 1).maybeSingle();
    if (error) throw error;
    return data?.payload ? { ...createDefaultState(), ...data.payload } : createDefaultState();
  }

  const row = database.prepare('SELECT payload FROM app_state WHERE id = 1').get();
  return row ? JSON.parse(row.payload) : createDefaultState();
}

async function saveAppState(state) {
  if (supabase) {
    const { error } = await supabase.from('app_state').upsert({
      id: 1,
      payload: state,
      updated_at: nowIso(),
    }, { onConflict: 'id' });
    if (error) throw error;
    return;
  }

  database.prepare('UPDATE app_state SET payload = ?, updated_at = ? WHERE id = 1').run(JSON.stringify(state), nowIso());
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

function serveStatic(req, res) {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const publicPath = path.join(DIST_DIR, safePath);
  const resolved = path.normalize(publicPath);
  if (!resolved.startsWith(DIST_DIR)) return text(res, 403, 'Forbidden');

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
      const session = await getSessionFromRequest(req);
      return json(res, 200, {
        ok: true,
        database: true,
        syncTarget: SUPABASE_SYNC_ENABLED ? 'supabase' : 'sqlite',
        authenticated: Boolean(session),
        firstRun: await isFirstRun(),
        userCount: await (async () => {
          try {
            const row = database.prepare('SELECT COUNT(*) AS count FROM user').get();
            return Number(row?.count || 0);
          } catch {
            return 0;
          }
        })(),
      });
    }

    if (url.pathname === '/api/auth/status' && req.method === 'GET') {
      const session = await getSessionFromRequest(req);
      return json(res, 200, {
        backendAvailable: true,
        authenticated: Boolean(session),
        firstRun: await isFirstRun(),
        passkeyRegistered: false,
        user: session?.user
          ? {
              username: session.user.email,
              displayName: session.user.name,
            }
          : null,
      });
    }

    if (url.pathname.startsWith('/api/auth/') && url.pathname !== '/api/auth/status') {
      return authHandler(req, res);
    }

    if (url.pathname === '/api/state' && req.method === 'GET') {
      const session = await getSessionFromRequest(req);
      if (!session) return json(res, 401, { error: 'Não autenticado.' });
      return json(res, 200, { ok: true, state: await readAppState() });
    }

    if (url.pathname === '/api/state' && req.method === 'PUT') {
      const session = await getSessionFromRequest(req);
      if (!session) return json(res, 401, { error: 'Não autenticado.' });
      const body = await new Promise((resolve, reject) => {
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
          } catch {
            reject(new Error('JSON inválido'));
          }
        });
        req.on('error', reject);
      });
      if (!body || typeof body.state !== 'object' || Array.isArray(body.state)) {
        return json(res, 400, { error: 'Estado inválido.' });
      }
      const nextState = { ...createDefaultState(), ...body.state };
      await saveAppState(nextState);
      return json(res, 200, { ok: true });
    }

    if (url.pathname === '/api/state/reset' && req.method === 'POST') {
      const session = await getSessionFromRequest(req);
      if (!session) return json(res, 401, { error: 'Não autenticado.' });
      await saveAppState(createDefaultState());
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

async function portHasHealthyLippBoard(port) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: controller.signal });
    clearTimeout(timer);
    return response.ok;
  } catch {
    return false;
  }
}

server.on('error', async (error) => {
  if (error?.code === 'EADDRINUSE') {
    const healthy = await portHasHealthyLippBoard(PORT);
    if (healthy) {
      console.log(`Lipp Board already running on http://0.0.0.0:${PORT}`);
      process.exit(0);
      return;
    }
    console.error(`Port ${PORT} is already in use and no healthy Lipp Board is answering there.`);
  }
  process.exit(1);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lipp Board server listening on http://0.0.0.0:${PORT}`);
});
