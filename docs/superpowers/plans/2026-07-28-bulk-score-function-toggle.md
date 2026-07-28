# Bulk Enable/Disable Score Function Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-objective "For existing data points" control in the Score functions panel — a segmented toggle (Leave unchanged / Use for all / Turn off for all) whose choice is applied **on Save**, turning the score function on or off for all existing data points, with an inline warning when enabling would invalidate points that lack responses.

**Architecture:** A new bulk reducer action (`setDataPointsUseFunction`) mirrors the existing all-rows `updateScoreFunction` pattern — it flips `responses[scoreName].useFunction` on every data point and re-runs `recomputeScore`. Validation (already wired) then marks function-mode rows that lack required responses invalid. A new exported core helper counts those rows so the UI can show an inline warning. The UI adds a per-tab segmented `ToggleButtonGroup` whose selection is consumed by the existing Save handler (`onSaveClick`): Save persists the function (as today) and then, per objective, applies the chosen bulk toggle. Doing the bulk apply inside Save is what removes the earlier "save closes the panel before you can enable" friction.

**Tech Stack:** TypeScript (strict), Zod, immer, React 19, MUI, Vitest.

## Global Constraints

- **Branch:** `add-quality-function`. It currently has **uncommitted star/naming changes** (Settings→Score functions rename + star icon) — commit those first so this work starts from a clean tree. After this feature lands, `add-notes` must be rebased onto `add-quality-function` to keep the stack in sync.
- **`useFunction` is per-row, per-objective** (`dataEntry.responses[].useFunction`, keyed by `scoreName`). There is no global flag; "for all data points" means iterating every data point.
- **Enable semantics:** on enable, rows with complete responses get their score recomputed (`recomputeScore` no-ops otherwise); rows missing required responses become `meta.valid = false` via the existing `validateDataPointsResponsesUndefined` and are excluded from the optimizer.
- **Disable semantics:** flip `useFunction` to false on rows that already have a responses entry; do **not** create entries for pure-manual rows (nothing to disable). The current score value is retained as the (now-editable) manual value.
- **Applied on Save, not immediately.** The control is a per-objective segmented `ToggleButtonGroup` with three options — **Leave unchanged** (default), **Use for all**, **Turn off for all**. The choice is applied when the user clicks the panel's existing **Save**. "Leave unchanged" = today's behaviour (save the function, don't touch per-row usage). Selection resets when the panel is reopened.
- **Inline warning (no modal).** When the active objective's choice is **Use for all** and the missing-response count > 0, show an `InfoBox` (`type="warning"`, the element already used in this panel) with the exact text: `{missing} of {total} points are missing responses and will be marked invalid. Adding responses after saving will make them valid again.`
- **Operates on the current draft function.** Because apply happens in the Save flow (which persists the draft first), the warning count is computed against the active tab's **draft** score function; the toggle's non-default options are disabled when that draft has no usable expression (empty or `expressionError`).
- **Out of scope:** changing the default for newly-added points (that default is derived, not persisted).
- Formatting via prettier/eslint pre-commit hook — don't hand-format. Targeted test: `npx vitest run <path>`; full: `npm test -- run`. Commit per task with the repo's `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` trailer.

---

### Task 1: Core — `setDataPointsUseFunction` bulk reducer action

**Files:**

- Modify: `packages/core/src/context/experiment/experiment-reducers.ts` (action union ~line 188-196; new `case` near `updateDataPointResponses` ~line 579-610)
- Modify: `packages/core/src/context/experiment/reducers.ts` (add the action to the validation fall-through list, ~line 42)
- Test: `packages/core/src/context/experiment/experiment-reducers.test.ts`

**Interfaces:**

- Produces: action `{ type: 'setDataPointsUseFunction', payload: { scoreName: ScoreName; useFunction: boolean } }`. Enabling upserts `responses[scoreName]` on every data point and recomputes; disabling flips only existing entries.

- [ ] **Step 1: Write the failing test**

Add to `experiment-reducers.test.ts` (match the file's existing `rootReducer(state, action)` + `emptyExperiment`/`State` convention used by the "variable name trimming" tests):

```typescript
describe('setDataPointsUseFunction', () => {
  const baseExperiment = {
    ...emptyExperiment,
    valueVariables: [
      {
        type: 'continuous' as const,
        name: 'F',
        description: '',
        min: 0,
        max: 10,
        enabled: true,
      },
    ],
    scoreVariables: [
      {
        name: 'quality' as const,
        label: 'Quality (0-5)',
        description: '',
        enabled: true,
        scoreFunction: {
          expression: 'w * 2',
          variables: [{ name: 'W', symbol: 'w', source: 'response' as const }],
        },
      },
    ],
    dataPoints: [
      {
        meta: { id: 1, enabled: true, valid: true },
        data: [
          { type: 'numeric' as const, name: 'F', value: 3 },
          { type: 'score' as const, name: 'quality', value: 0 },
        ],
        responses: [
          {
            scoreName: 'quality' as const,
            useFunction: false,
            values: [{ symbol: 'w', value: 4 }],
          },
        ],
      },
      {
        meta: { id: 2, enabled: true, valid: true },
        data: [
          { type: 'numeric' as const, name: 'F', value: 5 },
          { type: 'score' as const, name: 'quality', value: 1.5 },
        ],
        // no responses entry -> missing the required 'w' response
      },
    ],
  }

  it('enables the function for all data points and recomputes where responses exist', () => {
    const state = rootReducer({ experiment: baseExperiment } as State, {
      type: 'setDataPointsUseFunction',
      payload: { scoreName: 'quality', useFunction: true },
    })
    const dps = state.experiment.dataPoints
    // row 1: complete responses -> useFunction on, score recomputed to w*2 = 8
    expect(dps[0]?.responses?.[0]).toMatchObject({
      scoreName: 'quality',
      useFunction: true,
    })
    expect(
      dps[0]?.data.find(d => d.type === 'score' && d.name === 'quality')?.value
    ).toBe(8)
    expect(dps[0]?.meta.valid).toBe(true)
    // row 2: enabled but missing responses -> created entry, marked invalid
    expect(
      dps[1]?.responses?.find(r => r.scoreName === 'quality')?.useFunction
    ).toBe(true)
    expect(dps[1]?.meta.valid).toBe(false)
  })

  it('disables the function only on rows that already have a responses entry', () => {
    const enabled = rootReducer({ experiment: baseExperiment } as State, {
      type: 'setDataPointsUseFunction',
      payload: { scoreName: 'quality', useFunction: true },
    })
    const disabled = rootReducer(enabled, {
      type: 'setDataPointsUseFunction',
      payload: { scoreName: 'quality', useFunction: false },
    })
    disabled.experiment.dataPoints.forEach(dp => {
      const resp = dp.responses?.find(r => r.scoreName === 'quality')
      if (resp) expect(resp.useFunction).toBe(false)
    })
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd packages/core && npx vitest run src/context/experiment/experiment-reducers.test.ts -t "setDataPointsUseFunction"`
Expected: FAIL — action type unknown (and a TS error at `assertUnreachable` until the case is added).

- [ ] **Step 3: Add the action type to the union**

In `experiment-reducers.ts`, after the `updateDataPointResponses` union member (~line 196), add:

```typescript
  | {
      type: 'setDataPointsUseFunction'
      payload: {
        scoreName: ScoreName
        useFunction: boolean
      }
    }
```

- [ ] **Step 4: Add the reducer case**

In `experiment-reducers.ts`, after the `updateDataPointResponses` case (~line 610), add — mirroring `updateScoreFunction`'s all-rows loop + `recomputeScore`:

```typescript
      case 'setDataPointsUseFunction': {
        const sv = state.scoreVariables.find(
          it => it.name === action.payload.scoreName
        )
        if (sv?.scoreFunction !== undefined) {
          const orderedNames = dataEntryOrder(state)
          state.dataPoints.forEach(dp => {
            const existing = dp.responses?.find(
              r => r.scoreName === action.payload.scoreName
            )
            if (existing !== undefined) {
              existing.useFunction = action.payload.useFunction
            } else if (action.payload.useFunction) {
              // Only create an entry when turning the function ON; a row with no
              // responses entry is already manual, so disabling is a no-op for it.
              if (dp.responses === undefined) dp.responses = []
              dp.responses.push({
                scoreName: action.payload.scoreName,
                useFunction: true,
                values: [],
              })
            }
            recomputeScore(
              dp,
              action.payload.scoreName,
              sv.scoreFunction,
              orderedNames
            )
          })
        }
        break
      }
```

- [ ] **Step 5: Route the action through validation**

In `reducers.ts`, add the new action to the fall-through list right after `case 'updateDataPointResponses':` (~line 42):

```typescript
    case 'updateDataPointResponses':
    case 'setDataPointsUseFunction': {
```

(This block re-runs `validateExperiment` + `validationReducer`, which is what marks the missing-response rows invalid.)

- [ ] **Step 6: Run to verify pass**

Run: `cd packages/core && npx vitest run src/context/experiment/experiment-reducers.test.ts`
Expected: PASS. Then `npm test -- run` to confirm no sibling reducer test regressed.

- [ ] **Step 7: Commit**

```bash
cd packages/core
git add src/context/experiment/experiment-reducers.ts src/context/experiment/reducers.ts src/context/experiment/experiment-reducers.test.ts
git commit -m "feat(core): add setDataPointsUseFunction bulk action for score functions"
```

---

### Task 2: Core — `countDataPointsMissingResponses` helper (for the inline warning)

**Files:**

- Modify: `packages/core/src/context/experiment/validation.ts` (extract a `responsesComplete` predicate; add + export `countDataPointsMissingResponses`; refactor `validateDataPointsResponsesUndefined` to reuse the predicate)
- Test: `packages/core/src/context/experiment/validation.test.ts` (create if absent, else extend)

**Interfaces:**

- Consumes: `DataEntry`, `ScoreFunctionType` from core types.
- Produces: `countDataPointsMissingResponses(dataPoints: DataEntry[], scoreName: string, scoreFunction: ScoreFunctionType | undefined): number` — how many data points would be invalid if `scoreFunction` were used for `scoreName` (0 if no function or no response vars). Takes a `scoreFunction` (not a `scoreVariable`) so the UI can pass the current **draft** function. Exported from the core barrel (same path `validateExperiment` is exported from).

- [ ] **Step 1: Write the failing test**

Add (mirror the existing validation test conventions; import from `./validation`):

```typescript
import { countDataPointsMissingResponses } from './validation'

describe('countDataPointsMissingResponses', () => {
  const fn = {
    expression: 'w * 2',
    variables: [{ name: 'W', symbol: 'w', source: 'response' as const }],
  }
  const complete = {
    meta: { id: 1, enabled: true, valid: true },
    data: [{ type: 'score' as const, name: 'quality', value: 0 }],
    responses: [
      {
        scoreName: 'quality' as const,
        useFunction: false,
        values: [{ symbol: 'w', value: 2 }],
      },
    ],
  }
  const missing = {
    meta: { id: 2, enabled: true, valid: true },
    data: [{ type: 'score' as const, name: 'quality', value: 0 }],
  }

  it('counts data points lacking the function’s required responses (ignoring current useFunction)', () => {
    expect(
      countDataPointsMissingResponses([complete, missing], 'quality', fn)
    ).toBe(1)
  })

  it('returns 0 when there is no score function', () => {
    expect(
      countDataPointsMissingResponses([missing], 'quality', undefined)
    ).toBe(0)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd packages/core && npx vitest run src/context/experiment/validation.test.ts -t "countDataPointsMissingResponses"`
Expected: FAIL — `countDataPointsMissingResponses` is not exported.

- [ ] **Step 3: Extract the predicate and add the helper**

In `validation.ts`, add above `validateDataPointsResponsesUndefined`:

```typescript
// Are all of the function's response-source symbols present & finite in `values`?
const responsesComplete = (
  scoreFunction: ScoreFunctionType,
  values: { symbol: string; value: number }[]
): boolean => {
  const provided = new Map(values.map(v => [v.symbol, v.value]))
  return scoreFunction.variables
    .filter(v => v.source === 'response')
    .every(v => {
      const val = provided.get(v.symbol)
      return val !== undefined && Number.isFinite(val)
    })
}

// How many data points would be invalid if `scoreFunction` were used for
// `scoreName` (i.e. are missing its required responses), regardless of current
// useFunction. Pass the draft function so the warning reflects what Save applies.
export const countDataPointsMissingResponses = (
  dataPoints: DataEntry[],
  scoreName: string,
  scoreFunction: ScoreFunctionType | undefined
): number => {
  if (scoreFunction === undefined) return 0
  return dataPoints.filter(dp => {
    const resp = dp.responses?.find(r => r.scoreName === scoreName)
    return !responsesComplete(scoreFunction, resp?.values ?? [])
  }).length
}
```

Then refactor the body of `validateDataPointsResponsesUndefined` to reuse `responsesComplete` (behavior unchanged):

```typescript
experiment.dataPoints.forEach(dp => {
  dp.responses?.forEach(resp => {
    const fn = functionsByScore.get(resp.scoreName)
    if (fn === undefined || !resp.useFunction) return
    if (!responsesComplete(fn, resp.values)) {
      violations.push({ id: dp.meta.id, scoreName: resp.scoreName })
    }
  })
})
```

Ensure `ScoreFunctionType` is imported in `validation.ts` (add to the existing core-types import if missing). Confirm `countDataPointsMissingResponses` is reachable from the package barrel (validation is already re-exported — verify `validateExperiment`'s export path also carries the new symbol; add an explicit re-export if the barrel lists names individually).

- [ ] **Step 4: Run to verify pass**

Run: `cd packages/core && npx vitest run src/context/experiment/validation.test.ts` then `npm test -- run`
Expected: PASS (new tests + unchanged `validateDataPointsResponsesUndefined` behavior).

- [ ] **Step 5: Commit**

```bash
cd packages/core
git add src/context/experiment/validation.ts src/context/experiment/validation.test.ts
git commit -m "feat(core): export countDataPointsMissingResponses for bulk score-function UI"
```

---

### Task 3: UI — "For existing data points" segmented control (applied on Save)

**Files:**

- Modify: `packages/ui/src/features/data-points/settings/data-points-settings.tsx`
- Test: `packages/ui/src/features/data-points/settings/data-points-settings.test.tsx` (create if absent, else extend)

**Interfaces:**

- Consumes: `setDataPointsUseFunction` action (Task 1) and `countDataPointsMissingResponses` (Task 2). The panel already has `experiment` + `dispatch` (`useExperiment`, ~line 44-47), `activeScore` (~line 54), per-objective `drafts` keyed by score name (~line 57-91), `onSaveClick` (~line 144-156), and imports `InfoBox` (from `../../core/info-box/info-box`, used for the "map to 0-5" note) plus MUI `Box`/`Button`.
- Produces: a per-tab `ToggleButtonGroup` (values `'unchanged'` | `'enable'` | `'disable'`, default `'unchanged'`) whose choice is applied inside `onSaveClick`.

- [ ] **Step 1: Write the failing tests**

Create `data-points-settings.test.tsx`. Render `DataPointsSettings` inside whatever experiment-context test wrapper the ui package uses — **first check a sibling test** (e.g. an existing `features/data-points` component test) for how `useExperiment` is provided, and reuse that provider/helper; if none exists, mirror the nearest component test's setup. Assert behaviorally (query by role/text):

```typescript
// Given an experiment whose active objective has a saved function and some data
// points missing responses:
// 1. the "For existing data points" ToggleButtonGroup renders with
//    "Leave unchanged" | "Use for all" | "Turn off for all"; default selected = Leave unchanged.
// 2. selecting "Use for all" shows the InfoBox warning text containing
//    "of" and "missing responses" and "Adding responses after saving".
// 3. with "Use for all" selected, clicking Save dispatches BOTH updateScoreFunction
//    (as today) AND setDataPointsUseFunction { scoreName: active, useFunction: true }.
// 4. with "Leave unchanged" (default), Save dispatches NO setDataPointsUseFunction.
// 5. "Use for all"/"Turn off for all" are disabled when the active draft has no usable expression.
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd packages/ui && npx vitest run src/features/data-points/settings/data-points-settings.test.tsx`
Expected: FAIL — no "For existing data points" control yet.

- [ ] **Step 3: Add the per-objective intent state + segmented control + warning**

In `data-points-settings.tsx`, import `countDataPointsMissingResponses` from core and `ToggleButtonGroup`, `ToggleButton` from `@mui/material` (add to the existing MUI import). Add state near the other hooks (after `activeScore`):

```typescript
type BulkIntent = 'unchanged' | 'enable' | 'disable'
const [bulkIntents, setBulkIntents] = useState<Record<string, BulkIntent>>({})
const activeIntent: BulkIntent =
  (activeScore && bulkIntents[activeScore.name]) ?? 'unchanged'
// Warning reflects the DRAFT function (what Save will persist + apply).
const missingCount = useMemo(
  () =>
    activeScore !== undefined
      ? countDataPointsMissingResponses(
          experiment.dataPoints,
          activeScore.name,
          drafts[activeScore.name]
        )
      : 0,
  [experiment.dataPoints, activeScore, drafts]
)
// A usable function draft is required to enable/disable.
const canBulkApply =
  activeScore !== undefined &&
  !expressionError &&
  (drafts[activeScore.name]?.expression.trim() ?? '') !== ''
```

> Implementer: match the real names in this file — the per-objective draft accessor (the map may be `drafts[name]` or similar) and the `expressionError` variable (used by the Save button's `disabled`). Adjust the two lines above to the actual identifiers.

Add the section immediately after the `playgroundContainer` Box (after the `</Box>` that closes "Test your function", still inside `tabContainers`):

```tsx
<Box className={classes.playgroundContainer}>
  <Box className={classes.title}>For existing data points</Box>
  <ToggleButtonGroup
    exclusive
    size="small"
    value={activeIntent}
    onChange={(_e, value: BulkIntent | null) => {
      if (value !== null && activeScore !== undefined) {
        setBulkIntents(prev => ({ ...prev, [activeScore.name]: value }))
      }
    }}
    aria-label="apply score function to existing data points"
  >
    <ToggleButton value="unchanged">Leave unchanged</ToggleButton>
    <ToggleButton value="enable" disabled={!canBulkApply}>
      Use for all
    </ToggleButton>
    <ToggleButton value="disable" disabled={!canBulkApply}>
      Turn off for all
    </ToggleButton>
  </ToggleButtonGroup>
  {activeIntent === 'enable' && missingCount > 0 && (
    <InfoBox
      type="warning"
      margin="8px 0 0 0"
      text={`${missingCount} of ${experiment.dataPoints.length} points are missing responses and will be marked invalid. Adding responses after saving will make them valid again.`}
    />
  )}
</Box>
```

- [ ] **Step 4: Apply the intent inside Save**

In `onSaveClick` (~line 144-156), after the loop that dispatches `updateScoreFunction` per objective (which persists the drafts) and **before** `onSave()`, apply each objective's chosen bulk intent:

```typescript
enabledScores.forEach(sv => {
  const intent = bulkIntents[sv.name]
  if (intent === 'enable' || intent === 'disable') {
    dispatch({
      type: 'setDataPointsUseFunction',
      payload: { scoreName: sv.name, useFunction: intent === 'enable' },
    })
  }
})
```

(Persisting the function first means `setDataPointsUseFunction` recomputes against the just-saved function. The panel then closes via `onSave()`; intents reset on next open since the component remounts.)

- [ ] **Step 5: Run to verify pass**

Run: `cd packages/ui && npx vitest run src/features/data-points/settings/data-points-settings.test.tsx` then `npm test -- run`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd packages/ui
git add src/features/data-points/settings/data-points-settings.tsx src/features/data-points/settings/data-points-settings.test.tsx
git commit -m "feat(ui): bulk enable/disable score function for existing data points on save"
```

---

### Task 4: Full verification

- [ ] **Step 1: Build + test both packages**

```bash
cd packages/core && npm test -- run && npm run build
cd ../ui && npm test -- run && npm run build
```

Expected: all green.

- [ ] **Step 2: Manual/browser check (via `dev:local`)**

In the Score functions panel, under **"For existing data points"**: with responses missing on some points, pick **Use for all** → the inline warning shows the correct `{missing} of {total}` count → click **Save** → those points become invalid (warning in the table) and complete ones get computed scores. Pick **Turn off for all** + Save → all rows revert to manual. **Leave unchanged** + Save → per-row usage untouched (today's behaviour). The Use/Turn-off options are disabled while the active objective's function expression is empty or invalid.

---

## Notes for the implementer

- Don't hand-format; the pre-commit hook runs prettier/eslint.
- Commit the pending star/naming changes on `add-quality-function` **before** starting Task 1 so the tree is clean.
- After Task 4, `add-notes` needs rebasing onto `add-quality-function` (its data-points files overlap; expect a small conflict in `data-points.tsx`/settings to resolve).
- The bulk apply happens **inside Save** against the current draft function, so there's no "save closes the panel before you can enable" friction. "Leave unchanged" is the default, so Save behaves exactly as today unless the user opts in.
- Intent is tracked **per objective** (`bulkIntents[scoreName]`) and applied for every objective on Save, so a choice made on one tab isn't lost when switching tabs.
