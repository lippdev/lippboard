import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_INDEX = path.join(ROOT, 'dist', 'index.html');

if (!existsSync(DIST_INDEX)) {
  throw new Error('dist/index.html ausente. Rode npm run build antes do smoke test.');
}

const tmpRoot = mkdtempSync(path.join(tmpdir(), 'lippboard-smoke-'));
const dbPath = path.join(tmpRoot, 'lippboard.sqlite');
const port = 4199;
const baseUrl = `http://127.0.0.1:${port}`;

const proc = spawn(process.execPath, ['server/index.js'], {
  cwd: ROOT,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(port),
    LIPPBOARD_DB_PATH: dbPath,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let output = '';
proc.stdout.on('data', (chunk) => { output += chunk.toString(); });
proc.stderr.on('data', (chunk) => { output += chunk.toString(); });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const finished = new Promise((resolve) => proc.once('exit', (code) => resolve(code ?? 0)));

async function waitForHealth() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      // keep waiting
    }
    await wait(250);
  }
  throw new Error(`Servidor não subiu a tempo.\n${output}`);
}

try {
  await waitForHealth();

  const health = await fetch(`${baseUrl}/api/health`).then((res) => res.json());
  assert.equal(health.ok, true);
  assert.equal(health.database, true);
  assert.equal(health.userCount, 0);

  const authStatus = await fetch(`${baseUrl}/api/auth/status`).then((res) => res.json());
  assert.equal(authStatus.backendAvailable, true);
  assert.equal(authStatus.authenticated, false);
  assert.equal(authStatus.firstRun, true);
  assert.equal(authStatus.passkeyRegistered, false);

  console.log('Smoke check OK');
} finally {
  proc.kill('SIGTERM');
  await Promise.race([finished, wait(3000)]);
  if (!proc.killed) proc.kill('SIGKILL');
  rmSync(tmpRoot, { recursive: true, force: true });
}
