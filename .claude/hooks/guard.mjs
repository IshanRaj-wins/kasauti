// PreToolUse (Read | Edit | Write | MultiEdit | NotebookEdit | Bash | PowerShell):
// block the handful of actions that are never right in this repo.
// Exit 2 + stderr blocks the call and tells Claude why.
// Project-specific command rules: project.json → blockedCommands [{ pattern, reason }].
import { readInput, loadConfig, rel, block } from './lib.mjs';

let input = {};
try {
  input = readInput();
} catch {
  process.exit(0);
}
const tool = input.tool_name || '';
const ti = input.tool_input || {};
const cfg = loadConfig();

const FILE_TOOLS = ['Read', 'Edit', 'Write', 'MultiEdit', 'NotebookEdit'];
if (FILE_TOOLS.includes(tool)) {
  const f = rel(ti.file_path || ti.notebook_path || '');
  if (/(^|\/)\.env($|\.)/.test(f) && !/\.env\.example$/.test(f)) {
    block(`${f} holds secrets. Document variables in .env.example instead.`);
  }
  if (/(^|\/)\.git\//.test(f)) block('do not touch .git internals; use git commands.');
}

if (tool === 'Bash' || tool === 'PowerShell') {
  const c = String(ti.command || '');
  const rules = [
    [/git\s+push\b[^\n;&|]*\s(--force\b|-f\b|--force-with-lease\b)/, 'force-push rewrites shared history.'],
    [/git\s+reset\s+--hard\b/, 'reset --hard throws work away. Commit or stash first, or ask the user.'],
    [/git\s+clean\s+-[a-zA-Z]*f/, 'git clean -f deletes untracked files. Delete specific files instead.'],
    [/--no-verify\b/, 'never skip git hooks. Fix the failing check.'],
    [/git\s+(filter-branch|filter-repo)\b/, 'history rewrites need the user to do them by hand.'],
    [/git\s+commit\b[^\n]*--amend\b[^\n]*&&\s*git\s+push|git\s+rebase\b[^\n]*\bmain\b/, 'do not rewrite history on main.'],
    [/\brm\s+-[a-zA-Z]*r[a-zA-Z]*f\b|\brm\s+-[a-zA-Z]*f[a-zA-Z]*r\b/, 'rm -rf is too broad. Delete specific paths.'],
    [/Remove-Item\b(?=[^\n]*-Recurse)(?=[^\n]*-Force)/i, 'recursive force delete is too broad. Delete specific paths.'],
    [/\b(cat|type|more|less|head|tail|Get-Content|gc)\b[^\n|;]*\.env\b(?!\.example)/i, 'printing .env leaks secrets into the transcript.'],
    [/\bprintenv\b|Get-ChildItem\s+env:|\bgci\s+env:|^\s*env\s*$|\bset\s*$/im, 'dumping environment variables leaks secrets.'],
  ];
  for (const [re, why] of rules) if (re.test(c)) block(why);
  for (const r of cfg.blockedCommands || []) {
    try {
      if (new RegExp(r.pattern, 'i').test(c)) block(r.reason || `matches ${r.pattern}`);
    } catch {
      /* bad pattern in project.json: ignore */
    }
  }
}
process.exit(0);
