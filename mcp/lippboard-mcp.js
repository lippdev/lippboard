#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';
import { promises as fs } from 'node:fs';
import { glob } from 'node:fs/promises';
import { execFile as execFileCb } from 'node:child_process';
import { promisify } from 'node:util';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const execFile = promisify(execFileCb);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(process.env.LIPPBOARD_PROJECT_ROOT || DEFAULT_ROOT);
const LEGACY_STORAGE_HINTS = ['lippboard_pwa_data_v1', 'lippboard_db'];
const ALLOWED_RUN_SCRIPTS = new Set(['build', 'lint']);

function json(content) {
  return { content: [{ type: 'text', text: JSON.stringify(content, null, 2) }] };
}

function resolveInsideRoot(inputPath = '.') {
  const normalized = String(inputPath).replace(/^\/+/, '');
  const resolved = path.resolve(PROJECT_ROOT, normalized);
  const rootWithSep = PROJECT_ROOT.endsWith(path.sep) ? PROJECT_ROOT : `${PROJECT_ROOT}${path.sep}`;
  if (resolved !== PROJECT_ROOT && !resolved.startsWith(rootWithSep)) {
    throw new Error(`Path escapes project root: ${inputPath}`);
  }
  return resolved;
}

async function readTextFile(relPath) {
  const fullPath = resolveInsideRoot(relPath);
  const text = await fs.readFile(fullPath, 'utf8');
  return { path: path.relative(PROJECT_ROOT, fullPath), text };
}

async function writeTextFile(relPath, content) {
  const fullPath = resolveInsideRoot(relPath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf8');
  return { path: path.relative(PROJECT_ROOT, fullPath), bytesWritten: Buffer.byteLength(content, 'utf8') };
}

async function replaceTextInFile(relPath, oldString, newString, replaceAll = false) {
  const fullPath = resolveInsideRoot(relPath);
  const text = await fs.readFile(fullPath, 'utf8');
  const matches = text.includes(oldString);
  if (!matches) {
    throw new Error(`Text not found in ${relPath}`);
  }
  const updated = replaceAll ? text.split(oldString).join(newString) : text.replace(oldString, newString);
  await fs.writeFile(fullPath, updated, 'utf8');
  return {
    path: path.relative(PROJECT_ROOT, fullPath),
    changed: updated !== text,
    bytesWritten: Buffer.byteLength(updated, 'utf8')
  };
}

async function globFiles(pattern, cwd = PROJECT_ROOT) {
  const items = [];
  for await (const file of glob(pattern, { cwd, absolute: true, dot: true, nodir: true })) {
    items.push(file);
  }
  return items;
}

async function searchContent(pattern, { path: relativePath = '.', fileGlob = '**/*.{js,jsx,ts,tsx,css,md,json,yml,yaml,html,svg}', limit = 50 } = {}) {
  const baseDir = resolveInsideRoot(relativePath);
  let regex;
  try {
    regex = new RegExp(pattern, 'i');
  } catch {
    regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }

  const files = await globFiles(fileGlob, baseDir);
  const matches = [];
  for (const file of files) {
    if (matches.length >= limit) break;
    const rel = path.relative(PROJECT_ROOT, file);
    let content;
    try {
      content = await fs.readFile(file, 'utf8');
    } catch {
      continue;
    }
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        matches.push({ path: rel, line: i + 1, content: lines[i].trim() });
        if (matches.length >= limit) break;
      }
    }
  }
  return matches;
}

async function git(args) {
  const { stdout } = await execFile('git', args, { cwd: PROJECT_ROOT, maxBuffer: 1024 * 1024 * 4 });
  return stdout.trim();
}

async function npmScript(scriptName) {
  if (!ALLOWED_RUN_SCRIPTS.has(scriptName)) {
    throw new Error(`Script not allowed: ${scriptName}`);
  }
  const { stdout, stderr } = await execFile('npm', ['run', scriptName], {
    cwd: PROJECT_ROOT,
    maxBuffer: 1024 * 1024 * 8,
    env: {
      ...process.env,
      CI: '1'
    }
  });
  return { stdout: stdout.trim(), stderr: stderr.trim() };
}

