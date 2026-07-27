# Design: Notes on data points

**Date:** 2026-07-27
**Branch:** `add-notes` (branched from `add-quality-function`)
**Repo:** `process-optimizer-frontend`

## Summary

Add a free-text **note** to each data point so a user can record something
about the measurement (e.g. "Forgot to press the red button. Seemed fine.").
The note is entered in the data-point editor via an "Add note here" input, and
data points that have a note show a small note icon in the data-points table,
just to the left of the edit and enable/disable icons. Hovering the icon shows
the note text (truncated with an ellipsis if long).

## Decisions

- **New field, not the existing `description`.** The `meta` object already has
  an unused optional `description: string`. We add a distinct
  `note: z.optional(z.string())` rather than repurpose `description`, so intent
  is explicit.
- **Full CSV round-trip.** The note survives CSV export → import (lossless),
  not JSON-only.
- **Judgment calls (adjustable):** multiline note input (~2 rows); tooltip shows
  the first 60 characters of the note plus `…` if longer; table icon is MUI
  `DescriptionOutlined` styled like the other primary/orange action icons.

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

- `converters.ts` export already writes all `meta` keys via
  `Object.entries(line.meta)` — no change needed for export.
- Add `note` handling to the import parser `convertToMetaData`
  (`converters.ts:270`) so a note written to CSV is read back.

## Editor UI — the "Note" section

File: `packages/ui/src/features/core/editable-table/editable-table-expanded-row.tsx`

- Below the Response section, add a bold **Note** header (mirroring the
  `Response` header at line 186) and a full-width MUI `TextField` with
  placeholder **"Add note here"**, multiline (~2 rows). `TextField` is already
  imported.
- Add a `handleNoteEdit` handler: `setEditedRow(r => ({ ...r, note: value }))`,
  matching the existing `handleEdit` pattern.
- Saved via the existing `onSave` / `onAdd(editedRow)` path — no new reducer
  action.

## Table UI — the note icon

File: `packages/ui/src/features/core/editable-table/editable-table-collapsed-row.tsx`

- In the `editCell` action group (`lines 116-155`), insert the note indicator
  **just before** the Edit (pencil) `Tooltip` at line 118. Resulting order:
  **note · edit · enable/disable**.
- Render **only when the row has a non-empty note**.
- Wrap in MUI `<Tooltip disableInteractive>` (house convention) with title =
  first 60 chars of the note + `…` if longer.
- Glyph: `DescriptionOutlined` from `@mui/icons-material`, styled like the other
  primary/orange action icons. It is an indicator, not a button — no
  `IconButton`/`onClick`.

## State threading (`packages/ui`, no new reducer action)

The note rides the existing bulk `updateDataPoints` flow. Spots to update:

- `editable-table/types.ts` — add `note?: string` to `TableDataRow`.
- `features/data-points/useDataPoints.ts`:
  - `convertToDataEntry` (~line 153) — write `note: row.note` into the built
    `meta`.
  - `_editRow` (~line 186) — carry `note` onto `originalRow.meta` on edit.
  - `buildRows` (~line 393) — read `note: item.meta.note` from `DataEntry` into
    the `TableDataRow`.

## Testing (TDD)

- **core**
  - `common.test.ts` — schema accepts `note` on `meta`.
  - `converters.test.ts` (+ snapshot) — CSV export/import round-trips the note.
  - migration fuzz-test (`migration.test.ts`) picks up `22.json` automatically.
- **ui**
  - `editable-table-expanded-row.test.tsx` — Note input renders, edits, and
    saves the note.
  - `useDataPoints.test.ts` — note threads through `meta` on add/edit/build.
  - New small test for the collapsed-row note icon: shown only with a note,
    tooltip shows truncated text.

## Out of scope

- No search/filter by note, no per-note reducer action, no rich text.
