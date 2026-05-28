# Design: Pareto-plot branch code-review remediation

**Date:** 2026-05-28
**Branch:** `pareto-plot`
**Source:** `code-review.md` (thermo-nuclear review of `pareto-plot` vs `main`)

## Goal

Resolve the structural issues raised in the code review so the `pareto-plot`
branch lands as a maintainable feature rather than a long-term liability. Scope
is review issues **#1–#12** plus the `console.log` removal from #13. The
remaining #13 nits and any backend/OpenAPI regeneration are explicitly out of
scope.

## Context

- TypeScript monorepo. Relevant packages: `plots`, `ui`, `core`, `api`
  (generated OpenAPI client).
- A working backend runs at `http://127.0.0.1:9090/v1`; its source is mirrored
  in `process-optimizer-api/`. We use it only to **capture real sample data**
  (see #2) — we do **not** modify the spec or regenerate the client.
- Headline problem: `packages/plots/src/pareto-front-plot/pareto-front-plot.tsx`
  grew from 145 → 932 lines and bundles unrelated concerns.

## Key decisions (settled with user)

| Topic                           | Decision                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Overall scope                   | Issues #1–#12 + console.log (#13)                                                                               |
| OpenAPI fix (#4)                | **Frontend-only** typing fix; no client regen, no spec edit                                                     |
| `minimal` mode (#6)             | **Delete**                                                                                                      |
| `spaghetti` mode + sampler (#7) | **Delete**                                                                                                      |
| Hover system (#5)               | Rewrite via `usePlotArea` overlay; **fall back** to extracting the imperative impl if behavior can't be matched |
| Stale selection (#3)            | **Single invalidation wrapper** around `experimentReducer`                                                      |
| `demo-data.ts` (#2)             | **Remove entirely**; capture real pareto data from the live backend into a stored sample JSON                   |
| Pareto JSON parser (#10)        | Lives in **core** (testable; shared by `ui` and `plots`)                                                        |
| plots test runner               | **Not added**; plots verified by build/typecheck + visual check                                                 |

---

## Work items

### #1 — Decompose `pareto-front-plot.tsx`

Target layout (folder already exists at `packages/plots/src/pareto-front-plot/`):

```
pareto-front-plot/
├── pareto-front-plot.tsx       # ~250 lines: ComposedChart skeleton + 2-mode switch + legend + composition
├── overlays/
│   ├── confidence-ellipses.tsx # <Customized> overlay (extracted from existing sub-component)
│   └── uncertainty-band.tsx    # <Customized> overlay (extracted)
├── use-data-to-pixel.ts        # plotArea + domain → projector; removes the 3 duplicate xToPx/yToPx closures
├── hover-overlay.tsx           # rewritten via usePlotArea (#5)
└── point-label.tsx             # the duplicated <text>+<rect> SVG, parameterized by color
```

No `posterior-samples` overlay / `posterior-sampling.ts` — the `spaghetti`
sampler is deleted (#7), not relocated. Parent retains only chart skeleton,
two-mode switch (`ellipses`, `band`), legend, and composition.

### #2 — Remove `demo-data.ts` entirely

- Delete `packages/ui/src/features/multi-objective/demo-data.ts` — it has **no
  importers** (verified); pure dead duplication.
- For plots: POST a multi-objective experiment to the live backend at
  `:9090/v1`, capture the real pareto-plot JSON it returns, and store it as
  `packages/plots/src/sample-data/pareto-demo.json` (mirrors the `ui` `sample-data/`
  pattern). `packages/plots/src/demo.tsx` imports that JSON and parses it
  through the typed Zod parser from #10 — eliminating the
  `paretoJson as unknown as {...}` cast and sharing one parse path with
  `result.tsx`.
- `singlePng` (base64 PNG for the `PNGPlot` demo) is a demo image asset, not
  experiment data — move it to a small companion asset file under
  `sample-data/` so `demo-data.ts` deletes cleanly.

### #3 — Single selection-invalidation wrapper

In `packages/core/src/context/experiment/experiment-reducers.ts`, remove all
**11** inline `clearParetoSelection(state)` calls. Wrap `experimentReducer` so a
single post-pass clears `extras.selectedPoint` whenever an action changed
`valueVariables`, `categoricalVariables`, `scoreVariables`, or `dataPoints`. New
reducer cases inherit the policy automatically. Unit-tested in core.

### #4 — Selection typing (frontend-only)

Define a proper domain type for the selected point in `core`
(`SelectedPoint = (number | string)[]`, matching the spec's real shape) and use
it at the `core/src/context/experiment/api.ts:42` boundary, dropping the
`as unknown as ExperimentExtrasSelectedPointInner[]` double-cast. The generated
client is left untouched; its empty `ExperimentExtrasSelectedPointInner` and the
`expectedMinimum`/`next`/`xi` weakening remain (out of scope per frontend-only
choice).

### #5 — Rewrite hover system

Replace the 173-line imperative `querySelector` hover (Recharts-internal class
querying + ref mutation + RAF throttle) with a `<Customized>` SVG overlay using
Recharts v3 `usePlotArea()` — the same primitive already used by
`ConfidenceEllipses`. Lives in `hover-overlay.tsx`. **Fallback:** if hover
behavior can't be matched cleanly against the running app, move the existing
imperative implementation into `hover-overlay.tsx` as-is behind a small API.

### #6 — Delete `minimal` mode

Remove the dead `minimal` entry from `paretoVisualizationModes` and any
references. Remaining modes: `ellipses`, `band`.

### #7 — Delete `spaghetti` mode + sampler

Remove the `spaghetti` mode and the in-component seeded-LCG + Box-Muller
Gaussian sampler (lines ~231–240). No replacement module.

### #8 — Centralize quality negation

Export `displayQuality(q)` and `displayQualityCI(value, std)` from `core`.
Replace the scattered inline negations:

- `pareto-front-plot.tsx:116` (`const displayQuality = (q) => -q`) and its call sites
- `result.tsx:43,46-48` (`convertScoreToString`, `-value ± 1.96*stdDev`)

Unit-tested in core. (Full API-boundary normalization considered but rejected as
too wide a data-flow change; single shared helper is the chosen scope.)

### #9 — Score role, not string-sniffing

Replace `header.toLowerCase().includes('quality'|'cost')` in `result.tsx` with
matching on the canonical `scoreNames` / score-variable `name`. Display behavior
no longer depends on user-facing label text.

### #10 — Untangle `result.tsx`

- Lift the untyped `JSON.parse(paretoRaw?.plot ?? '{}')` into a **typed Zod
  parser in `core`** (consistent with the rest of `core`; shared by `result.tsx`
  and `plots/demo.tsx`).
- Move the three inline IIFEs (`costDomain`, per-row `xDomain`, selected-index)
  into domain helpers next to the parser.
- The view flattens to `<ParetoFrontPlot {...computedProps} />`.
- Parser + helpers unit-tested in core.

### #11 — Replace `cloneElement` button injection

Replace the `cloneElement` + `isValidElement` `onClick` injection
(`pareto-front-plot.tsx:~916,923`) with an explicit
`renderControls?: (api: { onToggleFit: () => void; onResetToDefault: () => void }) => ReactNode`
render-prop (or plain callback props with a default button). No silently
overwritten `onClick`.

### #12 — Mode-dependent axis domain

The band-uncertainty bounds (`xLowerBoundData`/`xUpperBoundData`) contribute to
the axis domain **only when `mode === 'band'`**, so switching modes no longer
silently rescales the chart.

### #13 — console.log only

Delete `pareto-front-plot.tsx:731` `onClick={e => console.log(e)}` (folded into
the #1 rewrite). Other #13 nits (hardcoded chart `width/height`, untracked
`new-multi-test.json`, `docs/superpowers/` artifacts) are out of scope.

---

## Implementation sequence

1. **Deletions** — `minimal` (#6), `spaghetti` + sampler (#7), console.log
   (#13); delete unused `ui` `demo-data.ts` (#2 part). Shrinks the file before
   the split.
2. **Core foundation** — quality helpers (#8), `SelectedPoint` type (#4), typed
   pareto Zod parser + domain helpers (#10 core part), selection-invalidation
   wrapper (#3). All unit-tested in core.
3. **UI** — untangle `result.tsx`: typed parse, score-role matching (#9),
   flatten view, consume core helpers (#10 view part).
4. **Plots** — capture real backend sample JSON (#2); decompose
   `pareto-front-plot.tsx` (#1) including hover rewrite (#5), render-prop (#11),
   mode-dependent domain (#12); wire `demo.tsx` to the JSON + core parser.
5. **Verify** — see below.

## Verification

- **Build/typecheck:** `npm run build -ws` green across all packages. Primary
  guard for the decomposition and typing fixes; sole automated guard for plots.
- **Unit tests:** `npm run test -ws` (vitest, core + ui). New/extended tests:
  invalidation wrapper, quality helpers, pareto parser + domain helpers,
  score-role matching.
- **Visual/behavioral:** `npm run dev:app` against the live backend on `:9090` —
  confirm pareto plot (`ellipses` + `band`), hover, and selection behave after
  decomposition + hover rewrite. The #5 fallback decision is made here.
- **Lint/format:** `npm run lint` and `npm run prettier`.

## Out of scope

- OpenAPI client regeneration / spec edits; `expectedMinimum`/`next`/`xi`
  generated-type weakening.
- #13 nits other than console.log.
- Adding a test runner to the `plots` package.
