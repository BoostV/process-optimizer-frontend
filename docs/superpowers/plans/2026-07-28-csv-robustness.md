# CSV Robustness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make CSV export/import lossless and robust: quote fields so separators inside values (e.g. semicolons in notes) round-trip; sanitize factor/variable names at the source so an edge blank can't corrupt matching; and let the user pick the CSV separator.

**Architecture:** Three independent items. **A (quoting)** is confined to `packages/core/.../converters.ts`. **B2 (name sanitization)** trims names in the experiment reducer (with an optional migration to clean existing experiments). **C (separator UI)** adds a selector in `data-points.tsx` and threads the chosen separator into the existing `separator` params of `dataPointsToCSV`/`csvToDataPoints`. C depends on A for comma-safety.

**Tech Stack:** TypeScript (strict), Zod, immer, React 19, MUI, Vitest.

## Global Constraints

- **Base branch:** create the working branch from **`add-notes`** (its `meta.note` field and the CSV header-order fix are the ground truth these changes build on). Confirm before starting; `add-notes` is itself stacked on the unmerged `add-quality-function`.
- **Backward-compatible CSV:** a field with no special character must be emitted **unquoted**, so existing exports stay byte-identical and current converter tests pass unchanged.
- **Curated separators only:** `;` (default), Tab, `,`, `|`. No free-form custom input. Comma is offered only because quoting (Task 1–2) makes it safe.
- **Name lockstep:** whenever a variable name is trimmed, the matching `dataPoints[].data[].name` (and constraint dimensions) must be trimmed in the same operation — names are matched by exact `===` everywhere.
- Formatting is enforced by prettier/eslint via a husky pre-commit hook — don't hand-format; let the hook reformat on commit.
- Run from the relevant package dir. Targeted test: `npx vitest run <path>`. Full package: `npm test -- run`.
- Commit after each task. End commit messages with the repo's `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` trailer.

---

### Task 1: CSV export — quote fields (RFC-4180)

**Files:**

- Modify: `packages/core/src/common/util/converters/converters.ts` (`dataPointsToCSV`, lines ~123-173)
- Test: `packages/core/src/common/util/converters/converters.test.ts`

**Interfaces:**

- Produces: module-private `escapeCsvField(value: string, separator: string): string`. `dataPointsToCSV` output now quotes any field containing the separator, `"`, `\n`, or `\r`.

- [ ] **Step 1: Write the failing test**

Add inside `describe('dataPointsToCSV', ...)` in `converters.test.ts`:

```typescript
it('quotes meta values that contain the separator or a quote', () => {
  const csv = dataPointsToCSV([
    {
      meta: { id: 1, enabled: true, valid: true, note: 'a;b "c"' },
      data: [{ type: 'numeric', name: 'A', value: 1 }],
    },
  ])
  // the note field is quoted, inner quotes doubled; other fields untouched
  expect(csv).toBe('id;A;enabled;valid;note\n1;1;true;true;"a;b ""c"""')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/core && npx vitest run src/common/util/converters/converters.test.ts -t "quotes meta values"`
Expected: FAIL — the note is emitted raw (`a;b "c"`), producing extra `;`-fields and unescaped quotes.

- [ ] **Step 3: Add `escapeCsvField` and apply it on export**

In `converters.ts`, add the helper just above `dataPointsToCSV`:

```typescript
// RFC-4180: a field containing the separator, a double-quote, or a newline is
// wrapped in double-quotes with internal quotes doubled. Clean fields are left
// untouched, so exports of ordinary data are byte-identical to before.
const escapeCsvField = (value: string, separator: string): string =>
  value.includes(separator) ||
  value.includes('"') ||
  value.includes('\n') ||
  value.includes('\r')
    ? `"${value.replaceAll('"', '""')}"`
    : value
