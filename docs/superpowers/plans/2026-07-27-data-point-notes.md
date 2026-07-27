# Data Point Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let each data point carry a free-text `note`, entered in the data-point editor and surfaced as a hover-tooltip note icon in the data-points table.

**Architecture:** The note lives on `DataEntry.meta.note` (optional string) in the `core` package's Zod schema. It threads through the existing `ui` view-model (`TableDataRow.note`) and the existing bulk `updateDataPoints` flow — no new reducer action. The editor writes `editedRow.note`; the table reads `tableRow.note`. CSV export already emits all meta keys; CSV import gains explicit `note` handling for a lossless round-trip. Adding a field to `meta` bumps the pinned data-format version `21 → 22` with a no-op migration + fixture.

**Tech Stack:** TypeScript (strict), Zod, React 19, MUI, Vitest, immer, remeda.

## Global Constraints

- Data-format version is bumped `'21' → '22'`. `infoSchema.dataFormatVersion` is a `z.literal`, so the bump requires a `migrateToV22` + a `data-formats/22.json` fixture or `migration.test.ts` breaks. Every core test that hardcodes `'21'` must move to `'22'`.
- Note lives at `DataEntry.meta.note`, typed `z.optional(z.string())`. Empty/absent note ⇒ no `note` key persisted.
- Table tooltip shows the note truncated to **60 characters**, appending `…` when longer.
- Table note icon is MUI `DescriptionOutlined`, `color="primary"`, rendered **only when the row has a non-empty note**, positioned immediately **left of** the Edit (pencil) icon.
- Formatting is enforced by prettier/eslint via a husky pre-commit hook — do NOT hand-format; let the hook reformat on commit.
- Run all commands from the relevant package dir. Targeted test run: `npx vitest run <path>` (non-watch). Full package run: `npm test -- run`.
- **Known limitation (out of scope):** the CSV format is naive (`;` separator, no quoting). A note containing the separator or a newline is not round-trip safe. Acceptable for now.

---

### Task 1: Core — add `note` to meta, bump to v22, migration + fixture

**Files:**

- Modify: `packages/core/src/common/types/common.ts:6` (version) and `:96-101` (meta schema)
- Modify: `packages/core/src/common/types/common.test.ts:43-56,126` (version references) + add note test
- Create: `packages/core/src/common/util/migration/migrations/migrateToV22.ts`
- Modify: `packages/core/src/common/util/migration/migrations/index.ts:19` (add export)
- Modify: `packages/core/src/common/util/migration/migration.ts` (import + `MIGRATIONS` entry)
- Create: `packages/core/src/common/util/migration/data-formats/22.json` (copy of `21.json`, version `22`)
- Modify: `packages/core/src/common/util/migration/migration.test.ts` (add `migrateToV22` block)
- Generated (commit it): `packages/core/src/common/util/migration/schemas/22.json` (written by `storeLatestSchema()` on test run)

**Interfaces:**

- Produces: `DataEntry['meta']` now includes optional `note?: string`. `currentVersion === '22'`. `migrateToV22(json) => ExperimentType` (no-op version bump).

- [ ] **Step 1: Write the failing tests (schema + version)**

In `packages/core/src/common/types/common.test.ts`, update the existing version-pinned assertions and add a note test. Change the describe title and the three `'21'` occurrences:

```typescript
// line 43: rename the describe
describe('score function schema (v22)', () => {
  it('currentVersion is 22', () => {
    expect(currentVersion).toBe('22')
  })
```

Change the two experiment literals' `dataFormatVersion: '21',` (at ~line 56 and ~line 126) to:

```typescript
        dataFormatVersion: '22',
```

Then add this new describe block at the end of the file (uses `emptyExperiment`, already imported, so it stays version-agnostic):

