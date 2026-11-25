#!/usr/bin/env node
// Install (or update) the /new-project skill into ~/.claude/skills/new-project.
//   node kit/install-skill.mjs
import { mkdirSync, copyFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = join(dirname(fileURLToPath(import.meta.url)), 'new-project', 'SKILL.md');
const dest = join(homedir(), '.claude', 'skills', 'new-project');
mkdirSync(dest, { recursive: true });
copyFileSync(src, join(dest, 'SKILL.md'));
console.log(`installed /new-project → ${join(dest, 'SKILL.md')}`);
