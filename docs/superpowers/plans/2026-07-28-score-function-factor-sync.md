# Score-Function Factor Sync & Compute Robustness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make score functions robust when factors change. Fix the silent-bail bug (a score function stops computing when it declares factor variables that aren't used, or that were disabled/deleted/renamed), keep the function in sync when factors are renamed/deleted, flag data points whose score genuinely can't be computed, and warn about undefined symbols in the expression.

**Architecture:** Four fixes. (1) `computeScore` only requires the symbols the expression actually uses — declared-but-unused variables no longer poison it. (2) The reducer propagates factor **rename** into `scoreFunction.variables` and **prunes** deleted factors. (3) A new per-row validation flags function-mode points whose score can't be computed even though their responses are complete (a used factor is disabled/removed) — allowed, but marked invalid. (4) A core helper + inline settings warning surface undefined symbols in the expression.

**Tech Stack:** TypeScript (strict), Zod, immer, mathjs, React 19, MUI, Vitest.

## Global Constraints

- **Branch:** `add-quality-function` (current HEAD `1d40dcc`). This branch already has `computeScore`, `usedSymbols`, `deriveSymbol` (`common/util/score/compute-score.ts`), and `responsesComplete` + `countDataPointsMissingResponses` (`context/experiment/validation.ts`). After this lands, `add-notes` gets rebased onto `add-quality-function`.
- **Score-function factor references** use `{ source: 'factor', factorName, symbol, name }`; the expression uses `symbol`. On factor **rename**, update `factorName` and display `name` but **keep `symbol` stable** (the expression references the symbol — changing it would break the expression).
- **`computeScore` must only require symbols used by the expression** (`usedSymbols(expression)`); ignore declared variables the expression doesn't reference.
- **Disable a factor a function uses → allowed, not blocked.** Affected function-mode data points are flagged **invalid** (excluded from the optimizer) via validation, not prevented at disable time.
- **Validation already runs** for `editValueVariable` / `deleteValueVariable` / `setValueVariableEnabled` (they're in the `reducers.ts` fall-through), so no reducer-routing changes are needed for the new validation to fire.
- `computeScore` is imported as `import { computeScore } from '@core/common/util/score'`.
- Formatting via prettier/eslint pre-commit hook — don't hand-format. Targeted test `npx vitest run <path>`; full `npm test -- run`. Commit per task with the repo's `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` trailer.

---

### Task 1: `computeScore` — only require symbols the expression uses

**Files:**

- Modify: `packages/core/src/common/util/score/compute-score.ts` (`computeScore`, ~lines 45-72)
- Test: `packages/core/src/common/util/score/compute-score.test.ts`

**Interfaces:**

- Produces: `computeScore` ignores declared variables whose `symbol` is not in `usedSymbols(fn.expression)`. A used symbol that can't be resolved (missing response/factor value) still yields `undefined`.

- [ ] **Step 1: Write the failing test**

Add to `compute-score.test.ts` (mirror the existing test style):

```typescript
it('ignores declared variables the expression does not use', () => {
  // expression uses only `water`; the extra factor vars have no data — must NOT bail
  const fn = {
    expression: 'water',
    variables: [
      {
        name: 'Pin elevation',
        symbol: 'pinElevation',
        source: 'factor' as const,
        factorName: 'Pin elevation',
      },
      {
        name: 'Orangeknas',
        symbol: 'orangeknas',
        source: 'factor' as const,
        factorName: 'Orangeknas',
      },
      { name: 'water', symbol: 'water', source: 'response' as const },
    ],
  }
  const factorData = [
    { type: 'numeric' as const, name: 'Pin elevation', value: 130 },
  ]
  expect(computeScore(fn, [{ symbol: 'water', value: 4 }], factorData)).toBe(4)
})

it('still returns undefined when a USED symbol cannot be resolved', () => {
  const fn = {
    expression: 'pinElevation + water',
    variables: [
      {
        name: 'Pin elevation',
        symbol: 'pinElevation',
        source: 'factor' as const,
        factorName: 'Pin elevation',
      },
      { name: 'water', symbol: 'water', source: 'response' as const },
    ],
  }
  // Pin elevation used but absent from factorData -> undefined
  expect(computeScore(fn, [{ symbol: 'water', value: 4 }], [])).toBeUndefined()
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd packages/core && npx vitest run src/common/util/score/compute-score.test.ts -t "ignores declared variables"`
Expected: FAIL — today the missing `orangeknas` factor makes `computeScore` return `undefined` instead of `4`.

- [ ] **Step 3: Scope the loop to used symbols**

In `compute-score.ts`, at the top of `computeScore`, compute the used set and skip unused variables:

```typescript
export const computeScore = (
  fn: ScoreFunctionType,
  responseValues: { symbol: string; value: number }[],
  factorData: DataPointType[]
): number | undefined => {
  const used = new Set(usedSymbols(fn.expression))
  const scope: Record<string, number> = {}
  for (const variable of fn.variables) {
    if (!used.has(variable.symbol)) continue
    if (variable.source === 'response') {
      const rv = responseValues.find(r => r.symbol === variable.symbol)
      if (rv === undefined || !Number.isFinite(rv.value)) return undefined
      scope[variable.symbol] = rv.value
    } else {
      const fd = factorData.find(d => d.name === variable.factorName)
      const value = fd === undefined ? undefined : Number(fd.value)
      if (value === undefined || !Number.isFinite(value)) return undefined
      scope[variable.symbol] = value
    }
  }
  try {
    const result = evaluate(fn.expression, scope)
    return typeof result === 'number' && Number.isFinite(result)
      ? result
      : undefined
  } catch {
    return undefined
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd packages/core && npx vitest run src/common/util/score/compute-score.test.ts` then `npm test -- run`
Expected: PASS. If a pre-existing test encoded the old "requires every declared var" behavior, update it — that was the bug.

- [ ] **Step 5: Commit**

```bash
cd packages/core
git add src/common/util/score/compute-score.ts src/common/util/score/compute-score.test.ts
git commit -m "fix(core): computeScore only requires symbols the expression uses"
```

---

### Task 2: Reconcile score-function variables on factor rename & delete

**Files:**

- Modify: `packages/core/src/context/experiment/experiment-reducers.ts` (`editValueVariable` ~357-384; `deleteValueVariable` ~386-404)
- Test: `packages/core/src/context/experiment/experiment-reducers.test.ts`

**Interfaces:**

- Produces: `editValueVariable` updates matching `scoreFunction.variables[].factorName`/`.name` to the new name (symbol unchanged); `deleteValueVariable` removes matching factor variables from every `scoreFunction.variables`.

- [ ] **Step 1: Write the failing tests**

Add to `experiment-reducers.test.ts` (use the file's `rootReducer(state, action)` + `emptyExperiment`/`State` convention):

```typescript
describe('score-function factor sync', () => {
  const withFn = {
    ...emptyExperiment,
    valueVariables: [
      {
        type: 'discrete' as const,
        name: 'Pin elevation',
        description: '',
        min: 0,
        max: 200,
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
          expression: 'pinElevation',
          variables: [
            {
              name: 'Pin elevation',
              symbol: 'pinElevation',
              source: 'factor' as const,
              factorName: 'Pin elevation',
            },
          ],
        },
      },
    ],
    dataPoints: [],
  }

  it('propagates a factor rename into the score function (symbol kept)', () => {
    const s = rootReducer({ experiment: withFn } as State, {
      type: 'editValueVariable',
      payload: {
        index: 0,
        newVariable: {
          type: 'discrete',
          name: 'Pin height',
          description: '',
          min: 0,
          max: 200,
          enabled: true,
        },
      },
    })
    const v = s.experiment.scoreVariables[0]?.scoreFunction?.variables[0]
    expect(v).toMatchObject({
      factorName: 'Pin height',
      name: 'Pin height',
      symbol: 'pinElevation',
    })
  })

  it('prunes a deleted factor from the score function', () => {
    const s = rootReducer({ experiment: withFn } as State, {
      type: 'deleteValueVariable',
      payload: 0,
    })
    expect(
      s.experiment.scoreVariables[0]?.scoreFunction?.variables
    ).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd packages/core && npx vitest run src/context/experiment/experiment-reducers.test.ts -t "score-function factor sync"`
Expected: FAIL — rename leaves `factorName: 'Pin elevation'`; delete leaves the variable in place.

- [ ] **Step 3: Propagate rename in `editValueVariable`**

Inside `editValueVariable`, in the `if (oldVariable !== undefined) { ... }` block (after the existing `updateDataPointNamesAndValues` / `updateNamesInConstraints` calls), add an immer mutation (the reducer body already mutates `state` directly):

```typescript
state.scoreVariables.forEach(sv =>
  sv.scoreFunction?.variables.forEach(v => {
    if (v.source === 'factor' && v.factorName === oldVariable.name) {
      v.factorName = action.payload.newVariable.name
      v.name = action.payload.newVariable.name
    }
  })
)
```

- [ ] **Step 4: Prune in `deleteValueVariable`**

Inside `deleteValueVariable`, capture the deleted name and prune (place after the existing `state.constraints = ...` filter):

```typescript
const deletedName = oldValueVariables[action.payload]?.name
if (deletedName !== undefined) {
  state.scoreVariables.forEach(sv => {
    if (sv.scoreFunction !== undefined) {
      sv.scoreFunction.variables = sv.scoreFunction.variables.filter(
        v => !(v.source === 'factor' && v.factorName === deletedName)
      )
    }
  })
}
```

(`oldValueVariables` is already captured at the top of the case.)

- [ ] **Step 5: Run to verify pass**

Run: `cd packages/core && npx vitest run src/context/experiment/experiment-reducers.test.ts` then `npm test -- run`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd packages/core
git add src/context/experiment/experiment-reducers.ts src/context/experiment/experiment-reducers.test.ts
git commit -m "fix(core): keep score-function variables in sync on factor rename/delete"
```

---

### Task 3: Validation — flag data points whose score can't be computed

**Files:**

- Modify: `packages/core/src/context/experiment/validation.ts` (new `validateDataPointsScoreUncomputable`; add to `validateExperiment`; add message in `findDataPointViolations`)
- Modify: `packages/core/src/context/experiment/validation-reducer.ts` (`ValidationViolations` field + `isValid` clause)
- Test: `packages/core/src/context/experiment/validation.test.ts`

**Interfaces:**

- Consumes: `computeScore` (Task 1), `responsesComplete` (existing).
- Produces: `ValidationViolations.dataPointsScoreUncomputable: { id: number; scoreName: string }[]` — function-mode rows whose responses are complete but `computeScore` still returns `undefined` (a used factor is disabled/removed, or the expression is invalid). These rows get `meta.valid = false` and a table message.

- [ ] **Step 1: Write the failing test**

Add to `validation.test.ts`:

```typescript
import { validateExperiment } from './validation'
import { validationReducer } from './validation-reducer'

it('flags a function-mode point as invalid when a used factor is unavailable', () => {
  const experiment = {
    ...emptyExperiment,
    valueVariables: [
      // "Pin elevation" is disabled -> not present in the data point's data
      {
        type: 'discrete' as const,
        name: 'Pin elevation',
        description: '',
        min: 0,
        max: 200,
        enabled: false,
      },
    ],
    scoreVariables: [
      {
        name: 'quality' as const,
        label: 'Quality (0-5)',
        description: '',
        enabled: true,
        scoreFunction: {
          expression: 'pinElevation',
          variables: [
            {
              name: 'Pin elevation',
              symbol: 'pinElevation',
              source: 'factor' as const,
              factorName: 'Pin elevation',
            },
          ],
        },
      },
    ],
    dataPoints: [
      {
        meta: { id: 1, enabled: true, valid: true },
        data: [{ type: 'score' as const, name: 'quality', value: 3 }], // no Pin elevation column
        responses: [
          { scoreName: 'quality' as const, useFunction: true, values: [] },
        ],
      },
    ],
  }
  const violations = validateExperiment(experiment)
  expect(violations.dataPointsScoreUncomputable).toContainEqual({
    id: 1,
    scoreName: 'quality',
  })
  const validated = validationReducer(experiment, violations)
  expect(validated.dataPoints[0]?.meta.valid).toBe(false)
})
```

> Note: `responsesComplete` for a function with no response-source symbols is vacuously true, so this row is NOT a responses-missing violation — it's specifically uncomputable because the used factor value is absent. If `emptyExperiment` import differs here, match the file's existing import.

- [ ] **Step 2: Run to verify it fails**

Run: `cd packages/core && npx vitest run src/context/experiment/validation.test.ts -t "used factor is unavailable"`
Expected: FAIL — `dataPointsScoreUncomputable` doesn't exist yet.

- [ ] **Step 3: Add the validation**

In `validation.ts`, add `import { computeScore } from '@core/common/util/score'` (top). Add the validator (next to `validateDataPointsResponsesUndefined`):

```typescript
// Function-mode points whose responses are complete but whose score still can't
// be computed — e.g. a factor the function uses is disabled/removed, or the
// expression is invalid. (Responses-missing is reported separately.)
export const validateDataPointsScoreUncomputable = (
  experiment: ExperimentType
): { id: number; scoreName: string }[] => {
  const violations: { id: number; scoreName: string }[] = []
  const functionsByScore = new Map(
    experiment.scoreVariables
      .filter(sv => sv.scoreFunction !== undefined)
      .map(sv => [sv.name, sv.scoreFunction!])
  )
  experiment.dataPoints.forEach(dp => {
    dp.responses?.forEach(resp => {
      const fn = functionsByScore.get(resp.scoreName)
      if (fn === undefined || !resp.useFunction) return
      if (
        responsesComplete(fn, resp.values) &&
        computeScore(fn, resp.values, dp.data) === undefined
      ) {
        violations.push({ id: dp.meta.id, scoreName: resp.scoreName })
      }
    })
  })
  return violations
}
```

Add it to `validateExperiment`'s returned object:

```typescript
    dataPointsScoreUncomputable: validateDataPointsScoreUncomputable(experiment),
```

- [ ] **Step 4: Wire the violation into validity + messages**

In `validation-reducer.ts`, add the field to `ValidationViolations`:

```typescript
dataPointsScoreUncomputable: {
  id: number
  scoreName: string
}
;[]
```

and add a clause to `isValid`:

```typescript
          && !violations.dataPointsScoreUncomputable.some(v => v.id === dp.meta.id)
```

In `validation.ts` `findDataPointViolations`, include the new list in the id concat and add a message branch (mirroring the `responsesUndefined` block):

```typescript
const scoreUncomputable = violations.dataPointsScoreUncomputable
// ...add `.concat(scoreUncomputable.map(r => r.id))` to the findUniqueEntries(...) chain...
scoreUncomputable
  .filter(r => r.id === e)
  .forEach(r => {
    messages.push(
      `The ${r.scoreName} function can't be computed for this point — a factor it uses is disabled, removed, or has no value.`
    )
  })
```

- [ ] **Step 5: Run to verify pass**

Run: `cd packages/core && npx vitest run src/context/experiment/validation.test.ts` then `npm test -- run`
Expected: PASS (new test + existing validation tests unaffected).

- [ ] **Step 6: Commit**

```bash
cd packages/core
git add src/context/experiment/validation.ts src/context/experiment/validation-reducer.ts src/context/experiment/validation.test.ts
git commit -m "feat(core): flag data points whose score function can't be computed"
```

---

### Task 4: Undefined-symbol warning in the Score functions panel

**Files:**

- Modify: `packages/core/src/common/util/score/compute-score.ts` (export `findUndefinedSymbols`)
- Test: `packages/core/src/common/util/score/compute-score.test.ts`
- Modify: `packages/ui/src/features/data-points/settings/data-points-settings.tsx` (inline warning)
- Test: `packages/ui/src/features/data-points/settings/data-points-settings.test.tsx`

**Interfaces:**

- Produces: `findUndefinedSymbols(fn: ScoreFunctionType): string[]` — symbols the expression references that are neither declared variables nor mathjs built-ins.

- [ ] **Step 1: Write the failing tests**

Core (`compute-score.test.ts`):

```typescript
it('finds symbols used in the expression that are not declared (excluding math builtins)', () => {
  const fn = {
    expression: 'a + b * pi + water',
    variables: [
      { name: 'water', symbol: 'water', source: 'response' as const },
    ],
  }
  expect(findUndefinedSymbols(fn).sort()).toEqual(['a', 'b'])
})
```

UI (`data-points-settings.test.tsx`) — extend the existing suite: with an objective whose expression references an undeclared symbol (e.g. `a + water` where only `water` is a variable) and no syntax error, the panel shows a warning containing "Unknown" and the symbol name.

- [ ] **Step 2: Run to verify failure**

Run core `-t "not declared"` (FAIL — not exported) and the ui test (FAIL — no warning).

- [ ] **Step 3: Add `findUndefinedSymbols`**

In `compute-score.ts` (has `usedSymbols`, `evaluate`):

```typescript
// Symbols the expression references that are neither declared variables nor
// known to mathjs (so `pi`, `sin`, ... are not flagged).
export const findUndefinedSymbols = (fn: ScoreFunctionType): string[] => {
  const declared = new Set(fn.variables.map(v => v.symbol))
  return usedSymbols(fn.expression).filter(s => {
    if (declared.has(s)) return false
    try {
      evaluate(s)
      return false
    } catch {
      return true
    }
  })
}
```

- [ ] **Step 4: Show the warning in the panel**

In `data-points-settings.tsx`, import `findUndefinedSymbols` from core. Compute for the active draft:

```typescript
const undefinedSymbols = draft ? findUndefinedSymbols(draft) : []
```

Render an `InfoBox` (`type="warning"`) in the function editor area, next to the existing expression-error `InfoBox`, shown only when there is no syntax error but undefined symbols exist:

```tsx
{
  !expressionError && undefinedSymbols.length > 0 && (
    <InfoBox
      type="warning"
      margin="8px 0 0 0"
      text={`Unknown variables: ${undefinedSymbols.join(', ')}. Add them as factors or responses.`}
    />
  )
}
```

- [ ] **Step 5: Run to verify pass**

Run core + ui targeted tests, then `npm test -- run` in each. Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd packages/core && git add src/common/util/score/compute-score.ts src/common/util/score/compute-score.test.ts
cd ../ui && git add src/features/data-points/settings/data-points-settings.tsx src/features/data-points/settings/data-points-settings.test.tsx
git commit -m "feat: warn about undefined symbols in a score function expression"
```

---

### Task 5: Full verification

- [ ] **Step 1: Build + test both packages**

```bash
cd packages/core && npm test -- run && npm run build
cd ../ui && npm test -- run && npm run build
```

Expected: all green.

- [ ] **Step 2: Manual/browser check (via `dev:local`)**

Reproduce the reported bug: a function `water` with extra unused/disabled factor variables and `water=4` on a point → the point's quality now computes to **4** (not the stale value). Then: **rename** a used factor → function keeps computing; **delete** a used factor → its variable disappears from the function and points using it show the "can't be computed" invalid message; **disable** a used factor → affected points flagged invalid; type an undefined symbol in the expression → the "Unknown variables" warning appears.

---

## Notes for the implementer

- Don't hand-format; the pre-commit hook runs prettier/eslint.
- Task 1 is the core correctness fix and unblocks Task 3 (which relies on the used-symbols `computeScore`). Do Task 1 first.
- Keep the factor `symbol` stable on rename — only `factorName`/display `name` change — or the expression (which uses the symbol) would break.
- After Task 5, rebase `add-notes` onto `add-quality-function` (expect small conflicts in the data-points files, which `add-notes` also touches).
