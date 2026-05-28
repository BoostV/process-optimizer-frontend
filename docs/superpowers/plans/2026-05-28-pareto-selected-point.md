# Pareto-point selection & pickled cache wiring — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a user clicks a point on the Pareto plot, store the X-space coordinates in `experiment.extras.selectedPoint`, and on the next evaluation send both `extras.selectedPoint` and `extras.pickled` to the backend. Re-evaluation is triggered through the existing dirty-flag flow — the action itself does not call `evaluate()`.

**Architecture:**

- New `setSelectedParetoPoint` reducer action mutates `experiment.extras.selectedPoint` (or clears it on `null`).
- A `clearParetoSelection` helper is called at the top of structural reducers (dataPoints, config, variable mutations, toggleMultiObjective) so that changing the experiment wipes the stale selection.
- `createFetchExperimentResultRequest` reads `experiment.extras.selectedPoint` and `experiment.results.pickled` and forwards them as `extras.selectedPoint` / `extras.pickled` on the request body.
- `Result.tsx` derives `indexOfSelected` from `experiment.extras.selectedPoint` against `pareto.front_x_data` via a `matchFrontIndex` helper; falls back to `pareto.best_idx` on no match.

**Tech Stack:** TypeScript, immer (reducers), zod (schemas), vitest (tests), React (UI), Recharts (plot already in place).

**Spec:** `docs/superpowers/specs/2026-05-28-pareto-selected-point-design.md`

**Live backend for E2E:** `http://127.0.0.1:9090/v1.0` with `apikey=none`. Used in Task 6.

## File Structure

| File                                                            | Change                                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `packages/core/src/context/experiment/experiment-reducers.ts`   | Add action variant + handler + `clearParetoSelection` helper + calls in 9 cases |
| `packages/core/src/context/experiment/reducers.ts`              | Add `setSelectedParetoPoint` to switch case list                                |
| `packages/core/src/context/experiment/test-utils.ts`            | Add `setSelectedParetoPoint` entry to `dummyPayloads`                           |
| `packages/core/src/context/experiment/reducers.test.ts`         | New tests; fix the hardcoded hash in `updateExperiment` test                    |
| `packages/core/src/context/experiment/api.ts`                   | Include `selectedPoint` and `pickled` in request extras                         |
| `packages/core/src/context/experiment/api.test.ts`              | **New file** — tests for the request builder                                    |
| `packages/ui/src/features/multi-objective/result.utils.ts`      | **New file** — `matchFrontIndex` helper                                         |
| `packages/ui/src/features/multi-objective/result.utils.test.ts` | **New file** — tests for `matchFrontIndex`                                      |
| `packages/ui/src/features/multi-objective/result.tsx`           | Derive index from extras, dispatch action on click and reset                    |

---

## Task 1: Add `setSelectedParetoPoint` action and handler

**Files:**

- Modify: `packages/core/src/context/experiment/experiment-reducers.ts`
- Modify: `packages/core/src/context/experiment/reducers.ts`
- Modify: `packages/core/src/context/experiment/test-utils.ts`
- Modify: `packages/core/src/context/experiment/reducers.test.ts`

The action stores an X-space coordinate array under `extras.selectedPoint`, or removes the key when payload is `null`. It does not call `evaluate`. The existing `calculateChangeReducer` (wrapped by `rootReducer`) sets `changedSinceLastEvaluation = true` automatically because the request hash now differs.

### - [ ] Step 1: Write failing reducer tests

Add the following `describe` block inside `describe('experiment reducer', ...)` in `packages/core/src/context/experiment/reducers.test.ts`. Place it immediately after the existing `describe('updateExperiment', ...)` block (around line 188).

