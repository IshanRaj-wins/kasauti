// PostToolUse (Edit | Write | MultiEdit): format the file that was just changed,
// so formatting never piles up for the gate. Rules come from project.json → format:
//   [{ "ext": [".py"], "cmd": ["uv", "run", "ruff", "format", "{file}"], "cwd": "." }]
// A missing formatter is skipped silently; formatting never blocks.
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, extname, isAbsolute } from 'node:path';
import { readInput, loadConfig, root } from './lib.mjs';

try {
  const input = readInput();
  const raw = String(input.tool_input?.file_path ?? '');
  const file = raw && (isAbsolute(raw) ? raw : join(root, raw));
  if (!file || !existsSync(file)) process.exit(0);
  const ext = extname(file).toLowerCase();
  const cfg = loadConfig();
  for (const rule of cfg.format || []) {
    if (!(rule.ext || []).includes(ext)) continue;
    const [bin, ...args] = rule.cmd.map((a) => (a === '{file}' ? file : a));
    spawnSync(bin, args, {
      cwd: join(root, rule.cwd || '.'),
      stdio: 'ignore',
      shell: process.platform === 'win32',
      timeout: 20000,
    });
  }
} catch {
  /* formatting is best effort */
}
process.exit(0);
