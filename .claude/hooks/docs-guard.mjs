// Stop: do not let code change without the docs hearing about it.
// If code paths (project.json → codePaths) have uncommitted changes and
// docs/agent/PROGRESS.md has not been touched, block the stop once and say
// what to update. Adding an early "in progress" line silences it: log as you
// go, not from memory at the end. `stop_hook_active` prevents loops.
import { readInput, loadConfig, git } from './lib.mjs';

try {
  const input = readInput();
  if (input.stop_hook_active) process.exit(0);
  const cfg = loadConfig();

  const status = git(['status', '--porcelain', '--untracked-files=all']);
  if (!status) process.exit(0);
  const changed = status
    .split('\n')
    .map((l) => l.slice(3).trim().replace(/^"|"$/g, '').split(' -> ').pop())
    .filter(Boolean);

  const isCode = (f) => cfg.codePaths.some((p) => (p.endsWith('/') ? f.startsWith(p) : f === p));
  const codeChanged = changed.filter(isCode);
  const progressTouched = changed.includes('docs/agent/PROGRESS.md');

  if (codeChanged.length && !progressTouched) {
    process.stdout.write(
      JSON.stringify({
        decision: 'block',
        reason: [
          `Code changed (${codeChanged.slice(0, 5).join(', ')}${codeChanged.length > 5 ? ', …' : ''}) but docs/agent/PROGRESS.md was not updated.`,
          'Finished or the chat may end: run the wrap-up skill.',
          'Mid-task: add a short dated "in progress" entry to docs/agent/PROGRESS.md now.',
        ].join(' '),
      }),
    );
  }
} catch {
  /* never trap the session */
}
process.exit(0);