```ts
describe('setSelectedParetoPoint', () => {
  it('should set extras.selectedPoint to the coord array', () => {
    const actual = rootReducer(initState, {
      type: 'setSelectedParetoPoint',
      payload: [120, 'Chocolate'],
    })
    expect(actual.experiment.extras.selectedPoint).toEqual([120, 'Chocolate'])
  })

  it('should delete extras.selectedPoint when payload is null', () => {
    const seeded = produce(initState, draft => {
      draft.experiment.extras.selectedPoint = [120, 'Chocolate']
    })
    const actual = rootReducer(seeded, {
      type: 'setSelectedParetoPoint',
      payload: null,
    })
    expect('selectedPoint' in actual.experiment.extras).toBe(false)
  })

  it('should mark experiment as changed when a selection is set', () => {
    const startHash = md5(
      JSON.stringify(createFetchExperimentResultRequest(initState.experiment))
    )
    const cleanStart = produce(initState, draft => {
      draft.experiment.lastEvaluationHash = startHash
      draft.experiment.changedSinceLastEvaluation = false
    })
    const actual = rootReducer(cleanStart, {
      type: 'setSelectedParetoPoint',
      payload: [120, 'Chocolate'],
    })
    expect(actual.experiment.changedSinceLastEvaluation).toBe(true)
  })
})
```

### - [ ] Step 2: Run the tests to verify they fail

```bash
npm test --workspace=@boostv/process-optimizer-frontend-core -- --run reducers.test.ts
```

Expected: failures (`setSelectedParetoPoint` is not a known action — TypeScript compile error in test).

### - [ ] Step 3: Add the action variant

Open `packages/core/src/context/experiment/experiment-reducers.ts`. Add the new variant to the `ExperimentAction` union. Place it directly after the `registerResult` variant (around line 81):

```ts
  | {
      type: 'setSelectedParetoPoint'
      payload: Array<number | string> | null
    }
```

### - [ ] Step 4: Add the reducer case

In the same file's `experimentReducer` switch (around line 174), add a new case. Place it directly after the `case 'registerResult':` block (around line 385):

```ts
      case 'setSelectedParetoPoint':
        if (action.payload === null) {
          delete state.extras.selectedPoint
        } else {
          state.extras.selectedPoint = action.payload
        }
        break
```

### - [ ] Step 5: Add the case to `rootReducer`

Open `packages/core/src/context/experiment/reducers.ts`. Add `setSelectedParetoPoint` to the switch case fall-through list. Place it directly after `case 'registerResult':` (around line 28):

```ts
    case 'setSelectedParetoPoint':
```

The line is bare (no body) — it falls through to the shared block that calls `experimentReducer` + `validationReducer` + `calculateChangeReducer`.

### - [ ] Step 6: Add the dummy payload entry

Open `packages/core/src/context/experiment/test-utils.ts`. The `Payloads` type is keyed off every member of `ExperimentAction`, so the file will fail to compile until `setSelectedParetoPoint` has an entry. Add to the `dummyPayloads` object (around line 102):

```ts
  setSelectedParetoPoint: [1, 'option1'] as Array<number | string> | null,
```

### - [ ] Step 7: Run the tests and verify they pass

```bash
npm test --workspace=@boostv/process-optimizer-frontend-core -- --run reducers.test.ts
```

Expected: all `setSelectedParetoPoint` tests PASS. Other tests in the file still pass.

### - [ ] Step 8: Commit

```bash
git add packages/core/src/context/experiment/experiment-reducers.ts \
        packages/core/src/context/experiment/reducers.ts \
        packages/core/src/context/experiment/test-utils.ts \
        packages/core/src/context/experiment/reducers.test.ts
git commit -m "Add setSelectedParetoPoint reducer action"
```

---

## Task 2: Clear `extras.selectedPoint` on structural mutations

**Files:**

- Modify: `packages/core/src/context/experiment/experiment-reducers.ts`
- Modify: `packages/core/src/context/experiment/reducers.test.ts`

Any reducer that structurally changes the experiment (data, config, variables, objective mode) should remove `extras.selectedPoint`. This way, after a run with the change applied, the server falls back to the default `best_idx`.

### - [ ] Step 1: Write failing tests

