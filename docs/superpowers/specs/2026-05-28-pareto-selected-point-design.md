# Pareto-point selection & pickled cache wiring

**Date:** 2026-05-28
**Branch:** `pareto-plot`
**Scope:** Front-end adjustments to use the updated OpenAPI behavior so that clicking a point on the Pareto front sends `extras.selectedPoint` and `extras.pickled` to the backend on the next evaluation.

## Background

The OpenAPI spec was regenerated against the `langdal/ai-restructure` branch of `process-optimizer-api`. The new request body exposes two additional fields on `experiment.extras`:

- `selectedPoint: Array<...>` — explicit X-space coordinates the server should highlight in the per-dimension single plots. Honored only when `graphFormat: "json"`; ignored on the PNG path.
- `pickled: string` — opaque cache hint produced by the previous response. The server validates a fingerprint of `(data, optimizerConfig)`; on mismatch it is silently dropped and a full run is performed.

The response body now also exposes `result.extras.pickledUsed: boolean` indicating whether the cache fast path executed.

The user-facing goal: when a user clicks a point on the Pareto plot, the selection is stored on the experiment so that the next evaluation (triggered through the existing dirty-flag flow) sends `selectedPoint` and `pickled` to the backend. The server returns refreshed single-objective plots with the new highlight, and — when the cache validates — skips GP retraining.

## Non-goals

- Automatic re-evaluation on click. Evaluation is triggered by the existing "Run" affordance based on the `changedSinceLastEvaluation` flag.
- Surfacing `pickledUsed` in the UI. It may be retained in state for debug purposes only.
- A typed top-level schema field for `selectedPoint`. It lives in the existing `experiment.extras` record.
- Handling the "selectedPoint ignored on png path" warning. Multi-objective sample experiments already set `graphFormat: "json"`.
- Single-objective mode changes. `ParetoFrontPlot` only mounts in multi-objective mode.

## 1. State shape

`experiment.extras` is already typed as `z.record(z.string(), z.unknown())`. No schema migration is needed; one well-known key is added by convention:

```
experiment.extras.selectedPoint?: Array<number | string>
```

It is the X-space coordinate row pulled from `pareto.front_x_data[i]` at click time. Numeric dimensions are numbers; categorical dimensions are strings. The order matches `optimizerConfig.space`. Absence (`undefined` / key removed) means "no selection — use the server default (`best_idx`)".

Rationale:

- The server contract is X-space coordinates, not an index. Indices do not survive front shifts between runs.
- `pareto.front_x_data[i]` already produces the correct shape — no translation needed.

`currentVersion` stays at `'18'`. Saved experiments without `selectedPoint` behave as "no selection". Saved experiments with a stale `extras.selectedPoint` that does not match the current front fall through to `best_idx` (see Section 3).

## 2. Reducer wiring

### New action

In `packages/core/src/context/experiment/experiment-reducers.ts`:

```ts
| {
    type: 'setSelectedParetoPoint'
    payload: Array<number | string> | null   // null clears
  }
```

Handler:

- `null` → `delete state.extras.selectedPoint` (key absence, not `null`, keeps the request body byte-identical to the no-selection baseline).
- Array → `state.extras.selectedPoint = payload`.

The action does **not** call `evaluate`. The hash change from `extras.selectedPoint` going from absent → present causes `calculateChangeReducer` to set `changedSinceLastEvaluation = true` on the next pass, which lights up the existing "Run" affordance.

### Clear-on-dirty

Any structural change to the experiment clears `extras.selectedPoint`. Add a helper at the top of `experiment-reducers.ts`:

```ts
const clearParetoSelection = (state: ExperimentType) => {
  if (state.extras && 'selectedPoint' in state.extras) {
    delete state.extras.selectedPoint
  }
}
```

Then call `clearParetoSelection(state)` at the start of these existing cases:

| Action                                                                           | Reason                                               |
| -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `updateDataPoints`                                                               | New measurements shift the front                     |
| `updateConfiguration`                                                            | Optimizer config changes the fit                     |
| `addCategorialVariable` / `editCategoricalVariable` / `deleteCategorialVariable` | Space changes, coord-length mismatch                 |
| `setCategoricalVariableEnabled`                                                  | Same                                                 |
| `addValueVariable` / `editValueVariable` / `deleteValueVariable`                 | Same                                                 |
| `setValueVariableEnabled`                                                        | Same                                                 |
| `updateExperiment`                                                               | Wholesale replacement; incoming extras wins anyway   |
| `experiment/toggleMultiObjective`                                                | Objective mode change invalidates a Pareto selection |

