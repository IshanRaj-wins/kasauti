// PreToolUse (Edit | Write | MultiEdit | NotebookEdit): locked paths are write-once.
// project.json → lockedPaths lists files or folders (folder = trailing "/") that,
// once they exist, must not be changed by the agent: frozen data splits, golden
// test fixtures, signed-off specs. Creating a new file there is allowed; editing
// or overwriting an existing one is blocked.
// To change a locked file on purpose, the user removes it from lockedPaths for
// that one change, and the reason goes in docs/agent/DECISIONS.md.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readInput, loadConfig, rel, root, block } from './lib.mjs';

try {
  const input = readInput();
  const ti = input.tool_input || {};
  const f = rel(ti.file_path || ti.notebook_path || '');
  if (!f) process.exit(0);
  const cfg = loadConfig();
  const locked = (cfg.lockedPaths || []).some((p) => (p.endsWith('/') ? f.startsWith(p) : f === p));
  if (locked && existsSync(join(root, f))) {
    block(
      `${f} is locked (project.json → lockedPaths) and already exists. ` +
        'It is write-once so results stay honest. If it truly must change, stop and ask the user; ' +
        'they lift the lock for this one change and the reason goes in docs/agent/DECISIONS.md.',
    );
  }
} catch {
  /* a broken hook must not block work */
}
process.exit(0);