```typescript
describe('data point note (v22)', () => {
  it('accepts a dataEntry with a note in meta', () => {
    const withNote = {
      ...emptyExperiment,
      dataPoints: [
        {
          meta: { id: 1, enabled: true, valid: true, note: 'measured twice' },
          data: [],
        },
      ],
    }
    const parsed = experimentSchema.safeParse(withNote)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.dataPoints[0]?.meta.note).toBe('measured twice')
    }
  })

  it('still accepts a dataEntry without a note', () => {
    const withoutNote = {
      ...emptyExperiment,
      dataPoints: [{ meta: { id: 1, enabled: true, valid: true }, data: [] }],
    }
    expect(experimentSchema.safeParse(withoutNote).success).toBe(true)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd packages/core && npx vitest run src/common/types/common.test.ts`
Expected: FAIL — `currentVersion is 22` expects `'22'` but gets `'21'`; the two experiment literals now fail `experimentSchema` (literal mismatch `'22'` vs `'21'`). The note test may also fail once the version compiles.

- [ ] **Step 3: Bump the version and add the `note` field**

In `packages/core/src/common/types/common.ts`, line 6:

```typescript
export const currentVersion = '22'
```

And extend `dataEntryMetaDataSchema` (lines 96-101) with `note`:

```typescript
const dataEntryMetaDataSchema = z.object({
  id: z.coerce.number().prefault(0),
  enabled: z.coerce.boolean().prefault(true),
  valid: z.coerce.boolean().prefault(true),
  description: z.optional(z.string()),
  note: z.optional(z.string()),
})
```

- [ ] **Step 4: Add the migration, register it, and create the fixture**

Create `packages/core/src/common/util/migration/migrations/migrateToV22.ts`:

```typescript
import { ExperimentType } from '@core/common/types'
import { produce } from 'immer'

// v22 adds an optional per-data-point note (dataEntry.meta.note). It is
// optional, so no data transform is needed — existing experiments validate
// as-is once the version literal is bumped.
export const migrateToV22 = (json: ExperimentType): ExperimentType =>
  produce(json, (draft: { info: { dataFormatVersion: string } }) => {
    draft.info.dataFormatVersion = '22'
  })
```

Add to `packages/core/src/common/util/migration/migrations/index.ts` (after line 19):

```typescript
export { migrateToV22 } from './migrateToV22'
```

In `packages/core/src/common/util/migration/migration.ts`, add `migrateToV22` to the import block from `'./migrations'` (after `migrateToV21,`) and append to the `MIGRATIONS` array (after the `'21'` entry):

```typescript
  { version: '22', converter: migrateToV22 },
```

Create the fixture by copying `21.json` and bumping its version:

```bash
cd packages/core/src/common/util/migration/data-formats && cp 21.json 22.json
```

Then edit `data-formats/22.json` line 6, changing `"dataFormatVersion": "21",` to:

```json
    "dataFormatVersion": "22",
```

- [ ] **Step 5: Add the `migrateToV22` unit test**

In `packages/core/src/common/util/migration/migration.test.ts`, add the import near the other migration imports:

```typescript
import { migrateToV22 } from './migrations/migrateToV22'
```

And append this describe block at the end of the file (mirrors the existing `migrateToV21` block):

```typescript
describe('migrateToV22', () => {
  it('bumps dataFormatVersion to 22 and preserves data', () => {
    const v21 = {
      info: { dataFormatVersion: '21', name: 'n' },
      scoreVariables: [
        {
          name: 'quality',
          label: 'Quality (0-5)',
          description: '',
          enabled: true,
        },
      ],
      dataPoints: [
        {
          meta: { id: 1, enabled: true, valid: true },
          data: [{ type: 'score', name: 'quality', value: 2 }],
        },
      ],
    }
    const v22 = migrateToV22(v21 as never)
    expect(v22.info.dataFormatVersion).toBe('22')
    expect(v22.scoreVariables).toEqual(v21.scoreVariables)
    expect(v22.dataPoints).toEqual(v21.dataPoints)
  })
})
```

- [ ] **Step 6: Run the full core test suite to verify it passes**

Run: `cd packages/core && npm test -- run`
Expected: PASS. Note `storeLatestSchema()` writes `schemas/22.json` during the migration test — this generated file must be committed.

