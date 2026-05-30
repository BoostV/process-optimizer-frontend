# Feature inspection harness

A Playwright harness for **agents** to visually inspect this repo's frontend
(plots, result views) by loading a known sample in the `dev:ui` demo and taking
screenshots. On-demand only — not part of CI, no committed screenshots, and no
knowledge of any downstream application.

## Two ways to run

**Local** (host has browser system libraries):

```bash
npm run inspect:setup   # once: downloads chromium
npm run build           # so dev:ui serves current package code
npm run inspect
```

**Docker** (robust for sandboxes lacking browser libraries — needs Docker):

```bash
npm run build
npm run inspect:docker  # runs in mcr.microsoft.com/playwright:v<version>-noble
```

`inspect:docker` derives the image tag from the installed `@playwright/test`
version, bind-mounts the repo, runs the harness in the container (browsers + OS
libraries come from the image), and writes screenshots back to the host. It runs
as the container's default user on purpose — see the note in
`run-in-docker.sh` about user-namespace remapping.

Screenshots are written to `inspection/output/*.png` (git-ignored) — read them
from there.

## Inspect a feature

1. Make sure the sample you want exists in `packages/ui/src/demo/samples.ts`
   (add it to the registry if not — kebab-case key).
2. If you're targeting a specific component, give its root a stable
   `data-testid` (e.g. `pareto-front-plot`) and rebuild.
3. Copy `specs/pareto.spec.ts` and adjust:

```ts
import { test } from '../fixtures'

test('inspect my feature', async ({ inspect }) => {
  await inspect.goToSample('multi-clean-trade-off-calculated')
  await inspect.shoot('my-feature', inspect.region('plots'))
})
```

The `inspect` fixture provides `goToSample(name)`, `region('result'|'plots')`,
`paretoPlot()`, and `shoot(name, locator?)`.

Note: `dev:ui` resolves the packages from their `dist`, so run `npm run build`
after changing package source for the change to appear.
