# Pareto-plot Code-Review Remediation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve code-review issues #1–#12 (+ console.log from #13) on the `pareto-plot` branch so the feature lands maintainable: decompose the 932-line `pareto-front-plot.tsx`, delete dead modes/duplication, centralize quality negation, fix stale-selection handling, and replace fabricated demo data with a real backend-captured sample.

**Architecture:** A TypeScript monorepo (`core`, `ui`, `plots`, `api`). Pure logic (parsing, domain math, quality negation, selection invalidation, selectors) lives and is unit-tested in `core`; UI view code in `ui` consumes those helpers; chart code in `plots` is decomposed into focused files verified by typecheck/build + a visual check against the live backend. The `plots` package gets **no** test runner (per design); it is guarded by `tsc`/`vite build` and the dev-app visual check.

**Tech Stack:** React 18, Recharts v3 (`usePlotArea`, `<Customized>`), Zod, Immer (`produce`), Vitest (core + ui only), Vite, MUI. Live backend: ProcessOptimizer API at `http://127.0.0.1:9090/v1.0/optimizer`.

**Key shape fact (verified against the live backend):** the real `pareto_data` plot contains exactly `front_x_data: (number|string)[][]`, `front_y_data: [number,number][]`, `obj1_error: number[]`, `obj2_error: number[]` (scalar, not tuples), `best_idx: number`. It does **not** contain `obj1_mean/std`, `obj2_mean/std`, or `obj1_1D_data/obj2_1D_data` — those were fabricated in the old `demo-data.ts`. Those fabricated fields are referenced only by the spaghetti sampler (deleted in Task 1).

**Package import specifiers:** `@boostv/process-optimizer-frontend-core`, `@boostv/process-optimizer-frontend-plots`, `@boostv/process-optimizer-frontend-api`.

**Commands:** build (typecheck) `npm run build -ws`; tests `npm run test -ws -- --run`; per-package test e.g. `npm run test --workspace @boostv/process-optimizer-frontend-core -- --run`; lint `npm run lint`; format check `npm run prettier`; dev app `npm run dev:app`.

---

## File map

| File                                                                    | Action                    | Responsibility                                                    |
| ----------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------- |
| `packages/plots/src/pareto-front-plot/pareto-front-plot.tsx`            | Modify (shrink ~932→~280) | Chart skeleton, 2-mode switch, legend, composition                |
| `packages/plots/src/pareto-front-plot/use-data-to-pixel.ts`             | Create                    | `useDataToPixel(xDomain,yDomain)` → `{xToPx,yToPx}` projector     |
| `packages/plots/src/pareto-front-plot/overlays/confidence-ellipses.tsx` | Create                    | `<ConfidenceEllipses>` Customized overlay                         |
| `packages/plots/src/pareto-front-plot/overlays/uncertainty-band.tsx`    | Create                    | `<QualityUncertaintyBand>` Customized overlay                     |
| `packages/plots/src/pareto-front-plot/point-label.tsx`                  | Create                    | `makePointLabel({fill,stroke,textFill})` scatter label factory    |
| `packages/plots/src/pareto-front-plot/hover-overlay.tsx`                | Create                    | Front hover (rewrite via `usePlotArea`; fallback: imperative)     |
| `packages/plots/src/demo.tsx`                                           | Modify                    | Consume real sample JSON via core parser; static OneDPlots        |
| `packages/plots/src/sample-data/pareto-demo.json`                       | Create                    | Real captured `pareto_data` payload                               |
| `packages/plots/src/sample-data/single-png.json`                        | Create                    | `{ "png": "<base64>" }` for the PNGPlot demo                      |
| `packages/plots/src/demo-data.ts`                                       | Delete                    | (fabricated duplicate)                                            |
| `packages/ui/src/features/multi-objective/demo-data.ts`                 | Delete                    | (unused duplicate)                                                |
| `packages/core/src/common/util/pareto/pareto-plot.ts`                   | Create                    | `paretoPlotSchema`, `ParetoPlot`, `parseParetoPlot`, `costDomain` |
| `packages/core/src/common/util/pareto/pareto-plot.test.ts`              | Create                    | Tests for parser + domain helpers                                 |
| `packages/core/src/common/util/scores/quality.ts`                       | Create                    | `displayQuality`, `displayQualityCI`                              |
| `packages/core/src/common/util/scores/quality.test.ts`                  | Create                    | Tests for quality helpers                                         |
| `packages/core/src/common/types/common.ts`                              | Modify                    | Export `SelectedPoint` type                                       |
| `packages/core/src/context/experiment/api.ts`                           | Modify                    | Use `SelectedPoint`, drop `as unknown as` cast                    |
| `packages/core/src/context/experiment/experiment-reducers.ts`           | Modify                    | Remove 11 inline calls; add invalidation wrapper                  |
| `packages/core/src/context/experiment/experiment-reducers.test.ts`      | Create/Modify             | Test invalidation wrapper                                         |
| `packages/core/src/context/experiment/experiment-selectors.ts`          | Modify                    | Add `selectActiveScoreVariableNames`                              |
| `packages/core/src/context/experiment/experiment-selectors.test.ts`     | Create/Modify             | Test new selector                                                 |
| `packages/ui/src/features/multi-objective/result.tsx`                   | Modify                    | Use core parser/helpers; score-role; flatten view                 |
| `packages/ui/src/features/multi-objective/result.utils.ts`              | Modify                    | Add `resolveSelectedIndex`                                        |
| `packages/ui/src/features/multi-objective/result.utils.test.ts`         | Modify                    | Test `resolveSelectedIndex`                                       |

Each `core` export must be re-exported through the package barrel. Verify the export chain (`common/util/index.ts` → `common/index.ts` → `src/index.ts`) when adding files; mirror how `converters.ts` is exported.

---

## Phase A — Deletions (shrink before decompose)

### Task 1: Delete `spaghetti` + `minimal` modes, sampler, and console.log

**Files:**

- Modify: `packages/plots/src/pareto-front-plot/pareto-front-plot.tsx`

- [ ] **Step 1: Trim the mode list (lines 27-32)**

Replace:

```typescript
export const paretoVisualizationModes = [
  { id: 'ellipses', label: 'Confidence ellipses' },
  { id: 'band', label: 'Uncertainty band' },
  { id: 'spaghetti', label: 'Posterior samples' },
  { id: 'minimal', label: 'Minimal' },
] as const
```

with:

```typescript
export const paretoVisualizationModes = [
  { id: 'ellipses', label: 'Confidence ellipses' },
  { id: 'band', label: 'Uncertainty band' },
] as const
```