- [ ] **Step 7: Commit**

```bash
cd packages/core
git add src/common/types/common.ts src/common/types/common.test.ts \
  src/common/util/migration/migrations/migrateToV22.ts \
  src/common/util/migration/migrations/index.ts \
  src/common/util/migration/migration.ts \
  src/common/util/migration/migration.test.ts \
  src/common/util/migration/data-formats/22.json \
  src/common/util/migration/schemas/22.json
git commit -m "feat(core): add optional note to data-point meta (data format v22)"
```

---

### Task 2: UI — thread `note` through the view-model and state hook

**Files:**

- Modify: `packages/ui/src/features/core/editable-table/types.ts:12-26` (`TableDataRow`)
- Modify: `packages/ui/src/features/data-points/useDataPoints.ts:153-157` (`convertToDataEntry`), `:186-206` (`_editRow`), `:393-402` (`buildRows`)
- Modify: `packages/ui/src/features/data-points/useDataPoints.test.ts` (add note tests)

**Interfaces:**

- Consumes: `DataEntry['meta'].note` (Task 1).
- Produces: `TableDataRow.note?: string`. `useDataPoints().editRow(i, row)` persists `row.note` to `meta.note`; `useDataPoints().state.rows[i].note` reflects `meta.note`.

- [ ] **Step 1: Write the failing tests**

Add to `packages/ui/src/features/data-points/useDataPoints.test.ts` a new describe block (uses `renderHook`, already imported):

```typescript
describe('note', () => {
  it('persists a row note into meta.note on edit', () => {
    const original = [{ meta: { id: 1, enabled: true, valid: true }, data: [] }]
    const { result } = renderHook(() => useDataPoints([], [], [], original))
    const edited = result.current.editRow(0, {
      isNew: false,
      metaId: 1,
      enabled: true,
      valid: true,
      note: 'measured twice',
      dataPoints: [],
    })
    expect(edited[0]?.meta.note).toBe('measured twice')
  })

  it('clears meta.note when the row note is empty', () => {
    const original = [
      {
        meta: { id: 1, enabled: true, valid: true, note: 'old' },
        data: [],
      },
    ]
    const { result } = renderHook(() => useDataPoints([], [], [], original))
    const edited = result.current.editRow(0, {
      isNew: false,
      metaId: 1,
      enabled: true,
      valid: true,
      note: '',
      dataPoints: [],
    })
    expect(edited[0]?.meta.note).toBeUndefined()
  })

  it('exposes meta.note as row.note when building rows', () => {
    const { result } = renderHook(() =>
      useDataPoints(
        [],
        [],
        [],
        [
          {
            meta: { id: 1, enabled: true, valid: true, note: 'hello' },
            data: [],
          },
        ]
      )
    )
    expect(result.current.state.rows[0]?.note).toBe('hello')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd packages/ui && npx vitest run src/features/data-points/useDataPoints.test.ts`
Expected: FAIL — `edited[0].meta.note` is `undefined`; `rows[0].note` is `undefined` (and TS errors on the unknown `note` property until Step 3).

- [ ] **Step 3: Add `note` to `TableDataRow`**

In `packages/ui/src/features/core/editable-table/types.ts`, add `note` to `TableDataRow` (after `metaId?: number` on line 17):

```typescript
export type TableDataRow = {
  dataPoints: TableDataPoint[]
  isNew: boolean
  enabled?: boolean
  valid?: boolean
  metaId?: number
  note?: string
  scoreFunctions?: {
    scoreName: string
    label: string
    hasFunction: boolean
    useFunction: boolean
    responseVars: { symbol: string; name: string }[]
    values: Record<string, string>
  }[]
}
```

- [ ] **Step 4: Thread `note` through `useDataPoints.ts`**

In `convertToDataEntry`, replace the `meta` literal (lines 153-157) with one that includes `note` only when non-empty:

```typescript
const meta = {
  enabled: row.enabled ?? true,
  id: row.metaId ?? 0,
  valid: row.valid ?? true,
  ...(row.note !== undefined && row.note !== '' ? { note: row.note } : {}),
} satisfies DataEntry['meta']
```

