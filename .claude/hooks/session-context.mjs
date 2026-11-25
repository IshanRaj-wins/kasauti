// SessionStart (startup | resume | clear | compact): put the project's memory in
// front of every session. Plain stdout of a SessionStart hook becomes context,
// so a cleared chat starts informed even if nobody types /resume.
// Budget: ~9,000 characters total.
import { readInput, loadConfig, readDoc, git } from './lib.mjs';

try {
  const input = readInput();
  const source = input.source || 'startup';
  const cfg = loadConfig();
  const LIMIT = 9000;
  const cap = (t, n, note) => (t.length <= n ? t : `${t.slice(0, n)}\n… (${note})`);

  const handoff = readDoc('docs/agent/HANDOFF.md');
  const progress = readDoc('docs/agent/PROGRESS.md');
  const learnings = readDoc('docs/agent/LEARNINGS.md');

  // Latest PROGRESS entry = first "## " section.
  const entries = progress.split(/\n(?=## )/);
  const latest = entries.find((e) => e.startsWith('## ')) || '(no entries yet)';

  const branch = git(['branch', '--show-current']);
  const log = git(['log', '--oneline', '-5']);
  const status = git(['status', '--short']).split('\n').filter(Boolean);

  const warnings = [];
  if (progress.split('\n').length > 250) warnings.push('PROGRESS.md is over 250 lines: archive old entries to docs/agent/archive/.');
  if (learnings.split('\n').length > 120) warnings.push('LEARNINGS.md is over 120 lines: merge duplicates.');
  if (branch === 'main' && status.length) warnings.push('Uncommitted changes on main: move them to a phase branch.');

  const header = [
    `# ${cfg.name}: session memory (from .claude/hooks/session-context.mjs)`,
    source === 'compact'
      ? 'The conversation was just compacted. Re-read the files for the current task before editing and keep to HANDOFF.md.'
      : 'Run /resume before changing code; run /wrap-up before the chat ends. Keep docs/agent true.',
    ...warnings.map((w) => `WARNING: ${w}`),
  ].join('\n');

  const gitBlock = [
    '## git',
    branch || log ? `branch: ${branch || '(detached)'}` : '(not a git repository yet)',
    log ? `last commits:\n${log}` : '',
    status.length
      ? `uncommitted (${status.length}):\n${status.slice(0, 15).join('\n')}${status.length > 15 ? '\n…' : ''}`
      : 'working tree clean',
  ]
    .filter(Boolean)
    .join('\n');

  const budget = LIMIT - header.length - gitBlock.length - 300;
  const hBlock = `## docs/agent/HANDOFF.md\n${cap(handoff || '(empty)', Math.floor(budget * 0.45), 'open HANDOFF.md for the rest')}`;
  const pBlock = `## Latest docs/agent/PROGRESS.md entry\n${cap(latest, Math.floor(budget * 0.3), 'open PROGRESS.md')}`;
  const lBlock = `## docs/agent/LEARNINGS.md\n${cap(learnings || '(none yet)', budget - hBlock.length - pBlock.length, 'open LEARNINGS.md')}`;

  process.stdout.write([header, hBlock, pBlock, lBlock, gitBlock].join('\n\n') + '\n');
} catch {
  /* never break a session start */
}
process.exit(0);