- [ ] **Step 2: Delete the `spaghettiSamples` sampler block (lines ~224-260)**

Delete the entire `const spaghettiSamples = useMemo(() => { ... }, [...])` block (the seeded LCG + Box-Muller `gauss` + sampling loop).

- [ ] **Step 3: Delete the `SpaghettiLines` sub-component (lines ~366-388)** and its reference to `spaghettiSamples`.

- [ ] **Step 4: Delete the spaghetti render branch (lines ~619-621)**

```typescript
{visualizationMode === 'spaghetti' && (
  <Customized component={SpaghettiLines} />
)}
```

- [ ] **Step 5: Delete the spaghetti legend branch (the `{visualizationMode === 'spaghetti' && (...)}` block, ~lines 898-906).**

- [ ] **Step 6: Delete the console.log (line 731)**

Find `onClick={e => console.log(e)}` on the `<Line .../>` and remove the entire `onClick` prop.

- [ ] **Step 7: Run build to verify it compiles and find dangling refs**

Run: `npm run build --workspace @boostv/process-optimizer-frontend-plots`
Expected: PASS. If `obj1_mean`/`obj1_std` etc. are now unused in the body that's fine (the type still declares them; Task 11 trims the type). If the build flags an unused import (`useMemo`), remove it.

- [ ] **Step 8: Commit**

```bash
git add packages/plots/src/pareto-front-plot/pareto-front-plot.tsx
git commit -m "Remove spaghetti+minimal pareto modes, sampler, and console.log (#6,#7,#13)"
```

### Task 2: Delete the unused UI `demo-data.ts`

**Files:**

- Delete: `packages/ui/src/features/multi-objective/demo-data.ts`

- [ ] **Step 1: Confirm no importers**

Run: `grep -rn "multi-objective/demo-data\|from './demo-data'" packages/ui/src`
Expected: no output.

- [ ] **Step 2: Delete the file**

```bash
git rm packages/ui/src/features/multi-objective/demo-data.ts
```

- [ ] **Step 3: Build ui**

Run: `npm run build --workspace @boostv/process-optimizer-frontend-ui`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git commit -m "Delete unused duplicate multi-objective/demo-data.ts (#2)"
```

---

## Phase B — Core foundation (TDD)

### Task 3: Quality negation helpers in core (#8)

**Files:**

- Create: `packages/core/src/common/util/scores/quality.ts`
- Test: `packages/core/src/common/util/scores/quality.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest'
import { displayQuality, displayQualityCI } from './quality'

describe('displayQuality', () => {
  it('negates a stored quality value for display', () => {
    expect(displayQuality(-2.5)).toBe(2.5)
    expect(displayQuality(3)).toBe(-3)
  })
})

