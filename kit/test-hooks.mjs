#!/usr/bin/env node
// Smoke-test every hook in .claude/hooks against a throwaway git repo.
//   node kit/test-hooks.mjs        (from the repo root)
// Exits 1 if any expectation fails.
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, execFileSync } from 'node:child_process';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = mkdtempSync(join(tmpdir(), 'vibekit-hooks-'));
cpSync(join(repo, '.claude', 'hooks'), join(tmp, '.claude', 'hooks'), { recursive: true });
writeFileSync(
  join(tmp, '.claude', 'project.json'),
  JSON.stringify({ name: 'HookTest', codePaths: ['src/'], lockedPaths: ['locked/'], blockedCommands: [{ pattern: 'drop\\s+table', reason: 'no drops' }] }),
);
mkdirSync(join(tmp, 'locked'), { recursive: true });
writeFileSync(join(tmp, 'locked', 'split.json'), '{}');
mkdirSync(join(tmp, 'docs', 'agent'), { recursive: true });
writeFileSync(join(tmp, 'docs', 'agent', 'HANDOFF.md'), '# Handoff\nNext: test');
const g = (...a) => execFileSync('git', a, { cwd: tmp, stdio: 'ignore' });
g('init', '-q');
g('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'init');

const run = (hook, input) => {
  const r = spawnSync(process.execPath, [join(tmp, '.claude', 'hooks', hook)], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: tmp },
  });
  return { code: r.status, out: r.stdout || '', err: r.stderr || '' };
};

const cases = [];
const expect = (label, cond) => cases.push([label, !!cond]);

// guard
expect('guard blocks force-push', run('guard.mjs', { tool_name: 'Bash', tool_input: { command: 'git push --force origin main' } }).code === 2);
expect('guard blocks reading .env', run('guard.mjs', { tool_name: 'Read', tool_input: { file_path: join(tmp, '.env') } }).code === 2);
expect('guard allows .env.example', run('guard.mjs', { tool_name: 'Read', tool_input: { file_path: join(tmp, '.env.example') } }).code === 0);
expect('guard blocks rm -rf', run('guard.mjs', { tool_name: 'Bash', tool_input: { command: 'rm -rf data' } }).code === 2);
expect('guard blocks --no-verify', run('guard.mjs', { tool_name: 'Bash', tool_input: { command: 'git commit --no-verify -m x' } }).code === 2);
expect('guard blocks project rule', run('guard.mjs', { tool_name: 'Bash', tool_input: { command: 'psql -c "DROP TABLE x"' } }).code === 2);
expect('guard allows git status', run('guard.mjs', { tool_name: 'Bash', tool_input: { command: 'git status --short' } }).code === 0);
// lock-guard
expect('lock-guard blocks editing an existing locked file', run('lock-guard.mjs', { tool_name: 'Edit', tool_input: { file_path: join(tmp, 'locked', 'split.json') } }).code === 2);
expect('lock-guard allows creating a new locked file', run('lock-guard.mjs', { tool_name: 'Write', tool_input: { file_path: join(tmp, 'locked', 'new.json') } }).code === 0);
expect('lock-guard ignores other paths', run('lock-guard.mjs', { tool_name: 'Edit', tool_input: { file_path: join(tmp, 'src', 'a.py') } }).code === 0);
// docs-guard
mkdirSync(join(tmp, 'src'), { recursive: true });
writeFileSync(join(tmp, 'src', 'a.py'), 'x = 1\n');
expect('docs-guard blocks code change without PROGRESS', run('docs-guard.mjs', {}).out.includes('"decision":"block"'));
expect('docs-guard respects stop_hook_active', run('docs-guard.mjs', { stop_hook_active: true }).out === '');
writeFileSync(join(tmp, 'docs', 'agent', 'PROGRESS.md'), '# Progress\n## today: in progress\n');
expect('docs-guard allows once PROGRESS is touched', run('docs-guard.mjs', {}).out === '');
// session-context
const sc = run('session-context.mjs', { source: 'startup' });
expect('session-context prints the handoff', sc.code === 0 && sc.out.includes('HookTest') && sc.out.includes('Next: test'));
expect('session-context notes compaction', run('session-context.mjs', { source: 'compact' }).out.includes('compacted'));
// format
expect('format never fails', run('format.mjs', { tool_name: 'Write', tool_input: { file_path: join(tmp, 'src', 'a.py') } }).code === 0);

rmSync(tmp, { recursive: true, force: true });
let failed = 0;
for (const [label, ok] of cases) {
  console.log(`${ok ? '✔' : '✖'} ${label}`);
  if (!ok) failed++;
}
console.log(`\nhooks: ${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