Add the following describe block inside `describe('experiment reducer', ...)` in `packages/core/src/context/experiment/reducers.test.ts`. Place it directly below the `describe('setSelectedParetoPoint', ...)` block added in Task 1.

```ts
describe('clearing extras.selectedPoint on structural mutations', () => {
  const seededState: State = produce(initState, draft => {
    draft.experiment.extras.selectedPoint = [120, 'Vanilla']
  })

  const cases: { name: string; action: ExperimentAction }[] = [
    {
      name: 'updateDataPoints',
      action: { type: 'updateDataPoints', payload: [] },
    },
    {
      name: 'updateConfiguration',
      action: {
        type: 'updateConfiguration',
        payload: initState.experiment.optimizerConfig,
      },
    },
    {
      name: 'addCategorialVariable',
      action: {
        type: 'addCategorialVariable',
        payload: createCategoricalVariable({ name: 'New' }),
      },
    },
    {
      name: 'editCategoricalVariable',
      action: {
        type: 'editCategoricalVariable',
        payload: { index: 0, newVariable: createCategoricalVariable({}) },
      },
    },
    {
      name: 'deleteCategorialVariable',
      action: { type: 'deleteCategorialVariable', payload: 0 },
    },
    {
      name: 'setCategoricalVariableEnabled',
      action: {
        type: 'setCategoricalVariableEnabled',
        payload: { index: 0, enabled: false },
      },
    },
    {
      name: 'addValueVariable',
      action: {
        type: 'addValueVariable',
        payload: createValueVariable({ name: 'Flour' }),
      },
    },
    {
      name: 'editValueVariable',
      action: {
        type: 'editValueVariable',
        payload: { index: 0, newVariable: createValueVariable({}) },
      },
    },
    {
      name: 'deleteValueVariable',
      action: { type: 'deleteValueVariable', payload: 0 },
    },
    {
      name: 'setValueVariableEnabled',
      action: {
        type: 'setValueVariableEnabled',
        payload: { index: 0, enabled: false },
      },
    },
    {
      name: 'experiment/toggleMultiObjective',
      action: { type: 'experiment/toggleMultiObjective' },
    },
  ]

  cases.forEach(({ name, action }) => {
    it(`should clear extras.selectedPoint on ${name}`, () => {
      const actual = rootReducer(seededState, action)
      expect('selectedPoint' in actual.experiment.extras).toBe(false)
    })
  })

  it('should NOT clear extras.selectedPoint on registerResult', () => {
    const actual = rootReducer(seededState, {
      type: 'registerResult',
      payload: {
        experimentVersion: seededState.experiment.info.version,
        result: {
          id: 'r',
          next: [],
          plots: [],
          pickled: 'p',
          expectedMinimum: [],
          extras: {},
        },
      },
    })
    expect(actual.experiment.extras.selectedPoint).toEqual([120, 'Vanilla'])
  })
})
```

### - [ ] Step 2: Run tests, verify they fail

```bash
npm test --workspace=@boostv/process-optimizer-frontend-core -- --run reducers.test.ts
```

Expected: every test in `clearing extras.selectedPoint on structural mutations` fails (selection is preserved through the reducer), except `should NOT clear ... on registerResult` which passes today.

### - [ ] Step 3: Add the helper and wire into reducer cases

Open `packages/core/src/context/experiment/experiment-reducers.ts`.

Add the helper at the top of the file, directly after the `calculateXi` helper (around line 68). It works on the immer draft, so a plain mutation is sufficient:

```ts
const clearParetoSelection = (state: ExperimentType) => {
  if ('selectedPoint' in state.extras) {
    delete state.extras.selectedPoint
  }
}
```

Then call `clearParetoSelection(state)` at the **start** of each of these existing cases inside `experimentReducer`. Insert the call as the first statement of each case body, before any existing logic:

- `case 'addValueVariable'` (around line 251)
- `case 'editValueVariable'` (around line 261) — inside the block, before `const oldVariable = ...`
- `case 'deleteValueVariable'` (around line 290) — inside the block, before `const oldValueVariables = ...`
- `case 'setValueVariableEnabled'` (around line 309) — inside the block, before `const valueVariable = ...`
- `case 'addCategorialVariable'` (around line 319)
- `case 'editCategoricalVariable'` (around line 331) — inside the block
- `case 'deleteCategorialVariable'` (around line 347) — inside the block
- `case 'setCategoricalVariableEnabled'` (around line 360) — inside the block
- `case 'updateConfiguration'` (around line 370)
- `case 'updateDataPoints'` (around line 386)
- `case 'experiment/toggleMultiObjective'` (around line 396)

Example pattern (`updateDataPoints`):

```ts
      case 'updateDataPoints':
        clearParetoSelection(state)
        experimentSchema.shape.dataPoints.parse(action.payload)
        state.dataPoints = defaultSorted(
          state.valueVariables,
          state.categoricalVariables,
          state.scoreVariables,
          action.payload
        )
        state.optimizerConfig.xi = calculateXi(state)
        break
```

Do **not** add the call to `case 'registerResult'`, `case 'setSelectedParetoPoint'`, `case 'updateExperiment'` (wholesale replacement already overwrites extras), `case 'updateSuggestionCount'`, name/description updates, constraint actions, or `copySuggestedToDataPoints`.

### - [ ] Step 4: Run tests, verify they pass

```bash
npm test --workspace=@boostv/process-optimizer-frontend-core -- --run reducers.test.ts
```

Expected: the new parameterized cases PASS. The `registerResult` case still preserves the selection. All other reducer tests still pass.

### - [ ] Step 5: Commit

```bash
git add packages/core/src/context/experiment/experiment-reducers.ts \
        packages/core/src/context/experiment/reducers.test.ts
git commit -m "Clear extras.selectedPoint on structural reducer actions"
```

---

## Task 3: Forward `selectedPoint` and `pickled` in the request body

**Files:**

- Modify: `packages/core/src/context/experiment/api.ts`
- Create: `packages/core/src/context/experiment/api.test.ts`
- Modify: `packages/core/src/context/experiment/reducers.test.ts` (update broken hash literal)

The request builder reads `experiment.extras.selectedPoint` and `experiment.results.pickled` and forwards them as extras on the outgoing request. Keys are omitted entirely when there is no value, so requests with no selection stay byte-equivalent to today's.

### - [ ] Step 1: Write failing builder tests

Create `packages/core/src/context/experiment/api.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { emptyExperiment } from './store'
import { createFetchExperimentResultRequest } from './api'

const baseExperiment = produce(emptyExperiment, draft => {
  draft.id = 'test-id'
})

describe('createFetchExperimentResultRequest', () => {
  it('omits extras.selectedPoint when no selection is set', () => {
    const req = createFetchExperimentResultRequest(baseExperiment)
    expect('selectedPoint' in (req.experiment?.extras ?? {})).toBe(false)
  })

  it('includes extras.selectedPoint when set', () => {
    const exp = produce(baseExperiment, draft => {
      draft.extras.selectedPoint = [120, 'Vanilla']
    })
    const req = createFetchExperimentResultRequest(exp)
    expect(req.experiment?.extras?.selectedPoint).toEqual([120, 'Vanilla'])
  })

  it('omits extras.pickled when results.pickled is empty', () => {
    const req = createFetchExperimentResultRequest(baseExperiment)
    expect('pickled' in (req.experiment?.extras ?? {})).toBe(false)
  })

  it('includes extras.pickled when results.pickled is non-empty', () => {
    const exp = produce(baseExperiment, draft => {
      draft.results.pickled = 'cached-blob'
    })
    const req = createFetchExperimentResultRequest(exp)
    expect(req.experiment?.extras?.pickled).toBe('cached-blob')
  })
})
```