In `_editRow`, carry the note onto the original row's meta. After line 191 (`originalRow.meta.id = row.meta.id ?? originalRow.meta.id`), add:

```typescript
originalRow.meta.note = row.meta.note
```

In `buildRows`, add `note` to the returned row object (inside the `return { ... } satisfies TableDataRow` at lines 393-402), after `metaId: item.meta.id,`:

```typescript
        note: item.meta.note,
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd packages/ui && npx vitest run src/features/data-points/useDataPoints.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd packages/ui
git add src/features/core/editable-table/types.ts \
  src/features/data-points/useDataPoints.ts \
  src/features/data-points/useDataPoints.test.ts
git commit -m "feat(ui): thread data-point note through view-model and state hook"
```

---

### Task 3: UI — Note section in the data-point editor

**Files:**

- Modify: `packages/ui/src/features/core/editable-table/editable-table-expanded-row.tsx`
- Modify: `packages/ui/src/features/core/editable-table/editable-table-expanded-row.test.tsx`

**Interfaces:**

- Consumes: `TableDataRow.note` (Task 2), existing `onSave`/`onAdd` callbacks.
- Produces: an "Add note here" input that writes `editedRow.note` and is saved through the existing Save button.

- [ ] **Step 1: Write the failing tests**

Add to `packages/ui/src/features/core/editable-table/editable-table-expanded-row.test.tsx` a new describe block (`render`, `screen`, `fireEvent` already imported; reuses the top-level `row` fixture):

```typescript
describe('EditableTableExpandedRow NOTE section', () => {
  it('renders the note input and prefills an existing note', () => {
    render(
      <table>
        <tbody>
          <EditableTableExpandedRow
            colSpan={3}
            rowId={2}
            tableRow={{ ...row, note: 'existing note' }}
            setExpanded={() => {}}
            onAdd={() => {}}
            onSave={() => {}}
          />
        </tbody>
      </table>
    )
    expect(screen.getByText('Note')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Add note here')).toHaveValue(
      'existing note'
    )
  })

  it('saves an edited note through onSave', () => {
    let saved: { note?: string } | undefined
    render(
      <table>
        <tbody>
          <EditableTableExpandedRow
            colSpan={3}
            rowId={2}
            tableRow={row}
            setExpanded={() => {}}
            onAdd={() => {}}
            onSave={r => {
              saved = r
            }}
          />
        </tbody>
      </table>
    )
    fireEvent.change(screen.getByPlaceholderText('Add note here'), {
      target: { value: 'forgot the red button' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(saved?.note).toBe('forgot the red button')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd packages/ui && npx vitest run src/features/core/editable-table/editable-table-expanded-row.test.tsx`
Expected: FAIL — no element with text "Note", no placeholder "Add note here".

- [ ] **Step 3: Add the note handler and the Note section**

In `editable-table-expanded-row.tsx`, add a handler after `handleToggleUseFunction` (after line 89):

```typescript
const handleNoteEdit = (value: string) => {
  setEditedRow({
    ...editedRow,
    note: value === '' ? undefined : value,
  })
}
```

Then add the Note section immediately after the `responseObjectives.length > 0 && (...)` block (after line 234, before the `violations` block). `TextField` and `Box` are already imported:

```tsx
<Box sx={{ mt: 2 }}>
  <Box sx={{ fontWeight: 'bold', mb: 1 }}>Note</Box>
  <TextField
    fullWidth
    multiline
    minRows={2}
    size="small"
    placeholder="Add note here"
    value={editedRow.note ?? ''}
    onChange={e => handleNoteEdit(e.target.value)}
    slotProps={{ htmlInput: { 'aria-label': 'Note' } }}
  />
</Box>
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd packages/ui && npx vitest run src/features/core/editable-table/editable-table-expanded-row.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd packages/ui
git add src/features/core/editable-table/editable-table-expanded-row.tsx \
  src/features/core/editable-table/editable-table-expanded-row.test.tsx
git commit -m "feat(ui): add Note section to the data-point editor"
```

