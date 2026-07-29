# Score-Function UX Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Three UX fixes on the score-functions feature: (1) disable the Data-points "Score functions" star button when opening it would show nothing; (2) hide the "For existing data points" section when there are no data points; (3) make points added via the transfer buttons (copy-suggested bulk + per-row, and Pareto "add selected") default to using the score function, like a table-added row does.

**Architecture:** (1)+(2) are pure UI guards. (3) has two paths: `copySuggestedToDataPoints` (reducer) defaults new entries to `useFunction:true` + `recomputeScore` (reusing the `setDataPointsUseFunction` logic already in that file); the Pareto transfer (`result.tsx`, which dispatches `updateDataPoints`) mirrors the table-add flow by additionally dispatching `updateDataPointResponses` per function-objective after adding the point.

**Tech Stack:** TypeScript (strict), Zod, immer, mathjs, React 19, MUI, Vitest.

## Global Constraints

- **Branch:** `add-quality-function` (current HEAD `f2365aa`). After this lands, `add-notes` gets rebased onto it.
- **Consistency target for (3):** a newly-added table row defaults `useFunction=true` for each objective that has a `scoreFunction` (via `buildEmptyRow` → `dispatchResponses`). Transferred points must match: default `useFunction:true` + recompute for each objective **that has a function**; objectives without a function are untouched. A factor-only function computes immediately; a function needing responses lands in function-mode (invalid until responses entered) — exactly like a table-added row.
- Both transfer surfaces already route through validation (`copySuggestedToDataPoints`, `updateDataPoints`, `updateDataPointResponses` are all in the `reducers.ts` fall-through), so `meta.valid` settles correctly after the change.
- Formatting via prettier/eslint pre-commit hook — don't hand-format. Targeted test `npx vitest run <path>`; full `npm test -- run`. Commit per task with the repo's `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` trailer.

---

### Task 1: UI guards — disable star when empty; hide "For existing data points" with no data points

**Files:**

- Modify: `packages/ui/src/features/data-points/data-points.tsx` (star `IconButton`, ~lines 165-177)
- Modify: `packages/ui/src/features/data-points/settings/data-points-settings.tsx` (the `bulkContainer` section, ~lines 430-462)
- Test: `packages/ui/src/features/data-points/settings/data-points-settings.test.tsx` (the hide case, if the harness allows)

**Interfaces:**

- Produces: the star button is `disabled` exactly when `<DataPointsSettings>` wouldn't render; the "For existing data points" section renders only when `experiment.dataPoints.length > 0`.

- [ ] **Step 1: Disable the star button**

In `data-points.tsx`, add a `disabled` prop to the star `IconButton` matching the settings-render condition:

```tsx
                <IconButton
                  size="small"
                  className={classes.iconLight}
                  disabled={
                    enabledValueVariables.length +
                      enabledCategoricalVariables.length ===
                      0 || isLoadingState
                  }
                  onClick={() => setSettingsOpen(!isSettingsOpen)}
                >
```

(These variables are already in scope: `enabledValueVariables` line 61, `enabledCategoricalVariables` 62-64, `isLoadingState` 72.)

- [ ] **Step 2: Hide the bulk section when there are no data points**

In `data-points-settings.tsx`, wrap the whole `<Box className={classes.bulkContainer}>…</Box>` in a guard:

```tsx
{
  experiment.dataPoints.length > 0 && (
    <Box className={classes.bulkContainer}>
      {/* …unchanged section contents… */}
    </Box>
  )
}
```

- [ ] **Step 3: Test the hide case (if feasible)**

The settings test (`data-points-settings.test.tsx`) mocks `useExperiment` with a fixed experiment that has data points, so the existing "renders the For existing data points toggle" test already covers the shown case. For the hidden case, add a focused test with an experiment whose `dataPoints: []` — if the module-level `vi.mock` makes a second scenario awkward, either (a) add a separate small test file with its own mock, or (b) skip the automated hide-test and note it's covered by the manual/browser step. Do NOT weaken the existing tests. The star-disabled guard has no existing `DataPoints` test harness; verify it via the build + the manual step rather than scaffolding one.

- [ ] **Step 4: Run tests**

Run: `cd packages/ui && npx vitest run src/features/data-points/settings/data-points-settings.test.tsx` then `npm test -- run`
Expected: PASS (existing 12 + any added).

- [ ] **Step 5: Commit**

```bash
cd packages/ui
git add src/features/data-points/data-points.tsx src/features/data-points/settings/data-points-settings.tsx src/features/data-points/settings/data-points-settings.test.tsx
git commit -m "feat(ui): disable score-functions button when empty; hide bulk section with no data points"
```

---

### Task 2: Copy-suggested points default to the score function

**Files:**

- Modify: `packages/core/src/context/experiment/experiment-reducers.ts` (`copySuggestedToDataPoints`, ~lines 283-328)
- Test: `packages/core/src/context/experiment/experiment-reducers.test.ts`

**Interfaces:**

- Produces: each entry created by `copySuggestedToDataPoints` gets, for every `scoreVariable` with a `scoreFunction`, a `responses` entry `{ scoreName, useFunction: true, values: [] }` and a `recomputeScore` pass. Objectives without a function are untouched.

- [ ] **Step 1: Write the failing test**