Do **not** clear inside `registerResult` — that path legitimately survives the round-trip.

## 3. Pareto plot wiring

`ParetoFrontPlot` (`packages/plots/src/pareto-front-plot/pareto-front-plot.tsx`) is unchanged. Its public API stays in index-space; coord-space storage is a container concern.

In `packages/ui/src/features/multi-objective/result.tsx`:

1. Remove the local `useState<number | null>(null)` for `selectedParetoPoint`.

2. Derive `indexOfSelected` from `experiment.extras.selectedPoint` and the current `pareto.front_x_data`:

   ```ts
   const selectedCoords = experiment.extras.selectedPoint as
     | Array<number | string>
     | undefined
   const indexOfSelected = selectedCoords
     ? matchFrontIndex(pareto.front_x_data, selectedCoords)
     : pareto.best_idx
   ```

   `matchFrontIndex` compares each row of `front_x_data` to `selectedCoords` element-wise (numbers as numbers, strings as strings). Strict equality, no tolerance. If no match, return `pareto.best_idx`. Define it in a new sibling file `packages/ui/src/features/multi-objective/result.utils.ts` and export from there.

3. Replace the click handler:

   ```ts
   const onSetSelectedParetoPoint = (index: number) => {
     const coords = pareto.front_x_data[index]
     if (!coords) return
     dispatch({ type: 'setSelectedParetoPoint', payload: coords })
   }
   ```

4. "Reset to default" dispatches `null`:

   ```ts
   onResetToDefault={() =>
     dispatch({ type: 'setSelectedParetoPoint', payload: null })
   }
   ```

5. Remove the `// TODO: multi - dispatch based onpareto point selection change` comment.

### What the user sees

- Click → highlight on the Pareto plot moves immediately (re-render driven by the derived `indexOfSelected`). The dirty indicator activates. The existing "Run" button becomes available.
- Pressing Run sends `extras.selectedPoint` (and `extras.pickled`, Section 4). The server returns refreshed single plots with the new highlight (and a fresh `pickled`). `registerResult` updates state and resets the hash; the dirty indicator clears.
- Adding a measurement clears the selection. The next run goes back to `best_idx`.

### In-between rendering (clicked but not yet re-run)

Single plots come from the previous response's plot data and still reflect the old highlight. The client does not attempt to re-render the single plot highlight — the server is the source of truth for what the highlight means in `single_0_*`. The dirty indicator communicates "the picture is stale; run to refresh."

## 4. Request builder & response handling

### `packages/core/src/context/experiment/api.ts`

Two additions in the `extras` block of `createFetchExperimentResultRequest`:

```ts
const selectedPoint = experiment.extras.selectedPoint as
  | Array<number | string>
  | undefined
const previousPickled = experiment.results.pickled || undefined

const request: RunOptimizerRequest = {
  experiment: {
    data: ...,
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
    optimizerConfig: { ... },
  },
}
```

Notes:

- `...(x ? { x } : {})` keeps the key absent when there is no value, so the md5 of "no-selection" requests stays byte-equivalent to the pre-change baseline.
- The OpenAPI-generated `ExperimentExtrasSelectedPointInner` is an empty interface (generator artifact from a polymorphic `anyOf`). Cast at the boundary as `as unknown as ExperimentExtrasSelectedPointInner[]`. The wire shape is `(number | string)[]`, which the server accepts.
- `previousPickled` is always sent when present. The server validates and falls back silently on mismatch; no client-side invalidation is needed.
- `graphFormat: "json"` is already in `experiment.extras` for multi-objective experiments (verified by sample data). It flows through via `...extras`. No change here.

### Response side

`fetchExperimentResult` already parses `result.result?.pickled ?? ''` into `experimentResultSchema.pickled`. No change there.

The OpenAPI diff types `result.result.extras` as `ResultResultExtras` (`{ pickledUsed?: boolean }`) instead of an unstructured `object`. The current line:

```ts
extras: result.result?.extras ?? {}
```

…runs through `experimentResultSchema.parse(...)` which expects `z.record(z.string(), z.unknown())`. The structurally-typed `ResultResultExtras` satisfies that record shape, so no typecheck break is expected; verify during implementation. If a break does surface, normalize to a plain record:

```ts
extras: { ...(result.result?.extras ?? {}) },
```

This preserves `pickledUsed` if present. No other response-side change is needed.

### Hash behavior

`calculate-change-reducer.ts` hashes the request body via `createFetchExperimentResultRequest`. With this change:

