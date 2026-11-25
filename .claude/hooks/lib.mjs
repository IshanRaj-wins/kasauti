// Shared helpers for the project hooks. Every hook must stay crash-proof:
// an exception in a hook should never break the session, so callers wrap
// their work and exit 0 on unexpected errors.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative, isAbsolute } from 'node:path';

export const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

export function readInput() {
  try {
    const raw = readFileSync(0, 'utf8');
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const DEFAULT_CONFIG = {
  name: 'Project',
  codePaths: ['src/', 'app/', 'tests/', 'scripts/'],
  lockedPaths: [],
  gate: [],
  format: [],
  blockedCommands: [],
};

export function loadConfig() {
  const p = join(root, '.claude', 'project.json');
  if (!existsSync(p)) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(readFileSync(p, 'utf8')) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

// Repo-relative path with forward slashes ("" when outside the repo).
export function rel(file) {
  if (!file) return '';
  const abs = isAbsolute(file) ? file : join(root, file);
  const r = relative(root, abs).replace(/\\/g, '/');
  return r.startsWith('..') ? '' : r;
}

export function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 4000,
    }).trim();
  } catch {
    return '';
  }
}

export function readDoc(relPath) {
  const p = join(root, relPath);
  return existsSync(p) ? readFileSync(p, 'utf8').trim() : '';
}

export function block(message) {
  process.stderr.write(`Blocked by ${process.argv[1]?.split(/[\\/]/).pop()}: ${message}\n`);
  process.exit(2);
}