async function loadPackageScripts() {
  try {
    const pkg = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
    return pkg.scripts || {};
  } catch {
    return {};
  }
}

const server = new McpServer({
  name: 'lippboard-control',
  version: '1.0.0'
});

server.tool(
  'project_status',
  'Summarize the current project state, git status, and available scripts.',
  {},
  async () => {
    const [branch, status, lastCommit, remoteUrl, scripts] = await Promise.all([
      git(['branch', '--show-current']).catch(() => ''),
      git(['status', '--short']).catch(() => ''),
      git(['log', '-1', '--oneline']).catch(() => ''),
      git(['remote', 'get-url', 'origin']).catch(() => ''),
      loadPackageScripts()
    ]);

    return json({
      ok: true,
      root: PROJECT_ROOT,
      branch,
      status: status ? status.split('\n') : [],
      lastCommit,
      remoteUrl,
      scripts,
      legacyHints: LEGACY_STORAGE_HINTS
    });
  }
);

server.tool(
  'read_repo_file',
  'Read a text file inside the project root.',
  {
    path: z.string().min(1)
  },
  async ({ path: relPath }) => {
    const data = await readTextFile(relPath);
    return json({ ok: true, ...data });
  }
);

server.tool(
  'write_repo_file',
  'Write a text file inside the project root.',
  {
    path: z.string().min(1),
    content: z.string()
  },
  async ({ path: relPath, content }) => {
    const data = await writeTextFile(relPath, content);
    return json({ ok: true, ...data });
  }
);

server.tool(
  'replace_repo_text',
  'Replace text in a file inside the project root.',
  {
    path: z.string().min(1),
    old_string: z.string().min(1),
    new_string: z.string(),
    replace_all: z.boolean().optional()
  },
  async ({ path: relPath, old_string, new_string, replace_all }) => {
    const data = await replaceTextInFile(relPath, old_string, new_string, Boolean(replace_all));
    return json({ ok: true, ...data });
  }
);

server.tool(
  'search_repo',
  'Search text across project files using a regex-like pattern.',
  {
    pattern: z.string().min(1),
    path: z.string().default('.'),
    file_glob: z.string().default('**/*.{js,jsx,ts,tsx,css,md,json,yml,yaml,html,svg}'),
    limit: z.number().int().positive().max(200).default(50)
  },
  async ({ pattern, path: relPath, file_glob, limit }) => {
    const matches = await searchContent(pattern, { path: relPath, fileGlob: file_glob, limit });
    return json({ ok: true, count: matches.length, matches });
  }
);

server.tool(
  'list_repo_files',
  'List files by glob relative to the project root.',
  {
    pattern: z.string().default('**/*'),
    path: z.string().default('.')
  },
  async ({ pattern, path: relPath }) => {
    const baseDir = resolveInsideRoot(relPath);
    const files = await globFiles(pattern, baseDir);
    return json({ ok: true, count: files.length, files: files.map((file) => path.relative(PROJECT_ROOT, file)) });
  }
);

server.tool(
  'run_script',
  'Run an allowed npm script in the project.',
  {
    script: z.enum(['build', 'lint'])
  },
  async ({ script }) => {
    const result = await npmScript(script);
    return json({ ok: true, script, ...result });
  }
);

server.tool(
  'git_commit',
  'Stage files and create a git commit using the requested message.',
  {
    message: z.string().min(1),
    paths: z.array(z.string().min(1)).default(['.'])
  },
  async ({ message, paths }) => {
    const addArgs = ['add', '--'];
    for (const p of paths) addArgs.push(path.relative(PROJECT_ROOT, resolveInsideRoot(p)) || '.');
    await git(addArgs);
    const { stdout } = await execFile('git', ['commit', '-m', message], {
      cwd: PROJECT_ROOT,
      maxBuffer: 1024 * 1024 * 2,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'Filipe Moreira',
        GIT_AUTHOR_EMAIL: 'xfilipepenna2@gmail.com',
        GIT_COMMITTER_NAME: 'Filipe Moreira',
        GIT_COMMITTER_EMAIL: 'xfilipepenna2@gmail.com'
      }
    });
    return json({ ok: true, commitOutput: stdout.trim() });
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Lippboard MCP server failed to start:', error);
  process.exit(1);
});
