#!/usr/bin/env node
// Turn a fresh copy of vibe-kit into a specific project.
//
//   node kit/init.mjs --name "AfterShock AI" --slug aftershock-ai \
//     --pitch "One line" --profile fullstack \
//     [--plan path/to/plan.md] [--done P0] [--locked "data/splits/,tests/fixtures/"] [--keep-kit]
//
// Fills {{PLACEHOLDERS}}, writes .claude/project.json from the profile, turns the
// plan's phases (lines like "**P3: Data pipeline (days 5–7)**" or "## P3: ...")
// into TASKS.md, ACCEPTANCE.md and features.json, runs the hook smoke test, and
// deletes kit/ (unless --keep-kit).
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, rmSync, copyFileSync, appendFileSync } from 'node:fs';
import { join, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const kitDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(kitDir, '..');

// ---- args
const argv = process.argv.slice(2);
const arg = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d;
};
const flag = (k) => argv.includes(`--${k}`);
const name = arg('name');
const slug = arg('slug') || (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pitch = arg('pitch', '');
const profileName = arg('profile', 'python');
const planPath = arg('plan');
const done = (arg('done', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const locked = (arg('locked', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!name) {
  console.error('usage: node kit/init.mjs --name "Project" [--slug x] [--pitch "..."] [--profile python|node|fullstack] [--plan plan.md] [--done P0] [--locked a/,b/] [--keep-kit]');
  process.exit(1);
}
const profilePath = join(kitDir, 'profiles', `${profileName}.json`);
if (!existsSync(profilePath)) {
  console.error(`unknown profile "${profileName}" (have: ${readdirSync(join(kitDir, 'profiles')).map((f) => f.replace('.json', '')).join(', ')})`);
  process.exit(1);
}
const slugPy = slug.replace(/-/g, '_');
const today = new Date().toISOString().slice(0, 10);
const sub = (s) => s.replaceAll('{{SLUG_PY}}', slugPy).replaceAll('{{SLUG}}', slug).replaceAll('{{PROJECT_NAME}}', name);
const profile = JSON.parse(sub(readFileSync(profilePath, 'utf8')));

// ---- plan → phases
let phases = [];
if (planPath) {
  const plan = readFileSync(resolve(planPath), 'utf8');
  if (resolve(planPath) !== join(root, 'docs', 'PLAN.md')) writeFileSync(join(root, 'docs', 'PLAN.md'), plan);
  const re = /^\s*(?:#{2,4}\s*|\*\*|-\s+\*\*)?(P\d+[a-z]?)\s*[:—–-]\s*(.+?)\s*$/gm;
  const seen = new Set();
  for (const m of plan.matchAll(re)) {
    const id = m[1];
    if (seen.has(id)) continue;
    let title = m[2].replace(/\*\*.*$/, '').replace(/\*+$/, '').replace(/\s*\([^)]*\)\s*$/, '').trim();
    if (!title) continue;
    seen.add(id);
    phases.push({ id, title });
  }
}
if (!phases.length) phases = [{ id: 'P0', title: 'Pitch deck + research freeze' }, { id: 'P1', title: 'Scaffold + harness' }];
const isDone = (id) => done.includes(id);
const next = phases.find((p) => !isDone(p.id)) || phases[0];

// ---- hook smoke test (before kit/ is deleted)
const t = spawnSync(process.execPath, [join(kitDir, 'test-hooks.mjs')], { cwd: root, encoding: 'utf8' });
const hooksOk = t.status === 0;
process.stdout.write(t.stdout || '');
if (!hooksOk) process.stderr.write(t.stderr || '');

// ---- placeholders
const values = {
  '{{PITCH}}': pitch || '(one-line pitch)',
  '{{DATE}}': today,
  '{{COMMANDS}}': '```\n' + profile.commands.join('\n') + '\n```',
  '{{MAP}}': profile.map.join('\n'),
  '{{STACK_RULES}}': profile.stackRules.join('\n'),
  '{{PHASES}}': phases.map((p) => `- [${isDone(p.id) ? 'x' : ' '}] **${p.id}** ${p.title}`).join('\n'),
  '{{FIRST_PHASE}}': `${next.id} ${next.title}`,
  '{{FIRST_PHASE_ID}}': next.id,
  '{{ACCEPTANCE}}': phases.map((p) => `## ${p.id}: ${p.title}\n- [${isDone(p.id) ? 'x' : ' '}] ${isDone(p.id) ? 'Done before bootstrap (see PROGRESS).' : `(draft with /task ${p.id})`}`).join('\n\n'),
  '{{BOOTSTRAP_VERIFIED}}': hooksOk ? 'hook smoke test (kit/test-hooks.mjs) passed' : 'hook smoke test FAILED (see bootstrap output)',
  '{{GH_USER}}': 'IshanRaj-wins',
};
const TEXT = new Set(['.md', '.json', '.mjs', '.js', '.ts', '.yml', '.yaml', '.toml', '.txt', '.ps1', '.example', '']);
const SKIP = new Set(['.git', 'node_modules', 'kit']);
function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (TEXT.has(extname(e))) {
      const before = readFileSync(p, 'utf8');
      let after = sub(before);
      for (const [k, v] of Object.entries(values)) after = after.replaceAll(k, v);
      if (after !== before) writeFileSync(p, after);
    }
  }
}
walk(root);

// ---- project.json
const cfg = {
  name,
  profile: profileName,
  codePaths: profile.codePaths,
  lockedPaths: locked,
  gate: profile.gate,
  format: profile.format,
  blockedCommands: [],
};
writeFileSync(join(root, '.claude', 'project.json'), JSON.stringify(cfg, null, 2) + '\n');

// ---- features.json
const features = JSON.parse(readFileSync(join(root, 'features.json'), 'utf8'));
features.features = phases.map((p) => ({ id: p.id, name: p.title, acceptance: `docs/ACCEPTANCE.md#${p.id.toLowerCase()}`, passes: isDone(p.id) }));
writeFileSync(join(root, 'features.json'), JSON.stringify(features, null, 2) + '\n');

// ---- .gitignore
appendFileSync(join(root, '.gitignore'), `\n# ${profileName} profile\n${profile.gitignore.join('\n')}\n`);

// ---- remove kit/
if (!flag('keep-kit')) rmSync(kitDir, { recursive: true, force: true });

console.log(`\n✔ ${name} initialised (profile ${profileName}, ${phases.length} phases, next: ${next.id} ${next.title})`);
console.log(`  hooks smoke test: ${hooksOk ? 'passed' : 'FAILED'}`);
console.log(`  locked paths: ${locked.length ? locked.join(', ') : '(none)'}`);
console.log(`  kit/ ${flag('keep-kit') ? 'kept' : 'removed'}`);
process.exit(hooksOk ? 0 : 2);