---

### Task 4: UI — note indicator icon in the data-points table

**Files:**

- Modify: `packages/ui/src/features/core/editable-table/editable-table-collapsed-row.tsx`
- Create: `packages/ui/src/features/core/editable-table/editable-table-collapsed-row.test.tsx`

**Interfaces:**

- Consumes: `TableDataRow.note` (Task 2).
- Produces: a `DescriptionOutlined` icon (aria-label = the truncated note) shown left of the Edit icon only when a note exists; tooltip = note truncated to 60 chars + `…`.

- [ ] **Step 1: Write the failing tests (new file)**

Create `packages/ui/src/features/core/editable-table/editable-table-collapsed-row.test.tsx`:

```tsx
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { EditableTableCollapsedRow } from './editable-table-collapsed-row'
import type { TableDataRow } from './types'

afterEach(() => cleanup())

const baseRow: TableDataRow = {
  isNew: false,
  enabled: true,
  valid: true,
  metaId: 1,
  dataPoints: [{ name: 'A', value: '1', type: 'numeric' }],
}

const renderRow = (tableRow: TableDataRow) =>
  render(
    <table>
      <tbody>
        <EditableTableCollapsedRow
          colSpan={4}
          rowId={1}
          tableRow={tableRow}
          setExpanded={() => {}}
          onEnabledToggled={() => {}}
          onSelected={() => {}}
          isSelectionExists={false}
          isSelected={false}
        />
      </tbody>
    </table>
  )

describe('EditableTableCollapsedRow note indicator', () => {
  it('shows a note icon with the note as its label when a note exists', () => {
    renderRow({ ...baseRow, note: 'Seemed fine.' })
    expect(screen.getByLabelText('Seemed fine.')).toBeInTheDocument()
  })

  it('truncates a long note to 60 chars plus an ellipsis', () => {
    const long = 'x'.repeat(80)
    renderRow({ ...baseRow, note: long })
    const expected = `${'x'.repeat(60)}…`
    expect(screen.getByLabelText(expected)).toBeInTheDocument()
  })

  it('renders no note icon when there is no note', () => {
    renderRow(baseRow)
    expect(screen.queryByTestId('note-indicator')).toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd packages/ui && npx vitest run src/features/core/editable-table/editable-table-collapsed-row.test.tsx`
Expected: FAIL — no element labelled with the note; `note-indicator` testid not found.

- [ ] **Step 3: Add the truncation helper and the note icon**

In `editable-table-collapsed-row.tsx`, extend the icon import (line 13) to include `DescriptionOutlined`:

```typescript
import { Add, DescriptionOutlined, Edit } from '@mui/icons-material'
```

Add a module-level helper above the component (after the imports, before `interface EditableTableCollapsedRowProps`):

```typescript
const NOTE_TOOLTIP_MAX = 60
const truncateNote = (note: string) =>
  note.length > NOTE_TOOLTIP_MAX ? `${note.slice(0, NOTE_TOOLTIP_MAX)}…` : note
```

Then, inside `<div className={classes.buttonContainer}>` (line 117), insert the note indicator as the first child, immediately before the Edit `<Tooltip>` (line 118):

```tsx
{
  tableRow.note !== undefined && tableRow.note !== '' && (
    <Tooltip disableInteractive title={truncateNote(tableRow.note)}>
      <span
        data-testid="note-indicator"
        aria-label={truncateNote(tableRow.note)}
        style={{ display: 'inline-flex', alignItems: 'center' }}
      >
        <DescriptionOutlined fontSize="small" color="primary" />
      </span>
    </Tooltip>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd packages/ui && npx vitest run src/features/core/editable-table/editable-table-collapsed-row.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd packages/ui
git add src/features/core/editable-table/editable-table-collapsed-row.tsx \
  src/features/core/editable-table/editable-table-collapsed-row.test.tsx
git commit -m "feat(ui): show a note indicator icon in the data-points table"
```

