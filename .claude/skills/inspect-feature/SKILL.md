---
name: inspect-feature
description: Use when you need to visually inspect or verify a frontend feature (plots, result views) in this repo — take screenshots, check rendering, or confirm an interaction. Drives the dev:ui demo with Playwright via the inspection/ harness; runs locally or in Docker. Targets only this repo's own demo, never a downstream consuming app.
---

# Inspect a feature

Use the `inspection/` harness to screenshot a feature instead of building
scaffolding. See `inspection/README.md` for detail.

## Steps

1. **Pick a run mode.** If the host has working browser libraries, use local
   (`npm run inspect:setup` once, then `npm run inspect`). If the sandbox lacks
   browser system libraries (no sudo, missing libs like `libnspr4.so`), use
   Docker: `npm run inspect:docker` (official Playwright image; nothing to
   install).
2. **Ensure the sample exists.** Check `packages/ui/src/demo/samples.ts`; if the
   fixture you need isn't there, add it to the registry (kebab-case key).
3. **Add a hook if needed.** Targeting a specific component? Give its root a
   stable `data-testid` and rebuild the package.
4. **Write/adjust a spec** under `inspection/specs/` using the `inspect` fixture
   (`goToSample`, `region`, `paretoPlot`, `shoot`); copy `pareto.spec.ts`.
5. **Build then run.** `npm run build` (so `dev:ui` serves current code), then
   the chosen inspect command.
6. **Read the screenshots** from `inspection/output/*.png`.

## Notes

- On-demand only: don't wire this into CI; don't commit screenshots.
- Never reference brownie-bee or any downstream app — this harness targets only
  this repo's `dev:ui` demo.
