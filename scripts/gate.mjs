#!/usr/bin/env node
// The gate: runs every check listed in .claude/project.json → gate, in order,
// and stops at the first failure. Used by the ship-check skill, wrap-up and CI.
//   node scripts/gate.mjs            run all checks
//   node scripts/gate.mjs --list     print the checks
//   node scripts/gate.mjs test       run only the check named "test"
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfgPath = join(root, '.claude', 'project.json');
const cfg = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, 'utf8')) : { gate: [] };
const args = process.argv.slice(2);
let checks = cfg.gate || [];

if (args.includes('--list')) {
  for (const c of checks) console.log(`${c.name.padEnd(12)} ${c.cmd}${c.cwd ? `   (in ${c.cwd})` : ''}`);
  process.exit(0);
}
if (args.length) checks = checks.filter((c) => args.includes(c.name));
// ifExists: skip a check until the thing it checks exists (e.g. no pyproject.toml yet).
// ciOnly: run only in CI (e.g. a clean `npm ci` for a sub-app).
const skipped = [];
checks = checks.filter((c) => {
  if (c.ciOnly && !process.env.CI) return skipped.push(`${c.name} (CI only)`), false;
  if (c.ifExists && !existsSync(join(root, c.ifExists))) return skipped.push(`${c.name} (no ${c.ifExists} yet)`), false;
  return true;
});
if (skipped.length) console.log(`gate: skipping ${skipped.join(', ')}`);
if (!checks.length && skipped.length) {
  console.log('gate: nothing to run yet (every check waits for files that do not exist). Pass.');
  process.exit(0);
}
if (!checks.length) {
  console.log('gate: no checks configured in .claude/project.json → gate');
  process.exit(0);
}

const started = Date.now();
for (const c of checks) {
  const t0 = Date.now();
  process.stdout.write(`\n▶ ${c.name}: ${c.cmd}\n`);
  const r = spawnSync(c.cmd, { cwd: join(root, c.cwd || '.'), stdio: 'inherit', shell: true });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  if (r.status !== 0) {
    console.log(`\n✖ gate FAILED at "${c.name}" (exit ${r.status}, ${secs}s). Fix it or record it as not done.`);
    process.exit(r.status || 1);
  }
  console.log(`✔ ${c.name} (${secs}s)`);
}
console.log(`\n✔ gate passed: ${checks.map((c) => c.name).join(', ')} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