```

Then replace the `return` expression body (lines ~143-173) so every field — header names, data values, and meta values — is escaped:

```typescript
return dataPoints.length === 0
  ? ''
  : [
      ['id', ...header, ...meta]
        .map(field => escapeCsvField(field, separator))
        .join(separator),
    ]
      // Generate data lines
      .concat(
        [...dataPoints]
          .map(line => {
            const values = new Map(
              line.data.map(elm => [elm.name, String(elm.value)])
            )
            return { ...line, data: header.map(h => values.get(h) ?? '') }
          })
          .map(line =>
            // Meta values are emitted in the `meta` header (union) order —
            // looked up by key, not the row's own key order — so rows with
            // different optional meta keys (e.g. note vs description) stay
            // column-aligned on re-import.
            [
              String(line.meta.id),
              ...line.data,
              ...meta.map(key => {
                const value = (line.meta as Record<string, unknown>)[key]
                return value === undefined ? '' : String(value)
              }),
            ]
              .map(field => escapeCsvField(field, separator))
              .join(separator)
          )
      )
      .filter(s => '' !== s)
      .join(newline)
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd packages/core && npx vitest run src/common/util/converters/converters.test.ts`
Expected: PASS — the new test passes and all existing `dataPointsToCSV` assertions are unchanged (their values contain no special characters, so nothing gets quoted).

- [ ] **Step 5: Commit**

```bash
cd packages/core
git add src/common/util/converters/converters.ts src/common/util/converters/converters.test.ts
git commit -m "feat(core): quote CSV fields containing the separator or quotes"
```

---

### Task 2: CSV import — quote-aware parsing + round-trip

**Files:**

- Modify: `packages/core/src/common/util/converters/converters.ts` (`csvToDataPoints`, lines ~211-274)
- Test: `packages/core/src/common/util/converters/converters.test.ts`

**Interfaces:**

- Consumes: `escapeCsvField` (Task 1).
- Produces: module-private `parseCsvLine(line: string, separator: string): string[]`. `csvToDataPoints` now unquotes fields, so a note containing the separator round-trips.

- [ ] **Step 1: Write the failing test**

Add inside `describe('note round-trip', ...)` in `converters.test.ts` (reusing its `valueVars`):

```typescript
it('round-trips a note containing the separator and quotes', () => {
  const note = 'I pressed; it broke "hard"'
  const back = csvToDataPoints(
    dataPointsToCSV([
      {
        meta: { id: 1, enabled: true, valid: true, note },
        data: [{ type: 'numeric' as const, name: 'A', value: 1 }],
      },
    ]),
    valueVars,
    [],
    []
  )
  expect(back[0]?.meta.note).toBe(note)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/core && npx vitest run src/common/util/converters/converters.test.ts -t "round-trips a note containing the separator"`
Expected: FAIL — the naive `line.split(separator)` splits the quoted note on its inner `;`, so the note comes back truncated/garbled.

- [ ] **Step 3: Add `parseCsvLine` and use it**

In `converters.ts`, add the helper (near `escapeCsvField`):

```typescript
// Split one CSV line into fields, honoring RFC-4180 quotes: a double-quoted
// field may contain the separator, and "" is an escaped quote. (Embedded
// newlines are out of scope — the app's inputs are single-line.)
const parseCsvLine = (line: string, separator: string): string[] => {
  const fields: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === separator) {
      fields.push(field)
      field = ''
    } else {
      field += ch
    }
  }
  fields.push(field)
  return fields
}
```

In `csvToDataPoints`, replace the header split (line ~229):

```typescript
const header = parseCsvLine(lines[0] ?? '', separator).map(h => h.trim())
```

and the per-row split (lines ~236-238):

```typescript
const dataAsKeyValue = data.map(line =>
  parseCsvLine(line, separator).map((value, idx) => ({
    key: header[idx] ?? '',
    value,
  }))
)
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd packages/core && npx vitest run src/common/util/converters/converters.test.ts`
Expected: PASS — the round-trip test passes and all existing import tests still pass (unquoted lines parse identically).

- [ ] **Step 5: Commit**

```bash
cd packages/core
git add src/common/util/converters/converters.ts src/common/util/converters/converters.test.ts
git commit -m "feat(core): parse quoted CSV fields so separators round-trip"
```

---

### Task 3: Trim variable names at the reducer (B2 source fix)

**Files:**

- Modify: `packages/core/src/context/experiment/experiment-reducers.ts` (cases at lines ~347-442)
- Test: `packages/core/src/context/experiment/experiment-reducers.test.ts`

**Interfaces:**

- Produces: `addValueVariable`, `addCategorialVariable`, `editValueVariable`, `editCategoricalVariable` all store the variable `name` trimmed of leading/trailing whitespace, keeping matching data-point names in lockstep on edit.

- [ ] **Step 1: Write the failing tests**

Add to `experiment-reducers.test.ts` (follow the file's existing pattern for building a state and calling the reducer — mirror an existing `addValueVariable`/`editValueVariable` test; if none exists, dispatch through `experimentReducer` with a minimal experiment):

```typescript
describe('variable name trimming', () => {
  it('trims the name when adding a value variable', () => {
    const state = experimentReducer(emptyExperiment, {
      type: 'addValueVariable',
      payload: {
        type: 'continuous',
        name: '  Temp  ',
        description: '',
        min: 0,
        max: 10,
        enabled: true,
      },
    })
    expect(state.valueVariables.at(-1)?.name).toBe('Temp')
  })

  it('trims on rename and renames matching data points in lockstep', () => {
    const withVar = experimentReducer(emptyExperiment, {
      type: 'addValueVariable',
      payload: {
        type: 'continuous',
        name: 'Temp',
        description: '',
        min: 0,
        max: 10,
        enabled: true,
      },
    })
    const withPoint = {
      ...withVar,
      dataPoints: [
        {
          meta: { id: 1, enabled: true, valid: true },
          data: [{ type: 'numeric' as const, name: 'Temp', value: 5 }],
        },
      ],
    }
    const renamed = experimentReducer(withPoint, {
      type: 'editValueVariable',
      payload: {
        index: 0,
        newVariable: {
          type: 'continuous',
          name: '  Heat  ',
          description: '',
          min: 0,
          max: 10,
          enabled: true,
        },
      },
    })
    expect(renamed.valueVariables[0]?.name).toBe('Heat')
    expect(renamed.dataPoints[0]?.data[0]?.name).toBe('Heat')
  })
})
```

> Note for the implementer: confirm the exact reducer entry point used by sibling tests in this file (e.g. `experimentReducer(state, action)` vs `rootReducer`). Use whatever the existing tests use, and import `emptyExperiment` the same way they do. If the file's convention differs, match it rather than the sketch above.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd packages/core && npx vitest run src/context/experiment/experiment-reducers.test.ts -t "variable name trimming"`
Expected: FAIL — names are stored with surrounding spaces (`'  Temp  '`, `'  Heat  '`).