Add to `experiment-reducers.test.ts` (use the file's `rootReducer(state, action)` + `emptyExperiment`/`State` convention). Construct a state with one factor, a quality `scoreFunction` that is **factor-only** (so it computes without responses), and one suggested value in `results.next`; dispatch `copySuggestedToDataPoints` with that index; assert the new data point has a `responses` entry `{ scoreName:'quality', useFunction:true }` and a computed `quality` score matching the function.

```typescript
// Sketch — adapt selectors/shape to how other copySuggested tests in this file
// build `results.next` and active variables:
// - valueVariables: [{ discrete 'F', 0..10, enabled }]
// - scoreVariables: [{ 'quality', scoreFunction: { expression: 'f * 2',
//     variables: [{ name:'F', symbol:'f', source:'factor', factorName:'F' }] } }]
// - results.next: [[3]]   (one suggestion: F=3)
// dispatch copySuggestedToDataPoints { indices:[0], removeFromSuggestions:false }
// expect the new point's responses -> [{ scoreName:'quality', useFunction:true }]
// expect its quality score === 6 (f*2 with f=3)
```

If mirroring an existing `copySuggestedToDataPoints` test in the file is simpler for constructing `results.next`/suggestions, do that.

- [ ] **Step 2: Run to verify it fails**

Run: `cd packages/core && npx vitest run src/context/experiment/experiment-reducers.test.ts -t "copySuggested"` (or the new test's name)
Expected: FAIL — new points have no `responses` and no computed score.

- [ ] **Step 3: Default new entries to the function**

In `copySuggestedToDataPoints`, after `newEntries` is built (~line 320) and **before** `state.dataPoints.push(...)` (~line 321), add — mirroring `setDataPointsUseFunction`:

```typescript
const orderedNames = dataEntryOrder(state)
newEntries.forEach(entry => {
  state.scoreVariables.forEach(sv => {
    if (sv.scoreFunction !== undefined) {
      if (entry.responses === undefined) entry.responses = []
      entry.responses.push({
        scoreName: sv.name,
        useFunction: true,
        values: [],
      })
      recomputeScore(entry, sv.name, sv.scoreFunction, orderedNames)
    }
  })
})
```

(`recomputeScore` and `dataEntryOrder` are defined earlier in the same file.)

- [ ] **Step 4: Run to verify pass**

Run: `cd packages/core && npx vitest run src/context/experiment/experiment-reducers.test.ts` then `npm test -- run`
Expected: PASS. Confirm existing `copySuggestedToDataPoints` tests still pass (a factor-only function now computes; note any that asserted `valid:false`/absent score and update only if the new behavior is correct).

- [ ] **Step 5: Commit**

```bash
cd packages/core
git add src/context/experiment/experiment-reducers.ts src/context/experiment/experiment-reducers.test.ts
git commit -m "feat(core): copied suggestions default to using the score function"
```

---

### Task 3: Pareto "add selected point" defaults to the score function

**Files:**

- Modify: `packages/ui/src/features/multi-objective/result.tsx` (`onAddSelectedAsDataPoint`, ~lines 125-164)
- Test: `packages/ui/src/features/multi-objective/result.test.tsx` (if it exists; else follow the nearest existing result test's harness)

**Interfaces:**

- Consumes: `experiment.scoreVariables` (already in scope via `useExperiment`).
- Produces: after adding the Pareto point via `updateDataPoints`, `onAddSelectedAsDataPoint` dispatches `updateDataPointResponses { metaId: nextId, scoreName, useFunction: true, values: [] }` for each objective with a `scoreFunction` — mirroring the table-add `dispatchResponses` flow, so the reducer recomputes.

- [ ] **Step 1: Write the failing test**

If a `result.test.tsx` (or sibling) exists with a mock `useExperiment`/dispatch, extend it: select a Pareto point, click "add selected as data point", and assert dispatch is called with `updateDataPoints` AND (for an objective with a function) `updateDataPointResponses { useFunction: true }`. If there's no harness for this component, write the minimal one mirroring the nearest existing multi-objective test; if that's disproportionate, implement + verify via the browser step and say so in the report (don't fabricate a harness).

- [ ] **Step 2: Run to verify it fails (or note no harness)**

- [ ] **Step 3: Thread the responses dispatch**

In `result.tsx` `onAddSelectedAsDataPoint`, after the existing `dispatch({ type: 'updateDataPoints', payload: [...dataPoints, newRow] })`:

```typescript
experiment.scoreVariables.forEach(sv => {
  if (sv.scoreFunction !== undefined) {
    dispatch({
      type: 'updateDataPointResponses',
      payload: {
        metaId: nextId,
        scoreName: sv.name,
        useFunction: true,
        values: [],
      },
    })
  }
})
```

(`experiment` and `dispatch` are from `useExperiment()`; `nextId` is computed just above.)

- [ ] **Step 4: Run tests**

Run: `cd packages/ui && npm test -- run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd packages/ui
git add src/features/multi-objective/result.tsx
# + the test file if added
git commit -m "feat(ui): Pareto 'add selected point' defaults to using the score function"
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

- Empty experiment (no variables): the ★ Score-functions button is disabled.
- A project with variables but zero data points: open Score functions → the "For existing data points" section is hidden.
- Transfer suggestions via **Start experimenting** / **Transfer all** and the per-row **Transfer to data points** icon → the new points default to function mode (factor-only functions show a computed score; response functions show the function-mode/invalid state), matching a table-added row.
- Multi-objective: **add a selected Pareto point** → same function-default behavior.

---

## Notes for the implementer

- Don't hand-format; the pre-commit hook runs prettier/eslint.
- The `dataPoints` used by the Pareto transfer is `selectActiveDataPoints`; the `updateDataPoints` payload composition and `nextId` derivation are pre-existing — do NOT refactor them, only add the responses dispatch.
- After Task 4, `add-notes` needs rebasing onto `add-quality-function`.
