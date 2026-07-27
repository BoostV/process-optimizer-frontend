# Design: Notes on data points

**Date:** 2026-07-27
**Branch:** `add-notes` (branched from `add-quality-function`)
**Repo:** `process-optimizer-frontend`

## Summary

Add a free-text **note** to each data point so a user can record something
about the measurement (e.g. "Forgot to press the red button. Seemed fine.").
The note is entered in the data-point editor via an "Add note here" input, and
data points that have a note show a small note icon-button in the data-points
table, just to the left of the edit and enable/disable icons. Hovering the icon
shows the note text (truncated with an ellipsis if long); clicking it opens an
inline-editing popover (save / cancel / delete) so an existing note can be
edited without opening the full editor.

## Decisions

- **New field, not the existing `description`.** The `meta` object already has
  an unused optional `description: string`. We add a distinct
  `note: z.optional(z.string())` rather than repurpose `description`, so intent
  is explicit.
- **Full CSV round-trip.** The note survives CSV export → import (lossless),
  not JSON-only.
- **Single-line inputs.** Both the editor input and the inline popover input are
  single-line (no line breaks), so the two can never disagree on formatting.
- **Tooltip length:** the table tooltip shows the first 100 characters of the
  note plus `…` if longer (`NOTE_TOOLTIP_MAX`, easily adjustable).
- **Table affordance:** MUI `DescriptionOutlined` in an `IconButton` styled like
  the neighbouring edit button; rendered only for rows that already have a note.

## Data model (`packages/core`)

- Add `note: z.optional(z.string())` to `dataEntryMetaDataSchema`
  (`src/common/types/common.ts:96`), after `description`. Optional → existing
  JSON remains valid.
- Bump `currentVersion` `'21' → '22'` (`common.ts:6`). `infoSchema` pins the
  version as a `z.literal`, so a bump is mandatory even with no data transform.
- Add `migrateToV22.ts` — a no-op copy of `migrateToV21` that stamps
  `draft.info.dataFormatVersion = '22'`. Register it in
  `.../migration/migrations/index.ts`, and add a `.../migration/data-formats/22.json`
  fixture so the migration fuzz-test passes.

## CSV round-trip (`packages/core`)

- `converters.ts` export writes all `meta` keys. It must emit each row's meta
  values in the **header (union) order**, not the row's own key order — rows can
  carry different optional meta keys (`note` vs `description`), and a positional
  dump would misalign columns on re-import.
- Add `note` handling to the import parser `convertToMetaData`
  (`converters.ts:270`) so a note written to CSV is read back, dropping an
  empty note rather than persisting `''`.

## Editor UI — the "Note" section

File: `packages/ui/src/features/core/editable-table/editable-table-expanded-row.tsx`

- Below the Response section, a bold **Note** header (mirroring the `Response`
  header) and a **full-width, single-line** MUI `TextField` with placeholder
  **"Add note here"**.
- A `handleNoteEdit` handler that clears the note to `undefined` on empty input
  (`value === '' ? undefined : value`), so an untouched-then-cleared row stays
  deep-equal to its original.
- Saved via the existing `onSave` / `onAdd(editedRow)` path — no new reducer
  action.

## Table UI — the note icon-button + inline editing

File: `packages/ui/src/features/core/editable-table/editable-table-collapsed-row.tsx`

- In the `editCell` action group, insert the note button **before** the Edit
  (pencil) button. Resulting order: **note · edit · enable/disable**.
- Render **only when the row has a non-empty note**.
- MUI `DescriptionOutlined` inside an `IconButton` styled like the neighbouring
  edit button, wrapped in `<Tooltip disableInteractive>` whose title is the note
  truncated to `NOTE_TOOLTIP_MAX` (100) chars + `…`.
- **Click opens an inline-editing MUI `Popover`** anchored to the button, with a
  single-line `TextField` prefilled with the note and three small primary
  `IconButton`s: **✓ Save**, **⊗ Cancel**, **🗑 Delete**.
  - Save persists the draft (empty ⇒ clears); Delete removes the note (button
    then disappears); Cancel / click-away discards. Local component state only.
  - Because the button only exists for rows that already have a note, the
    popover **edits/deletes**; adding a note to a note-less row is done in the
    full editor.

## State threading (`packages/ui`, no new reducer action)

The note rides the existing bulk `updateDataPoints` flow. Spots to update:

- `editable-table/types.ts` — add `note?: string` to `TableDataRow`.
- `features/data-points/useDataPoints.ts`:
  - `convertToDataEntry` — write `note: row.note` into the built `meta` (omit
    when empty/undefined).
  - `_editRow` — carry `note` onto `originalRow.meta` on edit.
  - `buildRows` — read `note: item.meta.note` from `DataEntry` into `TableDataRow`.
  - `setNote(rowIndex, note)` — a minimal immer updater for inline save/delete,
    parallel to `setEnabledState` (avoids rebuilding data/responses for a
    note-only change).
- Inline save/delete is threaded from `data-points.tsx` down through
  `editable-table.tsx` → `editable-table-row.tsx` →
  `editable-table-collapsed-row.tsx` via an `onRowNoteChanged` /
  `onNoteChanged` callback, mirroring the existing `onEnabledToggled` path.
  Persistence stays in `data-points.tsx` (`onUpdateDataPoints`).

## Testing (TDD)

- **core**
  - `common.test.ts` — schema accepts `note` on `meta`.
  - `converters.test.ts` (+ snapshot) — CSV export/import round-trips the note.
  - migration fuzz-test (`migration.test.ts`) picks up `22.json` automatically.
  - `converters.test.ts` — also asserts meta columns stay aligned when rows
    have different optional meta keys (`note` vs `description`).
- **ui**
  - `editable-table-expanded-row.test.tsx` — Note input renders, edits, and
    saves the note.
  - `useDataPoints.test.ts` — note threads through `meta` on add/edit/build;
    `setNote` sets/clears `meta.note`.
  - `editable-table-collapsed-row.test.tsx` — note button shown only with a
    note, tooltip truncates; popover opens prefilled and Save/Cancel/Delete
    call `onNoteChanged` correctly.

## Out of scope

- No search/filter by note, no per-note reducer action, no rich text.