- [ ] **Step 3: Trim in the four cases**

In `experiment-reducers.ts`:

`addValueVariable` (line ~351) — trim the parsed payload:

```typescript
experimentSchema.shape.valueVariables.element.parse({
  ...action.payload,
  name: action.payload.name.trim(),
})
```

`addCategorialVariable` (line ~419) — same shape:

```typescript
experimentSchema.shape.categoricalVariables.element.parse({
  ...action.payload,
  name: action.payload.name.trim(),
})
```

`editValueVariable` (lines ~357-384) — trim once into a local `newVariable` and use it for both the parse and the lockstep helpers:

```typescript
      case 'editValueVariable': {
        const oldVariable = state.valueVariables[action.payload.index]
        const newVariable = {
          ...action.payload.newVariable,
          name: action.payload.newVariable.name.trim(),
        }
        state.valueVariables[action.payload.index] =
          experimentSchema.shape.valueVariables.element.parse({
            ...newVariable,
            min:
              newVariable.type === 'discrete'
                ? Math.round(newVariable.min)
                : newVariable.min,
            max:
              newVariable.type === 'discrete'
                ? Math.round(newVariable.max)
                : newVariable.max,
          })
        if (oldVariable !== undefined) {
          state.dataPoints = updateDataPointNamesAndValues(
            state,
            oldVariable,
            newVariable
          )
          state.constraints = updateNamesInConstraints(
            state,
            oldVariable.name,
            newVariable.name
          )
        }
        break
      }
```

`editCategoricalVariable` (lines ~427-442):

```typescript
      case 'editCategoricalVariable': {
        const oldVariableName =
          state.categoricalVariables[action.payload.index]?.name
        const newVariable = {
          ...action.payload.newVariable,
          name: action.payload.newVariable.name.trim(),
        }
        state.categoricalVariables[action.payload.index] =
          experimentSchema.shape.categoricalVariables.element.parse(newVariable)
        if (oldVariableName !== undefined) {
          state.dataPoints = updateDataPointNames(
            state,
            oldVariableName,
            newVariable.name
          )
        }
        break
      }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd packages/core && npx vitest run src/context/experiment/experiment-reducers.test.ts`
Expected: PASS — new trimming tests pass; existing reducer tests unaffected (their names have no surrounding spaces).