---

### Task 5: Core — CSV round-trip for the note

**Files:**

- Modify: `packages/core/src/common/util/converters/converters.ts:270-290` (`convertToMetaData`)
- Modify: `packages/core/src/common/util/converters/converters.test.ts`

**Interfaces:**

- Consumes: `DataEntry['meta'].note` (Task 1).
- Produces: `dataPointsToCSV` emits a `note` column (already automatic); `csvToDataPoints` parses `note` back into `meta.note`, dropping empty values.

- [ ] **Step 1: Write the failing tests**

Add to `packages/core/src/common/util/converters/converters.test.ts`, inside the existing `describe('converters', ...)` block, a new describe (`dataPointsToCSV` and `csvToDataPoints` are already imported at the top):

```typescript
describe('note round-trip', () => {
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

  it('writes the note as a meta column in CSV', () => {
    const csv = dataPointsToCSV([
      {
        meta: { id: 1, enabled: true, valid: true, note: 'seemed fine' },
        data: [{ type: 'numeric', name: 'A', value: 1 }],
      },
    ])
    expect(csv).toContain('note')
    expect(csv).toContain('seemed fine')
  })

  it('parses the note back from CSV', () => {
    const csv = 'id;A;enabled;valid;note\n1;1;true;true;seemed fine'
    const actual = csvToDataPoints(csv, valueVars, [], [])
    expect(actual[0]?.meta.note).toBe('seemed fine')
  })

  it('round-trips a note through export and import', () => {
    const input = [
      {
        meta: { id: 1, enabled: true, valid: true, note: 'seemed fine' },
        data: [{ type: 'numeric' as const, name: 'A', value: 1 }],
      },
    ]
    const back = csvToDataPoints(dataPointsToCSV(input), valueVars, [], [])
    expect(back[0]?.meta.note).toBe('seemed fine')
  })

  it('does not set a note when the CSV note column is empty', () => {
    const csv = 'id;A;enabled;valid;note\n1;1;true;true;'
    const actual = csvToDataPoints(csv, valueVars, [], [])
    expect(actual[0]?.meta.note).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd packages/core && npx vitest run src/common/util/converters/converters.test.ts`
Expected: FAIL on the empty-note case — the raw spread leaves `meta.note === ''` instead of `undefined`. (The write/parse cases may already pass via the existing `...parsedMeta` spread; the fix makes the behaviour explicit and normalizes empty notes.)

- [ ] **Step 3: Normalize the note in `convertToMetaData`**

In `converters.ts`, in `convertToMetaData` (lines 270-290), after building `result` (after line 288, before `return result`), drop an empty/absent note so it is not persisted as `''`:

```typescript
if (result.note === '' || result.note === undefined) {
  delete result.note
}
return result
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd packages/core && npx vitest run src/common/util/converters/converters.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd packages/core
git add src/common/util/converters/converters.ts \
  src/common/util/converters/converters.test.ts
git commit -m "feat(core): round-trip data-point note through CSV import"
```

---

### Task 6: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Build + test both packages**

Run:

```bash
cd packages/core && npm test -- run && npm run build
cd ../ui && npm test -- run && npm run build
```

Expected: all tests PASS, both builds succeed (no TS errors).

- [ ] **Step 2: Visual/manual check (optional but recommended)**

Follow the repo's inspection harness or the full-stack-verify skill: add a note to a data point in the editor, save, confirm the note icon appears left of the edit/enable icons and its tooltip shows the (truncated) note; export CSV and re-import, confirming the note survives.

---

## Notes for the implementer

- Do not hand-format; the pre-commit hook runs prettier/eslint and will reformat staged files. If it reformats on commit, that is expected — re-stage if needed.
- The `schemas/22.json` file in Task 1 is generated by the test run (`storeLatestSchema()`), not written by hand — remember to `git add` it.
- No new reducer action is introduced; the note rides the existing `updateDataPoints` flow, which re-parses the payload against `experimentSchema` (now note-aware from Task 1).