### - [ ] Step 2: Run the new tests; verify they fail

```bash
npm test --workspace=@boostv/process-optimizer-frontend-core -- --run api.test.ts
```

Expected: `includes extras.selectedPoint when set` and `includes extras.pickled when results.pickled is non-empty` both FAIL. The two `omits ...` tests pass.

### - [ ] Step 3: Update the request builder

Open `packages/core/src/context/experiment/api.ts`. Replace the entire current body of `createFetchExperimentResultRequest` with:

```ts
import {
  DefaultApi,
  ExperimentExtrasSelectedPointInner,
  RunOptimizerRequest,
} from '@boostv/process-optimizer-frontend-api'
import {
  ExperimentType,
  calculateConstraints,
  calculateData,
  calculateSpace,
  experimentResultSchema,
} from '@core/common'
import { selectCalculatedSuggestionCountFromExperiment } from './experiment-selectors'

export const createFetchExperimentResultRequest = (
  experiment: ExperimentType
) => {
  const cfg = experiment.optimizerConfig
  const extras = experiment.extras || {}
  const space = calculateSpace(experiment)

  const selectedPoint = experiment.extras.selectedPoint as
    | Array<number | string>
    | undefined
  const previousPickled = experiment.results.pickled || undefined

  const request: RunOptimizerRequest = {
    experiment: {
      data: calculateData(
        experiment.categoricalVariables,
        experiment.valueVariables,
        experiment.scoreVariables,
        experiment.dataPoints
      ),
      extras: {
        ...extras,
        experimentSuggestionCount:
          selectCalculatedSuggestionCountFromExperiment(experiment),
        ...(selectedPoint
          ? {
              selectedPoint:
                selectedPoint as unknown as ExperimentExtrasSelectedPointInner[],
            }
          : {}),
        ...(previousPickled ? { pickled: previousPickled } : {}),
      },
      optimizerConfig: {
        acqFunc: cfg.acqFunc,
        baseEstimator: cfg.baseEstimator,
        initialPoints: Number(cfg.initialPoints),
        kappa: Number(cfg.kappa),
        xi: Number(cfg.xi),
        space: space,
        constraints: calculateConstraints(experiment),
      },
    },
  }
  return request
}

export const fetchExperimentResult = async (
  experiment: ExperimentType,
  api: DefaultApi
) => {
  const request = createFetchExperimentResultRequest(experiment)
  const result = await api.runOptimizer(request)

  return experimentResultSchema.parse({
    id: experiment.id,
    plots:
      result.plots?.map(p => ({ id: p.id ?? '', plot: p.plot ?? '' })) ?? [],
    next: result.result?.next ?? [],
    pickled: result.result?.pickled ?? '',
    expectedMinimum: result.result?.expectedMinimum ?? [],
    extras: { ...(result.result?.extras ?? {}) },
  })
}
```

Two notes:

- The `extras: { ...(result.result?.extras ?? {}) }` spread is a safety normalization. `result.result.extras` is now typed as `ResultResultExtras` (`{ pickledUsed?: boolean }`) instead of an open object. The Zod schema for `experimentResultSchema.extras` is `z.record(z.string(), z.unknown())`, which structurally accepts the typed object — but the spread guarantees a plain object goes through `parse`. If TypeScript is happy without the spread, you may revert that line; both are fine at runtime.
- The cast `as unknown as ExperimentExtrasSelectedPointInner[]` is needed because OpenAPI generated `ExperimentExtrasSelectedPointInner` as `{}` (a polymorphic `anyOf`). The wire shape really is `(number | string)[]`.

### - [ ] Step 4: Run the new tests; verify they pass

```bash
npm test --workspace=@boostv/process-optimizer-frontend-core -- --run api.test.ts
```

Expected: all four tests in `api.test.ts` PASS.

### - [ ] Step 5: Run the rest of the core suite; observe the broken hash test

```bash
npm test --workspace=@boostv/process-optimizer-frontend-core -- --run
```