- `setSelectedParetoPoint` mutates `extras.selectedPoint` → next hash differs from `lastEvaluationHash` → `changedSinceLastEvaluation = true`.
- Running the request → `registerResult` recomputes `lastEvaluationHash` against the same builder → hashes match → flag returns to `false`.
- `pickled` enters the hash via the request body. Since `experiment.results.pickled` is only mutated by `registerResult` (which also resets the hash), `pickled` never causes spurious dirty flips between runs.

## 5. Testing, migration, edge cases

### Migration

None. `extras` is already `z.record(z.string(), z.unknown())`. Format version stays at `'18'`.

### Unit tests in `reducers.test.ts`

- `setSelectedParetoPoint` with a coord array sets `extras.selectedPoint`.
- `setSelectedParetoPoint` with `null` deletes the key (assert `'selectedPoint' in extras === false`).
- After setting a selection, the next pass through `calculateChangeReducer` flips `changedSinceLastEvaluation` to `true`.
- A parameterized table covers each clear-on-dirty action (`updateDataPoints`, `updateConfiguration`, add/edit/delete/enable variable, `experiment/toggleMultiObjective`) and asserts the key is removed.
- `registerResult` does **not** clear `extras.selectedPoint`.

### Unit tests for `createFetchExperimentResultRequest`

- No selection, empty pickled → emits no `extras.selectedPoint`, no `extras.pickled` (byte-equivalent to today's no-selection request).
- Selection set → emits `extras.selectedPoint: [...]`.
- `experiment.results.pickled` non-empty → emits `extras.pickled`.
- `experiment.results.pickled === ''` → omits `extras.pickled`.

### `Result.tsx` light test

- `front_x_data` row matching `extras.selectedPoint` yields the expected `indexOfSelected`.
- Non-matching selection falls back to `best_idx`.

Use whatever render-test pattern already exists in the package; otherwise add a small focused test.

### Existing tests to inspect

- `reducers.test.ts` lines exercising `pickled` (`83`, `164`, `738`, `765`) — should still pass; `registerResult`'s pickled assignment is unchanged.
- `test-utils.ts:109` (`pickled: 'pickled'`) — the new `createFetchExperimentResultRequest` will now include `pickled` in the outgoing body, which may change any snapshot/asserted JSON downstream. Adjust as needed.

### Edge cases

- **Rapid clicks before Run:** Only the latest selection is in `extras` when Run fires.
- **Click then add data before Run:** `updateDataPoints` clears the selection before the request is built. Lifecycle behaves as designed.
- **Server returns `pickledUsed: false`:** No special UI treatment in v1. Visible via `results.extras.pickledUsed` for debug.
- **Stale `extras.selectedPoint` from prior session that no longer matches the front:** `matchFrontIndex` returns no match → fall back to `best_idx`. The next Run sends the stale coords, but the server only uses them for the per-dimension highlight; the visual reverts to `best_idx` once `Result.tsx` re-derives the index.

## End-to-end verification

A live backend runs at `http://127.0.0.1:9090/v1.0` with `apikey=none`. The implementation agent must exercise the full happy path against it before declaring done:

1. Configure a multi-objective experiment and run an initial evaluation. Confirm `result.pickled` is non-empty and `result.extras.pickledUsed` is `false`.
2. Click a Pareto point in the UI. Confirm `experiment.extras.selectedPoint` is set, dirty flag flips, and the highlight on the Pareto plot moves.
3. Trigger Run. Confirm the outgoing request body contains both `extras.selectedPoint` and `extras.pickled`. Confirm `result.extras.pickledUsed` is `true` in the response, the per-dimension single plots refresh, and `lastEvaluationHash` resets to match.
4. Add a measurement. Confirm `extras.selectedPoint` is cleared and the next request omits the key.
5. Run again with the new data; the server reports `pickledUsed: false` (fingerprint mismatch fallback), and a new `result.pickled` is stored for the next round.

## Files touched

- `packages/core/src/context/experiment/experiment-reducers.ts` — new action, clear-on-dirty helper, calls in 9 reducers.
- `packages/core/src/context/experiment/api.ts` — selectedPoint and pickled in request extras; `extras: { ...result.result?.extras ?? {} }` normalization.
- `packages/ui/src/features/multi-objective/result.tsx` — derive index from extras, dispatch in click and reset handlers, remove local state and TODO.
- `packages/ui/src/features/multi-objective/result.utils.ts` — new file with `matchFrontIndex`.
- Tests: `reducers.test.ts`, new/updated `api.test.ts`, and minimal `result.tsx` render test.