- [ ] **Step 5: Commit**

```bash
cd packages/core
git add src/context/experiment/experiment-reducers.ts src/context/experiment/experiment-reducers.test.ts
git commit -m "feat(core): trim variable names on add/edit, in lockstep with data points"
```

---

### Task 4 (OPTIONAL — legacy cleanup): migration to trim existing names

Task 3 prevents _new_ stray-space names; it does not clean experiments that already have one (the backlog bug persists for those until the variable is edited). This migration cleans them permanently, which also makes their CSV export/import work — without touching the converter. **Skip this task if you only care about newly-created/edited experiments.** It bumps the data-format version again (`22 → 23`).

**Files:**

- Modify: `packages/core/src/common/types/common.ts` (`currentVersion` `'22' → '23'`)
- Modify: `packages/core/src/common/types/common.test.ts` (version-pinned assertions `22 → 23`)
- Create: `packages/core/src/common/util/migration/migrations/migrateToV23.ts`
- Modify: `packages/core/src/common/util/migration/migrations/index.ts`
- Modify: `packages/core/src/common/util/migration/migration.ts`
- Create: `packages/core/src/common/util/migration/data-formats/23.json` (copy of `22.json`, version `23`)
- Modify: `packages/core/src/common/util/migration/migration.test.ts`
- Generated (commit it): `packages/core/src/common/util/migration/schemas/23.json`

**Interfaces:**

- Produces: `migrateToV23(json) => ExperimentType` that trims all variable names + matching data-point names + constraint dimensions and stamps version `'23'`. `currentVersion === '23'`.

- [ ] **Step 1: Write the failing tests**

In `common.test.ts`, change the `currentVersion is 22` assertion to `'23'`, and the two experiment-literal `dataFormatVersion: '22'` occurrences to `'23'` (mirror what the v22 bump did).

In `migration.test.ts`, add the import and a describe block:

```typescript
import { migrateToV23 } from './migrations/migrateToV23'

describe('migrateToV23', () => {
  it('trims variable names and matching data-point names, bumps to 23', () => {
    const v22 = {
      info: { dataFormatVersion: '22', name: 'n' },
      valueVariables: [
        {
          type: 'continuous',
          name: '  Temp  ',
          description: '',
          min: 0,
          max: 10,
          enabled: true,
        },
      ],
      categoricalVariables: [],
      constraints: [{ type: 'sum', value: 0, dimensions: ['  Temp  '] }],
      dataPoints: [
        {
          meta: { id: 1, enabled: true, valid: true },
          data: [{ type: 'numeric', name: '  Temp  ', value: 5 }],
        },
      ],
    }
    const v23 = migrateToV23(v22 as never)
    expect(v23.info.dataFormatVersion).toBe('23')
    expect(v23.valueVariables[0].name).toBe('Temp')
    expect(v23.dataPoints[0].data[0].name).toBe('Temp')
    expect(v23.constraints[0].dimensions[0]).toBe('Temp')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `cd packages/core && npx vitest run src/common/types/common.test.ts src/common/util/migration/migration.test.ts`
Expected: FAIL — `currentVersion` is still `'22'`; `migrateToV23` does not exist.

- [ ] **Step 3: Bump the version**

In `common.ts` line 6: `export const currentVersion = '23'`.

- [ ] **Step 4: Add the migration + fixture + registration**

Create `migrations/migrateToV23.ts`:

```typescript
import { ExperimentType } from '@core/common/types'
import { produce } from 'immer'

// v23 trims leading/trailing whitespace from variable names, and applies the
// same rename to matching data-point names and constraint dimensions in
// lockstep (names are matched by exact equality throughout the app). Fixes
// experiments where a stray edge blank in a factor name broke CSV re-import.
export const migrateToV23 = (json: ExperimentType): ExperimentType =>
  produce(json, (draft: ExperimentType) => {
    const renames = new Map<string, string>()
    const trim = (v: { name: string }) => {
      const trimmed = v.name.trim()
      if (trimmed !== v.name) renames.set(v.name, trimmed)
      v.name = trimmed
    }
    draft.valueVariables.forEach(trim)
    draft.categoricalVariables.forEach(trim)
    draft.dataPoints.forEach(dp =>
      dp.data.forEach(point => {
        const renamed = renames.get(point.name)
        if (renamed !== undefined) point.name = renamed
      })
    )
    draft.constraints.forEach(c => {
      c.dimensions = c.dimensions.map(d => renames.get(d) ?? d)
    })
    draft.info.dataFormatVersion = '23'
  })
