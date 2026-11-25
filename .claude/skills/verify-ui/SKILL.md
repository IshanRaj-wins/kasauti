---
name: verify-ui
description: Check UI changes in a real browser with the Playwright MCP. Starts the dev server, exercises the change with real input, screenshots the views that matter (desktop, tablet, phone, light and dark), and reports what was and was not checked. Use after any UI change and inside wrap-up when UI files changed.
---

# Verify UI

1. Start the dev server in the background (command in CLAUDE.md → Commands). Wait until it answers.
2. Open it with the Playwright MCP (`browser_navigate`). For first-run checks clear storage and hard-reload.
3. Exercise the change the way a user would: click, type, submit real values, including one bad input.
4. Screenshot at least: 1440×900 light, 1440×900 dark (if themed), 390×844 phone. Add 960 wide if the layout has a breakpoint there.
5. Read the browser console. Any error or failed request is a finding.
6. What to look for: overflow or clipped text, overlaps, unreadable contrast, layout jumps, empty or loading states that never resolve, fake or placeholder data, anything that only works on desktop.

Report: views checked (with what was exercised), findings worst first, and **which views you did not check**. Stop the dev server when done.