Expected: `reducers.test.ts > experiment reducer > updateExperiment > should update whole experiment` FAILS. Failure message will show:

```
Expected: '5b4247caaa4e9a5a0c519a9017ccc547'
Received: '<new hash>'
```

This is expected. The payload's `results.pickled: '123'` now flows into `extras.pickled`, which changes the hash.

### - [ ] Step 6: Update the broken hash literal

Open `packages/core/src/context/experiment/reducers.test.ts`, line 124. Replace the hardcoded `lastEvaluationHash` value with the `Received:` hash printed by the failing test in Step 5:

```ts
          lastEvaluationHash: '<paste new hash here>',
```

### - [ ] Step 7: Run the full core suite again; verify all pass

```bash
npm test --workspace=@boostv/process-optimizer-frontend-core -- --run
```

Expected: all tests PASS.

### - [ ] Step 8: Commit

```bash
git add packages/core/src/context/experiment/api.ts \
        packages/core/src/context/experiment/api.test.ts \
        packages/core/src/context/experiment/reducers.test.ts
git commit -m "Forward extras.selectedPoint and extras.pickled in request body"
```

---

## Task 4: `matchFrontIndex` helper for `Result.tsx`

**Files:**

- Create: `packages/ui/src/features/multi-objective/result.utils.ts`
- Create: `packages/ui/src/features/multi-objective/result.utils.test.ts`

Strict element-wise equality match. Numbers compared as numbers, strings as strings. Returns `-1` when no row matches; the caller falls back to `best_idx`.

### - [ ] Step 1: Write the failing tests

Create `packages/ui/src/features/multi-objective/result.utils.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { matchFrontIndex } from './result.utils'

describe('matchFrontIndex', () => {
  const front: Array<Array<number | string>> = [
    [100, 'Vanilla'],
    [120, 'Chocolate'],
    [150, 'Whipped cream'],
  ]

  it('returns the index of an exact match', () => {
    expect(matchFrontIndex(front, [120, 'Chocolate'])).toBe(1)
  })

  it('returns -1 when no row matches', () => {
    expect(matchFrontIndex(front, [999, 'Chocolate'])).toBe(-1)
  })

  it('returns -1 when lengths differ', () => {
    expect(matchFrontIndex(front, [120])).toBe(-1)
  })

  it('returns -1 when types differ at a position', () => {
    expect(matchFrontIndex(front, ['120', 'Chocolate'])).toBe(-1)
  })

  it('returns -1 for an empty front', () => {
    expect(matchFrontIndex([], [120, 'Chocolate'])).toBe(-1)
  })
})
```

### - [ ] Step 2: Run the test to verify it fails

```bash
npm test --workspace=@boostv/process-optimizer-frontend-ui -- --run result.utils.test.ts
```

Expected: FAIL — `Cannot find module './result.utils'`.

### - [ ] Step 3: Implement the helper

Create `packages/ui/src/features/multi-objective/result.utils.ts`:

```ts
export const matchFrontIndex = (
  front: Array<Array<number | string>>,
  target: Array<number | string>
): number => {
  for (let i = 0; i < front.length; i++) {
    const row = front[i]
    if (!row || row.length !== target.length) {
      continue
    }
    let allEqual = true
    for (let j = 0; j < row.length; j++) {
      const a = row[j]
      const b = target[j]
      if (typeof a !== typeof b || a !== b) {
        allEqual = false
        break
      }
    }
    if (allEqual) {
      return i
    }
  }
  return -1
}
```

### - [ ] Step 4: Run tests to verify they pass

```bash
npm test --workspace=@boostv/process-optimizer-frontend-ui -- --run result.utils.test.ts
```

Expected: all five tests PASS.

### - [ ] Step 5: Commit

```bash
git add packages/ui/src/features/multi-objective/result.utils.ts \
        packages/ui/src/features/multi-objective/result.utils.test.ts
git commit -m "Add matchFrontIndex helper for multi-objective result"
```