```

Add to `migrations/index.ts`: `export { migrateToV23 } from './migrateToV23'`.

In `migration.ts`: import `migrateToV23` from `'./migrations'` and append `{ version: '23', converter: migrateToV23 }` to `MIGRATIONS`.

Create the fixture: `cp data-formats/22.json data-formats/23.json`, then change its `"dataFormatVersion"` to `"23"` (its names have no surrounding spaces, so the transform is a no-op on the fixture — correct).

- [ ] **Step 5: Run the full core suite**

Run: `cd packages/core && npm test -- run`
Expected: PASS. `storeLatestSchema()` writes `schemas/23.json` during the run — `git add` it.

- [ ] **Step 6: Commit**

```bash
cd packages/core
git add src/common/types/common.ts src/common/types/common.test.ts \
  src/common/util/migration/migrations/migrateToV23.ts \
  src/common/util/migration/migrations/index.ts \
  src/common/util/migration/migration.ts \
  src/common/util/migration/migration.test.ts \
  src/common/util/migration/data-formats/23.json \
  src/common/util/migration/schemas/23.json
git commit -m "feat(core): migrate (v23) trimming existing variable/data-point names"
```

---

### Task 5: User-selectable CSV separator (C)

**Files:**

- Modify: `packages/ui/src/features/data-points/upload-csv-button.tsx` (thread a `separator` prop into its `csvToDataPoints` call)
- Modify: `packages/ui/src/features/data-points/data-points.tsx` (separator state + selector + thread into download & upload)
- Test: `packages/core/src/common/util/converters/converters.test.ts` (round-trip per separator) and `packages/ui/src/features/data-points/upload-csv-button.test.tsx` (new — separator is forwarded to parsing)

**Interfaces:**

- Consumes: quoting from Tasks 1–2 (makes comma safe). `dataPointsToCSV`/`csvToDataPoints` already accept `separator`.
- Produces: `UploadCSVButton` gains a `separator?: string` prop (default `';'`); `DataPoints` renders a separator `Select` and threads the choice into both CSV directions.

- [ ] **Step 1: Write the failing tests**

Core — add to `converters.test.ts` (inside `describe('converters', ...)`), confirming each offered separator round-trips (including a value that contains the _other_ separators, now safe via quoting):

```typescript
describe.each([';', ',', '\t', '|'])('separator %j round-trip', sep => {
  it('round-trips values and notes', () => {
    const valueVars = [
      {
        type: 'continuous' as const,
        name: 'A',
        description: '',
        min: 0,
        max: 10,
        enabled: true,
      },
    ]
    const input = [
      {
        meta: { id: 1, enabled: true, valid: true, note: 'x;y,z\tw|q' },
        data: [{ type: 'numeric' as const, name: 'A', value: 1 }],
      },
    ]
    const back = csvToDataPoints(
      dataPointsToCSV(input, sep),
      valueVars,
      [],
      [],
      sep
    )
    expect(back[0]?.meta.note).toBe('x;y,z\tw|q')
  })
})
```

UI — create `packages/ui/src/features/data-points/upload-csv-button.test.tsx` asserting the `separator` prop reaches the parser (a tab-separated file parses only when `separator="\t"` is passed):

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/react'
import UploadCSVButton from './upload-csv-button'

afterEach(() => cleanup())

const valueVars = [
  {
    type: 'continuous' as const,
    name: 'A',
    description: '',
    min: 0,
    max: 10,
    enabled: true,
  },
]

const uploadFile = (contents: string) => {
  const input = screen.getByTestId('upload-csv-input') as HTMLInputElement
  const file = new File([contents], 'data.csv', { type: 'text/csv' })
  fireEvent.change(input, { target: { files: [file] } })
}

it('parses using the provided separator', async () => {
  const onUpload = vi.fn()
  render(
    <UploadCSVButton
      onUpload={onUpload}
      separator={'\t'}
      valueVariables={valueVars}
      categoricalVariables={[]}
      scoreVariables={[]}
    />
  )
  uploadFile('id\tA\tenabled\tvalid\n1\t5\ttrue\ttrue')
  await waitFor(() => expect(onUpload).toHaveBeenCalled())
  expect(onUpload.mock.calls[0][0][0].data[0]).toMatchObject({
    name: 'A',
    value: 5,
  })
})
```

