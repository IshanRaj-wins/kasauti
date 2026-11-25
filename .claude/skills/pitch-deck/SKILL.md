---
name: pitch-deck
description: Build or update the judges' pitch deck (.pptx) from docs/PLAN.md and docs/FACTS.md in an award-winning hackathon format, capped at 9 slides, every number sourced, no unproduced results. Use when asked for "the deck", "the PPT", "pitch slides", or to refresh the deck with real results.
argument-hint: "[build | update-results]"
---

# Pitch deck

Load the `anthropic-skills:pptx` skill first and follow it (pptxgenjs, structured deck, validate). Keep the generator in `pitch/build/build.js` so the deck can be rebuilt after every change.

## Shape (max 9 slides, ~6 minutes + Q&A)

1. **Title:** name, one-line hook, college / team, date
2. **Problem:** one user, 2–3 big sourced numbers, the gap in one sentence
3. **Gap + insight:** what exists today and why it falls short (chart or table), then our one-line insight
4. **Solution:** product picture (screenshot, or a mock labelled "concept mock") + 3–4 capabilities
5. **Architecture:** one data-flow diagram, left to right, the core we build highlighted
6. **Tech stack:** grouped by layer, with the reason for each choice
7. **Implementation:** the core technical idea (for ML: inputs, model ladder, training protocol)
8. **Evaluation / proof:** metrics, baselines, and results, or targets clearly labelled "target"
9. **Demo + guardrails + plan:** the demo beats, the honest limits, the phase roadmap, thank you

Speaker notes on every slide with timings that add up to the slot.

## Rules

- Every number on a slide has a row in `docs/FACTS.md` (claim, slide, source, date checked). No source, no number.
- Never show a result we haven't produced. Before results exist: "target". After: numbers come from the results file the eval script writes, never typed by hand.
- One idea per slide, big numbers, diagrams over bullets, body text ≥ 14 pt, no accent stripes or title underlines.
- Render and look at every slide: `powershell -File pitch/render.ps1 -Deck pitch/<Deck>.pptx`, then read the PNGs. Fix overflow, overlaps and awkward line breaks before saying it's done.

## update-results

Replace each "target" with the real number from the results file, add a "vs baseline" comparison, swap the concept mock for a real screenshot, and update FACTS.md. If a result disappoints, keep it and say what it means. Judges trust honest numbers.