---

## Task 5: Wire `Result.tsx` to dispatch and derive

**Files:**

- Modify: `packages/ui/src/features/multi-objective/result.tsx`

Drop local React state for the selected index. Read it from `experiment.extras.selectedPoint`. Dispatch `setSelectedParetoPoint` on click and on reset.

### - [ ] Step 1: Update the imports

Open `packages/ui/src/features/multi-objective/result.tsx`. Two changes near the top of the file:

1. Add `matchFrontIndex` to the imports. Update the import block from `@boostv/process-optimizer-frontend-core` (around line 7) by adding `useExperiment` if not already present (it is — line 16), then add a new import for the local helper after the existing local imports:

```tsx
import { matchFrontIndex } from './result.utils'
```

2. Remove the `useState` import line entirely if it is the only React import. Today the file imports `import { useState } from 'react'`. Change it to:

```tsx
// (delete the `import { useState } from 'react'` line — useState is no longer used)
```

### - [ ] Step 2: Replace the selection state and click handler

Around lines 78–98, locate:

```tsx
  const {
    state: { experiment },
  } = useExperiment()
  ...
  const [selectedParetoPoint, setSelectedParetoPoint] = useState<number | null>(
    null
  )

  const onSetSelectedParetoPoint = (index: number) => {
    setSelectedParetoPoint(index)
    // TODO: multi - dispatch based onpareto point selection change
  }
```

Replace with:

```tsx
  const {
    state: { experiment },
    dispatch,
  } = useExperiment()
  ...
  const selectedCoords = experiment.extras.selectedPoint as
    | Array<number | string>
    | undefined

  const onSetSelectedParetoPoint = (index: number) => {
    const coords = pareto.front_x_data[index]
    if (!coords) return
    dispatch({ type: 'setSelectedParetoPoint', payload: coords })
  }
```

(Keep the surrounding lines — `dataPoints`, `variableHeaders`, etc. — intact.)

### - [ ] Step 3: Update the `ParetoFrontPlot` props

Around lines 225–246, locate the `<ParetoFrontPlot ... />` element. Change the `indexOfSelected` expression and the `onResetToDefault` handler. The block currently reads:

```tsx
<ParetoFrontPlot
  onSelectIndex={onSetSelectedParetoPoint}
  indexOfSelected={selectedParetoPoint ?? pareto.best_idx}
  plot={pareto}
  dataPoints={dataPoints}
  fitToFrontButton={
    <Button variant="outlined" size="small">
      Toggle front fit
    </Button>
  }
  resetToDefaultButton={
    <Button variant="outlined" size="small">
      Reset to default
    </Button>
  }
  onResetToDefault={() => onSetSelectedParetoPoint(pareto.best_idx)}
  styles={styles?.pareto}
/>
```

Replace with:

```tsx
<ParetoFrontPlot
  onSelectIndex={onSetSelectedParetoPoint}
  indexOfSelected={
    selectedCoords
      ? (() => {
          const idx = matchFrontIndex(pareto.front_x_data, selectedCoords)
          return idx >= 0 ? idx : pareto.best_idx
        })()
      : pareto.best_idx
  }
  plot={pareto}
  dataPoints={dataPoints}
  fitToFrontButton={
    <Button variant="outlined" size="small">
      Toggle front fit
    </Button>
  }
  resetToDefaultButton={
    <Button variant="outlined" size="small">
      Reset to default
    </Button>
  }
  onResetToDefault={() =>
    dispatch({ type: 'setSelectedParetoPoint', payload: null })
  }
  styles={styles?.pareto}
/>
```

### - [ ] Step 4: Typecheck the UI workspace

```bash
npm run build --workspace=@boostv/process-optimizer-frontend-ui
```

Expected: build succeeds with no TypeScript errors. (Acceptable: only the bundle output.)

### - [ ] Step 5: Run the UI test suite

```bash
npm test --workspace=@boostv/process-optimizer-frontend-ui -- --run
```