> Implementer: check `upload-csv-button.tsx` for how the hidden `<input type="file">` is exposed. If it has no `data-testid`, add `data-testid="upload-csv-input"` to it as part of Step 3 (a test-only affordance, no behavior change). If reading a `File` in jsdom needs `file.text()` shimming, prefer `await file.text()` in the component; otherwise adjust the test to the component's existing FileReader flow.

- [ ] **Step 2: Run to verify failure**

Run: `cd packages/core && npx vitest run src/common/util/converters/converters.test.ts -t "separator"` (expect FAIL only if quoting from Tasks 1–2 is absent; with them present the core test should already pass — if so, note it and keep it as a guard). Then `cd ../ui && npx vitest run src/features/data-points/upload-csv-button.test.tsx` — expect FAIL: `UploadCSVButton` has no `separator` prop, so a tab file isn't parsed.

- [ ] **Step 3: Thread the separator into `UploadCSVButton`**

In `upload-csv-button.tsx`, add `separator?: string` to the props (default `';'`) and pass it as the 5th argument of the existing `csvToDataPoints(data, valueVariables, categoricalVariables, scoreVariables, separator)` call. Ensure the file `<input>` carries `data-testid="upload-csv-input"`.

- [ ] **Step 4: Add the selector and thread it in `data-points.tsx`**

Add local state and a selector, and thread `separator` into both CSV directions:

```tsx
// with the other useState hooks
const CSV_SEPARATORS: { label: string; value: string }[] = [
  { label: 'Semicolon ( ; )', value: ';' },
  { label: 'Comma ( , )', value: ',' },
  { label: 'Tab', value: '\t' },
  { label: 'Pipe ( | )', value: '|' },
]
const [separator, setSeparator] = useState(';')
```

In the header button group, before/after the download/upload buttons, add (import `Select`, `MenuItem` from `@mui/material`):

```tsx
<Select
  size="small"
  value={separator}
  onChange={e => setSeparator(e.target.value)}
  aria-label="CSV separator"
  sx={{ mr: 1 }}
>
  {CSV_SEPARATORS.map(s => (
    <MenuItem key={s.value} value={s.value}>
      {s.label}
    </MenuItem>
  ))}
</Select>
```

Thread it into the download call:

```tsx
saveCSVToLocalFile(
  dataPointsToCSV(dataPoints, separator),
  experimentId + '.csv'
)
```

and into the upload button:

```tsx
<UploadCSVButton
  light
  onUpload={(dataPoints: DataEntry[]) => onUpdateDataPoints(dataPoints)}
  categoricalVariables={enabledCategoricalVariables}
  valueVariables={enabledValueVariables}
  scoreVariables={scoreVariables}
  separator={separator}
/>
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd packages/core && npx vitest run src/common/util/converters/converters.test.ts` and `cd ../ui && npx vitest run src/features/data-points/upload-csv-button.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd packages/ui
git add src/features/data-points/upload-csv-button.tsx \
  src/features/data-points/upload-csv-button.test.tsx \
  src/features/data-points/data-points.tsx
git add ../core/src/common/util/converters/converters.test.ts
git commit -m "feat(ui): user-selectable CSV separator (semicolon, comma, tab, pipe)"
```

---

### Task 6: Full verification

- [ ] **Step 1: Build + test both packages**

```bash
cd packages/core && npm test -- run && npm run build
cd ../ui && npm test -- run && npm run build
```

Expected: all green, both builds succeed.

- [ ] **Step 2: Manual/browser check (via `dev:local`)**

Add a note containing `;` and `,`, export with each separator, re-import, confirm the note and all columns survive; create a factor name with a leading space and confirm it's stored trimmed and CSV round-trips.

---

## Notes for the implementer

- Don't hand-format; the pre-commit hook runs prettier/eslint.
- Task 4 is optional and independently droppable; Tasks 1–2 (quoting) and 3 (source trim) are the core of the feature. Task 5 (separator UI) depends on Tasks 1–2 for comma safety.
- The UI is consumed by the `packages/ui/src/demo/experiment-view.tsx` harness; the separator is intentionally ephemeral component state (like `newestFirst`). Persisting it is out of scope.