describe('displayQualityCI', () => {
  it('returns a 95% CI string from a negated value and std dev', () => {
    expect(displayQualityCI(-2, 0.5)).toBe('[1.02, 2.98]')
  })

  it('returns an empty string when value or stdDev is missing/zero', () => {
    expect(displayQualityCI(0, 0.5)).toBe('')
    expect(displayQualityCI(-2, 0)).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @boostv/process-optimizer-frontend-core -- --run quality`
Expected: FAIL — cannot find module `./quality`.

- [ ] **Step 3: Implement**

```typescript
// Quality is stored negated (the optimizer minimizes), but shown positive.
// Centralizes the negation that was previously inlined across plots/ui.
export const displayQuality = (q: number): number => -q

export const displayQualityCI = (value: number, stdDev: number): string => {
  if (!value || !stdDev) {
    return ''
  }
  const lower = -value - 1.96 * stdDev
  const upper = -value + 1.96 * stdDev
  return `[${lower.toFixed(2)}, ${upper.toFixed(2)}]`
}
```

- [ ] **Step 4: Export through the barrel**

Add `export * from './scores/quality'` to `packages/core/src/common/util/index.ts` (mirror the existing `export * from './converters/converters'` line — open the file and match its style).

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test --workspace @boostv/process-optimizer-frontend-core -- --run quality`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/common/util/scores/quality.ts packages/core/src/common/util/scores/quality.test.ts packages/core/src/common/util/index.ts
git commit -m "Add centralized quality display helpers to core (#8)"
```

### Task 4: `SelectedPoint` type + drop the double-cast (#4)

**Files:**

- Modify: `packages/core/src/common/types/common.ts`
- Modify: `packages/core/src/context/experiment/api.ts:35-46`

- [ ] **Step 1: Add the type in `common.ts`**

Add near the top-level exports (e.g. after `scoreNames`, line ~16):

```typescript
// A selected pareto point: one coordinate per optimizer-space dimension,
// matching the backend's front_x_data row shape (mixed numeric/categorical).
export type SelectedPoint = Array<number | string>
```

- [ ] **Step 2: Update `api.ts` imports**

In `packages/core/src/context/experiment/api.ts`, remove `ExperimentExtrasSelectedPointInner` from the `@boostv/process-optimizer-frontend-api` import (lines 1-5) and add `SelectedPoint` to the `@core/common` import (lines 6-13):

```typescript
import {
  DefaultApi,
  RunOptimizerRequest,
} from '@boostv/process-optimizer-frontend-api'
import {
  ExperimentType,
  SelectedPoint,
  calculateConstraints,
  calculateData,
  calculateSpace,
  experimentResultSchema,
} from '@core/common'
```

- [ ] **Step 3: Replace the cast block (lines 39-46)**

Find where `selectedPoint` is read from extras earlier in the function and ensure it is typed `SelectedPoint | undefined` (cast at the read site: `const selectedPoint = extras.selectedPoint as SelectedPoint | undefined`). Then replace:

```typescript
        ...(selectedPoint
          ? {
              selectedPoint:
                selectedPoint as unknown as ExperimentExtrasSelectedPointInner[],
            }
          : {}),
```

with:

```typescript
        ...(selectedPoint ? { selectedPoint } : {}),
```

- [ ] **Step 4: Build core**

Run: `npm run build --workspace @boostv/process-optimizer-frontend-core`
Expected: PASS. If the `RunOptimizerRequest` extras field rejects `SelectedPoint`, narrow with a single explicit cast at this one site: `{ selectedPoint: selectedPoint as RunOptimizerRequest['extras']['selectedPoint'] }` — but NOT through `unknown`.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/common/types/common.ts packages/core/src/context/experiment/api.ts
git commit -m "Type selectedPoint as SelectedPoint, drop double-cast (#4)"
```

### Task 5: Typed pareto-plot parser + domain helpers in core (#10)

**Files:**

- Create: `packages/core/src/common/util/pareto/pareto-plot.ts`
- Test: `packages/core/src/common/util/pareto/pareto-plot.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest'
import { parseParetoPlot, costDomain } from './pareto-plot'

const REAL = {
  front_x_data: [
    [58.2, 21.4, 85, 6, 'Frosting'],
    [16.7, 500, 250, 20, 'None'],
  ],
  front_y_data: [
    [-6, -25],
    [-2, -17],
  ],
  obj1_error: [0.015, 0.02],
  obj2_error: [0.18, 0.2],
  best_idx: 1,
}

describe('parseParetoPlot', () => {
  it('parses a real backend pareto_data payload', () => {
    const p = parseParetoPlot(REAL)
    expect(p.best_idx).toBe(1)
    expect(p.front_y_data).toHaveLength(2)
    expect(p.obj1_error[0]).toBe(0.015)
  })

  it('returns null for an empty object', () => {
    expect(parseParetoPlot({})).toBeNull()
  })

  it('returns null for non-pareto JSON', () => {
    expect(parseParetoPlot({ data: [1, 2, 3] })).toBeNull()
  })
})

describe('costDomain', () => {
  it('spans min/max cost ± obj2 error', () => {
    const d = costDomain(parseParetoPlot(REAL)!)
    expect(d).not.toBeUndefined()
    expect(d![0]).toBeLessThan(-24)
    expect(d![1]).toBeGreaterThan(-16)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @boostv/process-optimizer-frontend-core -- --run pareto-plot`
Expected: FAIL — cannot find module `./pareto-plot`.

- [ ] **Step 3: Implement**

```typescript
import { z } from 'zod'

// Real backend pareto_data shape (verified against the live optimizer):
// errors are scalar numbers per front point, not tuples.
export const paretoPlotSchema = z.object({
  front_x_data: z.array(z.array(z.number().or(z.string()))),
  front_y_data: z.array(z.tuple([z.number(), z.number()])),
  obj1_error: z.array(z.number()),
  obj2_error: z.array(z.number()),
  best_idx: z.number(),
})

export type ParetoPlot = z.infer<typeof paretoPlotSchema>

// Parse an untyped, already-JSON-parsed value. Returns null when the value is
// not a valid pareto payload (empty object, single-objective response, etc.)
// so callers can render "no pareto" without try/catch.
export const parseParetoPlot = (raw: unknown): ParetoPlot | null => {
  const result = paretoPlotSchema.safeParse(raw)
  return result.success ? result.data : null
}

// Cost axis: [min, max] of front cost ± obj2 error. undefined when no front.
export const costDomain = (plot: ParetoPlot): [number, number] | undefined => {
  if (plot.front_y_data.length === 0) {
    return undefined
  }
  const lowers = plot.front_y_data.map(
    (yPair, i) => yPair[1] - (plot.obj2_error[i] ?? 0)
  )
  const uppers = plot.front_y_data.map(
    (yPair, i) => yPair[1] + (plot.obj2_error[i] ?? 0)
  )
  const all = [...lowers, ...uppers]
  return [Math.min(...all), Math.max(...all)]
}
```

- [ ] **Step 4: Export through the barrel**

Add `export * from './pareto/pareto-plot'` to `packages/core/src/common/util/index.ts`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test --workspace @boostv/process-optimizer-frontend-core -- --run pareto-plot`
Expected: PASS (all describe blocks).

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/common/util/pareto/ packages/core/src/common/util/index.ts
git commit -m "Add typed pareto-plot parser and domain helpers to core (#10)"
```

### Task 6: `selectActiveScoreVariableNames` selector (#9)

**Files:**

- Modify: `packages/core/src/context/experiment/experiment-selectors.ts`
- Test: `packages/core/src/context/experiment/experiment-selectors.test.ts` (create if absent; otherwise extend)

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest'
import { selectActiveScoreVariableNames } from './experiment-selectors'
import { initialState } from '@core/context'
import { produce } from 'immer'

describe('selectActiveScoreVariableNames', () => {
  it('returns names of enabled score variables in order', () => {
    const state = produce(initialState, draft => {
      draft.experiment.scoreVariables = [
        {
          name: 'quality',
          label: 'Quality (0-5)',
          description: '',
          enabled: true,
        },
        { name: 'cost', label: 'Cost', description: '', enabled: false },
      ]
    })
    expect(selectActiveScoreVariableNames(state)).toEqual(['quality'])
  })
})
```

(If `experiment-selectors.test.ts` exists, add this `describe` block and reuse its existing imports/helpers instead of duplicating them.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @boostv/process-optimizer-frontend-core -- --run experiment-selectors`
Expected: FAIL — `selectActiveScoreVariableNames` is not exported.

- [ ] **Step 3: Implement (mirror `selectActiveScoreVariableLabels`, line 49)**

Add directly below `selectActiveScoreVariableLabels`:

```typescript
export const selectActiveScoreVariableNames = (state: State): string[] => {
  const experiment = selectExperiment(state)
  return experiment.scoreVariables.filter(s => s.enabled).map(s => s.name)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace @boostv/process-optimizer-frontend-core -- --run experiment-selectors`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/context/experiment/experiment-selectors.ts packages/core/src/context/experiment/experiment-selectors.test.ts
git commit -m "Add selectActiveScoreVariableNames selector (#9)"
```

### Task 7: Selection-invalidation wrapper (#3)

**Files:**

- Modify: `packages/core/src/context/experiment/experiment-reducers.ts`
- Test: `packages/core/src/context/experiment/experiment-reducers.test.ts` (create if absent; otherwise extend)

The reducer is `export const experimentReducer = produce((state, action) => { ... })`. We will wrap it so a single post-pass clears `extras.selectedPoint` whenever the structural fields changed, and remove all 11 inline `clearParetoSelection(state)` calls.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest'
import { experimentReducer } from './experiment-reducers'
import { initialState } from '@core/context'
import { produce } from 'immer'

describe('experimentReducer pareto selection invalidation', () => {
  const withSelection = produce(initialState.experiment, draft => {
    draft.extras.selectedPoint = [1, 2, 'Red']
    draft.valueVariables = []
  })

  it('clears selectedPoint when a structural action changes valueVariables', () => {
    const next = experimentReducer(withSelection, {
      type: 'addValueVariable',
      payload: {
        name: 'A',
        description: '',
        min: 0,
        max: 10,
        type: 'continuous',
        enabled: true,
      },
    })
    expect('selectedPoint' in next.extras).toBe(false)
  })

  it('keeps selectedPoint when an action sets it explicitly', () => {
    const next = experimentReducer(initialState.experiment, {
      type: 'setSelectedParetoPoint',
      payload: [1, 2, 'Red'],
    })
    expect(next.extras.selectedPoint).toEqual([1, 2, 'Red'])
  })

  it('keeps selectedPoint across a non-structural action', () => {
    const next = experimentReducer(withSelection, {
      type: 'updateExperimentName',
      payload: 'new name',
    })
    expect(next.extras.selectedPoint).toEqual([1, 2, 'Red'])
  })
})
```

(Adjust the `addValueVariable` payload to match the real action shape if the build complains — inspect the `case 'addValueVariable'` block. The `updateExperimentName` action is illustrative of any non-structural action; substitute a real non-structural action type if that one does not exist.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @boostv/process-optimizer-frontend-core -- --run experiment-reducers`
Expected: With the inline `clearParetoSelection` calls still present, assertion #1 already passes — this run establishes the baseline. The real test of the refactor is that all three assertions still pass _after_ Steps 3-4 remove the inline calls and replace them with the wrapper. Proceed to Step 3.

- [ ] **Step 3: Rename the inner reducer and add the wrapper**

Change the declaration from:

```typescript
export const experimentReducer = produce(
  (state: ExperimentType, action: ExperimentAction): void | ExperimentType => {
```

to (note: not exported anymore):

```typescript
const experimentReducerInner = produce(
  (state: ExperimentType, action: ExperimentAction): void | ExperimentType => {
```

Then at the end of the file add the wrapper:

```typescript
const STRUCTURAL_KEYS = [
  'valueVariables',
  'categoricalVariables',
  'scoreVariables',
  'dataPoints',
] as const

// Single invalidation policy: any action that changes a structural field
// invalidates a stored pareto selection, whose coordinates would otherwise go
// stale. Replaces the 11 per-case clearParetoSelection(state) calls.
export const experimentReducer = (
  state: ExperimentType,
  action: ExperimentAction
): ExperimentType => {
  if (action.type === 'setSelectedParetoPoint') {
    return experimentReducerInner(state, action) as ExperimentType
  }
  const next = experimentReducerInner(state, action) as ExperimentType
  const changed = STRUCTURAL_KEYS.some(key => next[key] !== state[key])
  if (changed && 'selectedPoint' in next.extras) {
    return produce(next, draft => {
      delete draft.extras.selectedPoint
    })
  }
  return next
}
```

(Immer gives referential inequality on `next[key]` vs `state[key]` only when that slice was mutated — this is exactly the "did this structural field change" signal we want.)

- [ ] **Step 4: Remove all 11 inline `clearParetoSelection(state)` calls**

Delete the `clearParetoSelection(state)` line from each of these cases: `addValueVariable`, `editValueVariable`, `deleteValueVariable`, `setValueVariableEnabled`, `addCategorialVariable`, `editCategoricalVariable`, `deleteCategorialVariable`, `setCategoricalVariableEnabled`, `updateConfiguration`, `updateDataPoints`, `experiment/toggleMultiObjective`. Then delete the now-unused `clearParetoSelection` helper definition (lines 70-74).

Run: `grep -n "clearParetoSelection" packages/core/src/context/experiment/experiment-reducers.ts`
Expected: no output.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test --workspace @boostv/process-optimizer-frontend-core -- --run experiment-reducers`
Expected: PASS. Also run the full core suite to catch regressions in existing reducer tests: `npm run test --workspace @boostv/process-optimizer-frontend-core -- --run`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/context/experiment/experiment-reducers.ts packages/core/src/context/experiment/experiment-reducers.test.ts
git commit -m "Replace 11 inline clearParetoSelection calls with one invalidation wrapper (#3)"
```

---

## Phase C — UI untangle (#9, #10)

### Task 8: `resolveSelectedIndex` helper in `result.utils.ts`

**Files:**

- Modify: `packages/ui/src/features/multi-objective/result.utils.ts`
- Test: `packages/ui/src/features/multi-objective/result.utils.test.ts`

- [ ] **Step 1: Add the failing test (append to existing describe blocks)**

```typescript
import { resolveSelectedIndex } from './result.utils'

describe('resolveSelectedIndex', () => {
  const front: Array<Array<number | string>> = [
    [100, 'Vanilla'],
    [120, 'Chocolate'],
  ]

  it('returns the matched front index when coords are present', () => {
    expect(resolveSelectedIndex(front, [120, 'Chocolate'], 0)).toBe(1)
  })

  it('falls back to bestIdx when coords are undefined', () => {
    expect(resolveSelectedIndex(front, undefined, 0)).toBe(0)
  })

  it('falls back to bestIdx when coords do not match', () => {
    expect(resolveSelectedIndex(front, [999, 'X'], 1)).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @boostv/process-optimizer-frontend-ui -- --run result.utils`
Expected: FAIL — `resolveSelectedIndex` not exported.

- [ ] **Step 3: Implement (append to `result.utils.ts`, reusing `matchFrontIndex`)**

```typescript
export const resolveSelectedIndex = (
  front: Array<Array<number | string>>,
  selectedCoords: Array<number | string> | undefined,
  bestIdx: number
): number => {
  if (!selectedCoords) {
    return bestIdx
  }
  const idx = matchFrontIndex(front, selectedCoords)
  return idx >= 0 ? idx : bestIdx
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace @boostv/process-optimizer-frontend-ui -- --run result.utils`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/features/multi-objective/result.utils.ts packages/ui/src/features/multi-objective/result.utils.test.ts
git commit -m "Add resolveSelectedIndex helper (#10)"
```

### Task 9: Refactor `result.tsx` to use core parser/helpers, score-role, flat view

**Files:**

- Modify: `packages/ui/src/features/multi-objective/result.tsx`

- [ ] **Step 1: Update imports**

In the `@boostv/process-optimizer-frontend-core` import (lines 8-21), add `parseParetoPlot`, `costDomain`, `displayQualityCI`, `selectActiveScoreVariableNames`. Remove `experimentResultSchema` if it becomes unused. Update the local import from `./result.utils` to `{ matchFrontIndex, resolveSelectedIndex }` (drop `matchFrontIndex` there if no longer used directly).

- [ ] **Step 2: Replace `convertScoreToString` (lines 43-52) with the core helper**

Delete the local `convertScoreToString` function. Replace its call site (search `convertScoreToString(`) with `displayQualityCI(value, stdDev)` — note the call site currently passes a `number[]`; destructure `[value, stdDev]` at the call site and pass them, or add a tiny local adapter `const convertScoreToString = (data: number[]) => displayQualityCI(data[0] ?? 0, data[1] ?? 0)` to avoid touching the call site.

- [ ] **Step 3: Replace the JSON.parse + empty check (lines 142-146)**

Replace:

```typescript
const pareto = JSON.parse(paretoRaw?.plot ?? '{}')

if (Object.keys(pareto).length === 0) {
  return null
}
```

with:

```typescript
const pareto = parseParetoPlot(
  paretoRaw?.plot ? JSON.parse(paretoRaw.plot) : null
)

if (!pareto) {
  return null
}
```

- [ ] **Step 4: Replace the costDomain IIFE (lines 148-172)** with the core helper:

```typescript
const cost = costDomain(pareto)
```

(Rename downstream references from `costDomain` the local const to `cost`, or keep the const name `costDomain` by writing `const costDomain = costDomainHelper(pareto)` with an aliased import `costDomain as costDomainHelper`. Prefer renaming the local to `cost` and updating the two usages in the plotData IIFE.)

- [ ] **Step 5: Replace the string-sniffing (lines 192-195)**

Replace:

```typescript
const header = scoreHeaders[index] ?? ''
const lower = header.toLowerCase()
const isQuality = lower.includes('quality')
const isCost = lower.includes('cost')
```

with (add `const scoreVarNames = useSelector(selectActiveScoreVariableNames)` next to the existing `scoreHeaders` selector at line ~88):

```typescript
const header = scoreHeaders[index] ?? ''
const role = scoreVarNames[index]
const isQuality = role === 'quality'
const isCost = role === 'cost'
```

- [ ] **Step 6: Replace the selected-index IIFE (lines 237-247)** in the `<ParetoFrontPlot>` JSX:

```typescript
indexOfSelected={resolveSelectedIndex(
  pareto.front_x_data,
  selectedCoords,
  pareto.best_idx
)}
```

- [ ] **Step 7: Type `selectedCoords` via the core type (lines 95-97)**

```typescript
const selectedCoords = experiment.extras.selectedPoint as
  | SelectedPoint
  | undefined
```

(Add `SelectedPoint` to the core import.)

- [ ] **Step 8: Build + test ui**

Run: `npm run build --workspace @boostv/process-optimizer-frontend-ui && npm run test --workspace @boostv/process-optimizer-frontend-ui -- --run`
Expected: PASS. The `plotData` per-row xDomain IIFE (lines 196-221) may remain as-is (it operates on the single-plot `OneDData`, not pareto) — leave it unless it references the removed `costDomain` const, in which case update to `cost`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/features/multi-objective/result.tsx
git commit -m "Use core pareto parser/helpers and score-role in result.tsx (#9,#10)"
```

---

## Phase D — Capture real sample data (#2)

### Task 10: Capture `pareto-demo.json` from the live backend

**Files:**

- Create: `packages/plots/src/sample-data/pareto-demo.json`
- Create: `packages/plots/src/sample-data/single-png.json`

- [ ] **Step 1: Confirm the backend is up**

Run: `curl -s -m 5 http://127.0.0.1:9090/v1.0/health`
Expected: `"OK"`. (Note: the working base path is `/v1.0`, not `/v1`.)

- [ ] **Step 2: Capture the optimizer response and extract `pareto_data`**

Run:

```bash
mkdir -p packages/plots/src/sample-data
curl -s -m 60 "http://127.0.0.1:9090/v1.0/optimizer?apikey=none" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {"xi": [16.7, 500, 250, 20, "None"], "yi": [-2, -17]},
      {"xi": [50, 833, 150, 60, "Whipped cream"], "yi": [-3, -6]},
      {"xi": [58.3, 22, 85, 6, "Frosting"], "yi": [-6, -25]}
    ],
    "optimizerConfig": {
      "baseEstimator": "GP", "acqFunc": "EI", "initialPoints": 3, "kappa": 1.96, "xi": 2,
      "space": [
        {"type": "continuous", "name": "Sugar", "from": 0, "to": 100},
        {"type": "continuous", "name": "Flour", "from": 0, "to": 1000},
        {"type": "discrete", "name": "Temperature", "from": 0, "to": 300},
        {"type": "discrete", "name": "Time", "from": 0, "to": 120},
        {"type": "category", "name": "Finish", "categories": ["None", "Frosting", "Whipped cream"]}
      ],
      "constraints": []
    },
    "extras": {"experimentSuggestionCount": 1, "graphs": ["pareto", "single"], "graphFormat": "json"}
  }' -o /tmp/optimizer-response.json -w "[HTTP %{http_code}]\n"

node -e 'const r=require("/tmp/optimizer-response.json"); const p=r.plots.find(x=>x.id==="pareto_data"); require("fs").writeFileSync("packages/plots/src/sample-data/pareto-demo.json", JSON.stringify(JSON.parse(p.plot), null, 2)+"\n")'
```

Expected: `[HTTP 200]` and `pareto-demo.json` written. (If the live server requires a different api key, replace `apikey=none`; a missing/invalid key returns 401.)

- [ ] **Step 3: Validate the captured shape against the parser**

Run:

```bash
node -e 'const d=require("./packages/plots/src/sample-data/pareto-demo.json"); const k=Object.keys(d).sort(); console.log(k); if(JSON.stringify(k)!==JSON.stringify(["best_idx","front_x_data","front_y_data","obj1_error","obj2_error"])) process.exit(1)'
```

Expected: prints the five keys and exits 0.

- [ ] **Step 4: Create the PNG asset for the PNGPlot demo**

Extract the existing base64 string currently in `packages/plots/src/demo-data.ts` (`export const singlePng = '...'`) into a JSON file so the demo no longer needs `demo-data.ts`:

```bash
node -e 'const m=require("fs").readFileSync("packages/plots/src/demo-data.ts","utf8"); const s=m.match(/singlePng\s*=\s*([\x27"])([\s\S]*?)\1/); require("fs").writeFileSync("packages/plots/src/sample-data/single-png.json", JSON.stringify({png: s[2]})+"\n")'
```

Expected: `single-png.json` written containing `{ "png": "<base64>" }`.

- [ ] **Step 5: Commit the captured samples**

```bash
git add packages/plots/src/sample-data/pareto-demo.json packages/plots/src/sample-data/single-png.json
git commit -m "Capture real pareto-data + PNG sample from backend (#2)"
```

---

## Phase E — Plots decomposition (#1, #5, #11, #12)

> These are extract-and-rewire tasks on `pareto-front-plot.tsx`. There is no test runner in `plots`; each task is verified by `npm run build --workspace @boostv/process-optimizer-frontend-plots` (typecheck + bundle) and, at the end, a visual check in the dev app. Move code verbatim where noted; only the seams (props/signatures) are new.

### Task 11: Trim `Props.plot` to the real shape

**Files:**

- Modify: `packages/plots/src/pareto-front-plot/pareto-front-plot.tsx`

- [ ] **Step 1: Replace the `plot` field of `Props` (lines 38-51)** with the real backend shape:

```typescript
  plot: {
    front_x_data: (number | string)[][]
    front_y_data: [number, number][]
    obj1_error: number[]
    obj2_error: number[]
    best_idx: number
  }
```

(This removes `obj1_1D_data`, `obj2_1D_data`, `obj1_mean`, `obj1_std`, `obj2_mean`, `obj2_std`, which are no longer referenced after Task 1.)

- [ ] **Step 2: Simplify `scalarError` usage if needed**

`scalarError(plot.obj1_error[i])` now receives a `number`. Keep `scalarError` as-is (it defensively handles both) — no change required, but confirm it compiles with a `number` argument.

- [ ] **Step 3: Build plots**

Run: `npm run build --workspace @boostv/process-optimizer-frontend-plots`
Expected: PASS. Fix any reference to the removed fields (there should be none after Task 1).

- [ ] **Step 4: Commit**

```bash
git add packages/plots/src/pareto-front-plot/pareto-front-plot.tsx
git commit -m "Trim ParetoFrontPlot plot prop to real backend shape (#4,#10)"
```

### Task 12: Extract the pixel projector → `use-data-to-pixel.ts`

**Files:**

- Create: `packages/plots/src/pareto-front-plot/use-data-to-pixel.ts`
- Modify: `packages/plots/src/pareto-front-plot/pareto-front-plot.tsx`

The same `xToPx`/`yToPx` closures appear in `ConfidenceEllipses` (lines 269-275) and `QualityUncertaintyBand` (lines 311-317) and the hover code. Extract one hook.

- [ ] **Step 1: Create the projector hook**

```typescript
import { usePlotArea } from 'recharts'

export type PixelProjector = {
  xToPx: (x: number) => number
  yToPx: (y: number) => number
  plotArea: ReturnType<typeof usePlotArea>
} | null

// Maps data coordinates to pixel coordinates within the Recharts plot area.
// Returns null until the plot area has non-zero size.
export const useDataToPixel = (
  xDomain: [number, number],
  yDomain: [number, number]
): PixelProjector => {
  const plotArea = usePlotArea()
  if (!plotArea || plotArea.width === 0 || plotArea.height === 0) {
    return null
  }
  const xToPx = (x: number) =>
    plotArea.x + ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * plotArea.width
  const yToPx = (y: number) =>
    plotArea.y +
    (1 - (y - yDomain[0]) / (yDomain[1] - yDomain[0])) * plotArea.height
  return { xToPx, yToPx, plotArea }
}
```

- [ ] **Step 2: Build plots** (file is unused yet but must typecheck)

Run: `npm run build --workspace @boostv/process-optimizer-frontend-plots`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/plots/src/pareto-front-plot/use-data-to-pixel.ts
git commit -m "Add useDataToPixel projector hook (#1)"
```

### Task 13: Extract overlays + point-label

**Files:**

- Create: `packages/plots/src/pareto-front-plot/overlays/confidence-ellipses.tsx`
- Create: `packages/plots/src/pareto-front-plot/overlays/uncertainty-band.tsx`
- Create: `packages/plots/src/pareto-front-plot/point-label.tsx`
- Modify: `packages/plots/src/pareto-front-plot/pareto-front-plot.tsx`

- [ ] **Step 1: `point-label.tsx` — parameterize the two duplicate label builders (lines 630-671 and 680-721)**

```typescript
import { ReactNode } from 'react'

type LabelColors = { fill: string; stroke: string; textFill: string }

// Factory for the Scatter `label.content` SVG builder. The two pareto scatter
// series differ only by color, so this replaces both duplicated 40-line blocks.
export const makePointLabel =
  ({ fill, stroke, textFill }: LabelColors) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (props: any): ReactNode => {
    const { x, y, id } = props
    if (!id) {
      return null
    }
    const text = `#${id}`
    const padding = 4
    const fontSize = 12
    const width = text.length * 7 + padding * 2
    const height = fontSize + padding * 2
    const rectX = x - width / 2
    const rectY = y - 5 - height
    return (
      <g>
        <rect x={rectX} y={rectY} width={width} height={height} fill={fill} stroke={stroke} strokeWidth={1} rx={2} />
        <text x={x} y={rectY + height / 2} fill={textFill} fontSize={fontSize} textAnchor="middle" dominantBaseline="middle">
          {text}
        </text>
      </g>
    )
  }
```

In `pareto-front-plot.tsx`, replace the two inline `label={{ position: 'top', content: ... }}` blocks with:

- dominated: `label={{ position: 'top', content: makePointLabel({ fill: 'white', stroke: '#bbb', textFill: '#888' }) }}`
- pareto-optimal: `label={{ position: 'top', content: makePointLabel({ fill: '#2b5879', stroke: '#2b5879', textFill: 'white' }) }}`

- [ ] **Step 2: `overlays/confidence-ellipses.tsx`**

Extract the `ConfidenceEllipses` component (lines 266-303). It needs `ellipseIndices`, `plot`, `xDomain`, `yDomain`, `displayQuality`, `scalarError`. Make them props:

```typescript
import { useDataToPixel } from '../use-data-to-pixel'

type Props = {
  ellipseIndices: number[]
  frontYData: [number, number][]
  obj1Error: number[]
  obj2Error: number[]
  xDomain: [number, number]
  yDomain: [number, number]
}

export const ConfidenceEllipses = ({
  ellipseIndices, frontYData, obj1Error, obj2Error, xDomain, yDomain,
}: Props) => {
  const proj = useDataToPixel(xDomain, yDomain)
  if (!proj) return null
  const { xToPx, yToPx } = proj
  return (
    <g pointerEvents="none">
      {ellipseIndices.map(i => {
        const yPair = frontYData[i]
        if (!yPair) return null
        const cxData = -yPair[0] // displayQuality
        const cyData = yPair[1]
        const e1 = obj1Error[i] ?? 0
        const e2 = obj2Error[i] ?? 0
        const cx = xToPx(cxData)
        const cy = yToPx(cyData)
        const rx = Math.abs(xToPx(cxData + e1) - cx)
        const ry = Math.abs(yToPx(cyData + e2) - cy)
        return (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
            fill="rgba(7, 122, 206, 0.08)" stroke="rgba(7, 122, 206, 0.5)" strokeWidth={1} />
        )
      })}
    </g>
  )
}
```

Recharts `<Customized component={...} />` passes no props, so in the parent render an inline wrapper: `<Customized component={() => <ConfidenceEllipses ellipseIndices={ellipseIndices} frontYData={plot.front_y_data} obj1Error={plot.obj1_error} obj2Error={plot.obj2_error} xDomain={xDomain} yDomain={yDomain} />} />`. Keep `displayQuality` import from core (`displayQuality(yPair[0])`) instead of the inline `-yPair[0]` if preferred — match the parent's usage.

- [ ] **Step 3: `overlays/uncertainty-band.tsx`**

Extract `QualityUncertaintyBand` (lines 308-363) the same way: pass `xLowerBoundData`, `xUpperBoundData`, `xDomain`, `yDomain` as props; use `useDataToPixel`. Move the verbatim path-building body (lines 318-362).

- [ ] **Step 4: Build plots**

Run: `npm run build --workspace @boostv/process-optimizer-frontend-plots`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/plots/src/pareto-front-plot/overlays/ packages/plots/src/pareto-front-plot/point-label.tsx packages/plots/src/pareto-front-plot/pareto-front-plot.tsx
git commit -m "Extract pareto overlays and point-label (#1)"
```

### Task 14: Rewrite the hover system → `hover-overlay.tsx` (#5)

**Files:**

- Create: `packages/plots/src/pareto-front-plot/hover-overlay.tsx`
- Modify: `packages/plots/src/pareto-front-plot/pareto-front-plot.tsx`

**Approach:** Replace the imperative `querySelector` hover (refs + RAF + DOM mutation, lines 391-564 + the hover ref `<div>`s at 762-806) with a `<Customized>` SVG overlay that reads a hovered data-x from React state and renders the vertical line + dot + label inside the chart SVG using `useDataToPixel`. **Fallback:** if the SVG-coordinate hover cannot match current behavior in the visual check (Step 4), move the existing imperative implementation verbatim into `hover-overlay.tsx` behind a `<FrontHover containerRef={...} ... />` component and keep the container handlers — preserving exact current behavior. Decide at Step 4.

- [ ] **Step 1: Add hovered-index state in the parent**

Add `const [hoverIndex, setHoverIndex] = useState<number | null>(null)`. On the chart container, set `onMouseMove` to compute the nearest front index from the mouse position and `onMouseLeave={() => setHoverIndex(null)}`. Compute nearest index using the container bounding rect + plot area; reuse the existing nearest-point logic from `handleMouseMove` (lines ~493-553) but store only the index instead of mutating DOM.

- [ ] **Step 2: Create `hover-overlay.tsx`**

```typescript
import { displayQuality } from '@boostv/process-optimizer-frontend-core'
import { useDataToPixel } from './use-data-to-pixel'

type Props = {
  index: number | null
  frontYData: [number, number][]
  frontXData: (number | string)[][]
  variableNames: string[]
  xDomain: [number, number]
  yDomain: [number, number]
}

export const HoverOverlay = ({
  index, frontYData, frontXData, variableNames, xDomain, yDomain,
}: Props) => {
  const proj = useDataToPixel(xDomain, yDomain)
  if (proj === null || index === null) return null
  const yPair = frontYData[index]
  if (!yPair) return null
  const { xToPx, yToPx, plotArea } = proj
  const qx = displayQuality(yPair[0])
  const cx = xToPx(qx)
  const cy = yToPx(yPair[1])
  const coords = frontXData[index] ?? []
  return (
    <g pointerEvents="none">
      <line x1={cx} y1={plotArea.y} x2={cx} y2={plotArea.y + plotArea.height}
        stroke="rgba(43, 88, 121, 0.4)" strokeDasharray="4 3" />
      <circle cx={cx} cy={cy} r={5} fill="#077ace" stroke="white" strokeWidth={2} />
      <g transform={`translate(${cx + 8}, ${plotArea.y + 12})`}>
        <text fontSize={12} fill="#077ace">{`Quality: ${qx.toFixed(2)}`}</text>
        {variableNames.map((name, i) => (
          <text key={i} y={(i + 1) * 14} fontSize={11} fill="#2b5879">
            {`${name}: ${coords[i] ?? ''}`}
          </text>
        ))}
      </g>
    </g>
  )
}
```

Render in the parent inside `<ComposedChart>` alongside the other overlays: `<Customized component={() => <HoverOverlay index={hoverIndex} frontYData={plot.front_y_data} frontXData={plot.front_x_data} variableNames={variableNames} xDomain={xDomain} yDomain={yDomain} />} />`.

- [ ] **Step 3: Delete the dead imperative hover code**

Remove the hover refs (`rafRef`, `hoverLineRef`, `hoverLabelRef`, `hoverDotRef`, lines 392-395), `pixelToDataX`, `showHover`, `hideHover`, and the DOM-mutating parts of `handleMouseMove`/`handleMouseLeave` (keep only the index computation moved to Step 1), and the three hover `<div ref=...>` blocks (lines 762-806). Keep `containerRef` only if Step 1 needs it for the bounding rect.

- [ ] **Step 4: Build + VISUAL CHECK (fallback decision point)**

Run: `npm run build --workspace @boostv/process-optimizer-frontend-plots`
Expected: PASS.
Then run the dev app (Task 17 Step 1) and hover the pareto front. If the vertical line, dot, and label track the front correctly → keep the rewrite. If not → **fallback:** restore the imperative implementation (from git history of this file) verbatim into `hover-overlay.tsx` as a `<FrontHover>` component taking the container ref + domains, re-add the handlers/refs, and render it; this preserves exact prior behavior. Note which path was taken in the commit message.

- [ ] **Step 5: Commit**

```bash
git add packages/plots/src/pareto-front-plot/hover-overlay.tsx packages/plots/src/pareto-front-plot/pareto-front-plot.tsx
git commit -m "Replace manual querySelector hover with usePlotArea overlay (#5)"
```

### Task 15: Render-prop controls (#11) + mode-dependent domain (#12)

**Files:**

- Modify: `packages/plots/src/pareto-front-plot/pareto-front-plot.tsx`
- Modify: `packages/ui/src/features/multi-objective/result.tsx`

- [ ] **Step 1: Replace cloneElement with callbacks (#11)**

In `Props`, replace `fitToFrontButton?: ReactNode`, `resetToDefaultButton?: ReactNode` with explicit callbacks and an optional renderer:

```typescript
  onToggleFitToFront?: () => void
  onResetToDefault?: () => void
  renderControls?: (api: {
    onToggleFitToFront: () => void
    onResetToDefault: () => void
  }) => ReactNode
```

Replace the `cloneElement` block (lines 908-928) with:

```tsx
{
  ;(renderControls || visualizationModeSelector) && (
    <div className={classes.buttonColumn}>
      {visualizationModeSelector}
      {renderControls?.({
        onToggleFitToFront: () => setFitToFront(f => !f),
        onResetToDefault: () => onResetToDefault?.(),
      })}
    </div>
  )
}
```

Remove `cloneElement` and `isValidElement` from the React import.

- [ ] **Step 2: Update the caller in `result.tsx`**

Replace `fitToFrontButton`/`resetToDefaultButton` props with:

```tsx
renderControls={({ onToggleFitToFront, onResetToDefault }) => (
  <>
    <Button variant="outlined" size="small" onClick={onToggleFitToFront}>
      Toggle front fit
    </Button>
    <Button variant="outlined" size="small" onClick={onResetToDefault}>
      Reset to default
    </Button>
  </>
)}
onResetToDefault={() =>
  dispatch({ type: 'setSelectedParetoPoint', payload: null })
}
```

- [ ] **Step 3: Make band bounds mode-dependent (#12)**

In the `allXValues`/`allYValues` computation (lines 176-188), include `xLowerBoundData`/`xUpperBoundData` only in band mode:

```typescript
const bandX =
  visualizationMode === 'band'
    ? [...xLowerBoundData.map(d => d.x), ...xUpperBoundData.map(d => d.x)]
    : []
const bandY =
  visualizationMode === 'band'
    ? [...xLowerBoundData.map(d => d.y), ...xUpperBoundData.map(d => d.y)]
    : []
const allXValues = [
  ...bandX,
  ...chartData.map(d => d.x),
  ...dataPointsMapped.map(d => d.x),
].filter((v): v is number => typeof v === 'number')
const allYValues = [
  ...bandY,
  ...chartData.map(d => d.y),
  ...chartData.flatMap(d => d.uncertaintyY),
  ...dataPointsMapped.map(d => d.y),
].filter((v): v is number => typeof v === 'number')
```

- [ ] **Step 4: Build plots + ui**

Run: `npm run build --workspace @boostv/process-optimizer-frontend-plots && npm run build --workspace @boostv/process-optimizer-frontend-ui`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/plots/src/pareto-front-plot/pareto-front-plot.tsx packages/ui/src/features/multi-objective/result.tsx
git commit -m "Render-prop controls and mode-dependent axis domain (#11,#12)"
```

### Task 16: Wire `demo.tsx` to the real sample + delete plots `demo-data.ts`

**Files:**

- Modify: `packages/plots/src/demo.tsx`
- Delete: `packages/plots/src/demo-data.ts`

- [ ] **Step 1: Rewrite the top of `demo.tsx`**

Replace the `import { singlePng, paretoJson } from './demo-data'` and the `paretoJson as unknown as {...}` cast (lines 4-20) with:

```typescript
import { parseParetoPlot } from '@boostv/process-optimizer-frontend-core'
import paretoDemo from './sample-data/pareto-demo.json'
import singlePngJson from './sample-data/single-png.json'

const pareto = parseParetoPlot(paretoDemo)
if (!pareto) {
  throw new Error('pareto-demo.json is not a valid pareto payload')
}
const singlePng = (singlePngJson as { png: string }).png
```

(Ensure `tsconfig`/vite allow JSON imports — `resolveJsonModule` is standard; if the build complains, add `"resolveJsonModule": true` to `packages/plots/tsconfig.json` compilerOptions.)

- [ ] **Step 2: Remove the `obj1_1D_data` OneDPlot mapping**

Delete `mapToOneDData` and `const obj1Plots = pareto.obj1_1D_data.map(...)` and the `{obj1Plots.map(...)}` render block. Keep the existing static `<OneDPlot data={{ points: [...] }} />` examples (the score/numeric/options literals already in the file) so the demo still exercises OneDPlot.

- [ ] **Step 3: Update the `<ParetoFrontPlot>` usage in the demo**

Match the new prop API (Task 15): replace `fitToFrontButton`/`resetToDefaultButton` with `renderControls={({ onToggleFitToFront, onResetToDefault }) => (<><button onClick={onToggleFitToFront}>Toggle front fit</button><button onClick={onResetToDefault}>Reset to default</button></>)}` and keep `onResetToDefault={() => setSelectedPoint(pareto.best_idx)}`. `plot={pareto}` now passes the parsed real data.

- [ ] **Step 4: Delete `demo-data.ts`**

```bash
git rm packages/plots/src/demo-data.ts
```

- [ ] **Step 5: Build plots**

Run: `npm run build --workspace @boostv/process-optimizer-frontend-plots`
Expected: PASS. Confirm no remaining references: `grep -rn "demo-data" packages/plots/src` → no output.

- [ ] **Step 6: Commit**

```bash
git add packages/plots/src/demo.tsx packages/plots/tsconfig.json
git commit -m "Wire plots demo to real captured sample; delete demo-data.ts (#2)"
```

---

## Phase F — Full verification

### Task 17: Build, test, lint, visual check, changeset

- [ ] **Step 1: Visual check in the dev app**

Run: `npm run dev:app` (serves the sample app; it talks to the backend on `:9090`).
Open the multi-objective result. Verify: pareto plot renders in **ellipses** and **band** modes (the mode selector now shows only those two); hover tracks the front; clicking selects a point; "Reset to default" clears selection; switching modes does **not** rescale the axes unexpectedly (#12). Stop the dev server when done.

- [ ] **Step 2: Full typecheck/build across all packages**

Run: `npm run build -ws`
Expected: PASS for core, api, plots, ui, sample-app.

- [ ] **Step 3: Full test suite**

Run: `npm run test -ws -- --run`
Expected: PASS (core + ui; plots has no tests).

- [ ] **Step 4: Lint + format**

Run: `npm run lint && npm run prettier`
Expected: no errors. If prettier reports unformatted files, run `npx prettier --write` on them and re-check.

- [ ] **Step 5: Add a changeset**

Run: `npx changeset` and write a summary: "Refactor pareto-front-plot into focused modules; centralize quality negation; fix stale pareto-selection handling; replace fabricated demo data with real backend-captured sample." Select the affected packages (core, plots, ui) with a patch/minor bump as appropriate.

- [ ] **Step 6: Final commit**

```bash
git add .changeset
git commit -m "Add changeset for pareto-plot review remediation"
```

---

## Out of scope (per design)

- OpenAPI client regeneration / `specification.yml` edits; the generated `ExperimentExtrasSelectedPointInner` empty interface and `expectedMinimum`/`next`/`xi` weakening are left untouched.
- #13 nits other than `console.log`: hardcoded `<ComposedChart width/height>`, untracked `new-multi-test.json`, and the `docs/superpowers/` artifacts.
- Adding a test runner to the `plots` package.