Expected: all UI tests PASS (including the new `result.utils.test.ts`).

### - [ ] Step 6: Commit

```bash
git add packages/ui/src/features/multi-objective/result.tsx
git commit -m "Persist Pareto selection through extras and dispatch on click"
```

---

## Task 6: End-to-end verification against the live backend

**Backend:** `http://127.0.0.1:9090/v1.0`, `apikey=none`.

This is a manual smoke test. The goal is to confirm the request body, the response handling, and the dirty-flag flow against the real server.

### - [ ] Step 1: Run the full monorepo build and test

```bash
npm run build
npm test
```

Expected: both green.

### - [ ] Step 2: Start the sample app

The sample app is at `/workspace/sample-app`. Find the dev command:

```bash
cat sample-app/package.json | grep '"dev"\|"start"\|"scripts"'
```

Run the appropriate command (likely `npm run dev --workspace=sample-app`). Confirm the dev server starts and the page loads in a browser. The sample app should be configured to point at `http://127.0.0.1:9090/v1.0` with `apikey=none`; if not, configure it before proceeding.

### - [ ] Step 3: Load a multi-objective sample and run

Load `packages/ui/src/testing/sample-data/cake-multi.json` (or equivalent multi-objective sample) via the UI's import functionality. Click "Run" / evaluate.

In the browser dev-tools Network tab, confirm:

- The outgoing request body contains no `extras.selectedPoint` (no selection yet).
- The outgoing request body contains no `extras.pickled` (no prior result yet).
- The response body contains `result.pickled: "<non-empty>"` and `result.extras.pickledUsed: false`.

In the UI, confirm the Pareto plot renders and the selected highlight sits on `best_idx`.

### - [ ] Step 4: Click a non-default Pareto point

Click a different point on the Pareto front (not `best_idx`).

Confirm:

- The highlight on the Pareto plot moves immediately.
- The dirty indicator activates (the Run button becomes "available" / experiment is marked as changed).
- In React DevTools (or by inspecting `localStorage`), `experiment.extras.selectedPoint` is the X-space coordinates of the clicked point.

### - [ ] Step 5: Trigger Run

Click Run.

In Network tab confirm the outgoing request body contains:

- `experiment.extras.selectedPoint: [<coords from clicked point>]`
- `experiment.extras.pickled: "<the pickled blob from the previous response>"`

In the response confirm:

- `result.extras.pickledUsed: true` (fast path used).
- `result.pickled` is non-empty (likely a new value).

In the UI confirm:

- The per-dimension single plots have refreshed and now highlight the clicked point's value on each dimension.
- The dirty indicator is cleared.

### - [ ] Step 6: Add a measurement and re-run

Add a new data point in the UI (the existing dataEntry tab). Confirm:

- `experiment.extras.selectedPoint` has been removed (check React DevTools or localStorage).

Click Run.

Confirm in Network tab:

- The outgoing request body has no `extras.selectedPoint` key.
- The outgoing request body still contains `extras.pickled` (from the previous result).

Confirm in response:

- `result.extras.pickledUsed: false` (fingerprint mismatch, fallback to full run).
- A new `result.pickled` is present.
- The Pareto plot renders the new front, with the highlight back on the new `best_idx`.

### - [ ] Step 7: Reset to default

Click "Reset to default" while a selection is active (re-click a non-best Pareto point first if needed). Confirm:

- The `experiment.extras.selectedPoint` key is removed.
- The plot highlight moves back to `best_idx`.
- The dirty indicator activates again (because the request body changed by removing the key).

### - [ ] Step 8: Commit any verification fixes

If issues surfaced and required code adjustments, commit them with descriptive messages. If no fixes were needed, no commit is required for this task.

---

## Done

After all tasks pass and E2E verification is green, the feature is complete. The implementation agent should not invoke `evaluate()` from the new action — re-evaluation is the user's responsibility via the existing dirty-flag UI.
