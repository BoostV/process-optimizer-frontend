# Pareto Band-Always View with Hover Ellipse — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the uncertainty band the only persistent Pareto view and show the 95% confidence ellipse for one front point on hover, removing the mode toggle.

**Architecture:** View-layer only. The band overlays always render. The existing `ConfidenceEllipses` `<Customized>` component is reused but driven by `hoverIndex` (passing `[hoverIndex]`) instead of 10 static sampled indices. `HoverOverlay` is unchanged — it still owns pointer capture and `hoverIndex`. The `visualizationMode` machinery (prop, selector, exports, consumer state) is deleted.

**Tech Stack:** React 19, Recharts v3 (`Customized`, `usePlotArea`), TypeScript, Vite, MUI (consumer).

> **Commit policy for this plan:** The user has a standing instruction _"don't commit until I tell you."_ Every "Commit" step below is therefore **stage-only** (`git add`, no `git commit`). Do not run `git commit` unless the user lifts the hold.

> **Testing note:** The `plots` package has no test runner and no SVG/hover rendering harness; `result.tsx` changes are pure prop/import removal. Verification is therefore the TypeScript build (catches removed exports/props and unused imports) plus a manual hover check in the running app. There are no unit tests to add for this change.

---

## File Structure

- **Modify** `packages/plots/src/pareto-front-plot/pareto-front-plot.tsx` — remove mode machinery; band always on; hover-driven single ellipse; legend update.
- **Modify** `packages/plots/src/pareto-front-plot/index.ts` — drop the two mode re-exports.
- **Modify** `packages/ui/src/features/multi-objective/result.tsx` — drop mode state/imports/props.
- **Unchanged (reused as-is):** `packages/plots/src/pareto-front-plot/overlays/confidence-ellipses.tsx`, `packages/plots/src/pareto-front-plot/hover-overlay.tsx`.

---

## Task 1: Band-always + hover ellipse in `pareto-front-plot.tsx`

**Files:**

- Modify: `packages/plots/src/pareto-front-plot/pareto-front-plot.tsx`

- [ ] **Step 1: Remove the mode const and type export (lines 24–32)**

Delete this block entirely:

```tsx
// Available uncertainty visualization modes for the Pareto plot.
// Exported so parent components can drive a mode selector UI.
export const paretoVisualizationModes = [
  { id: 'ellipses', label: 'Confidence ellipses' },
  { id: 'band', label: 'Uncertainty band' },
] as const

export type ParetoVisualizationMode =
  (typeof paretoVisualizationModes)[number]['id']
```

The `import { ConfidenceEllipses } from './overlays/confidence-ellipses'` line stays — the component is reused.

- [ ] **Step 2: Remove the two mode props from the `Props` type**

Delete these two lines from the `Props` type (currently lines 47–48):

```tsx
  visualizationMode?: ParetoVisualizationMode
  visualizationModeSelector?: ReactNode
```

- [ ] **Step 3: Remove the two mode params from the function signature**

In the destructured params, delete `visualizationMode = 'ellipses',` and `visualizationModeSelector,`. The signature becomes:

```tsx
export default function ParetoFrontPlot({
  indexOfSelected,
  plot,
  dataPoints,
  onSelectIndex,
  onResetToDefault,
  renderControls,
  styles,
}: Props) {
```

- [ ] **Step 4: Make the band domain inputs unconditional**

Replace the mode-gated `bandX`/`bandY` (currently lines 150–157) with:

```tsx
// Band overlays always render now, so their bounds always inform the domain.
const bandX = [
  ...xLowerBoundData.map(d => d.x),
  ...xUpperBoundData.map(d => d.x),
]
const bandY = [
  ...xLowerBoundData.map(d => d.y),
  ...xUpperBoundData.map(d => d.y),
]
```

- [ ] **Step 5: Remove the static ellipse sampling logic**

Delete the `ELLIPSE_COUNT` / `frontLen` / `ellipseIndices` block (currently lines 134–145), including its comment:

```tsx
// Sample ~10 front points to draw 95% confidence ellipses at. ...
const ELLIPSE_COUNT = 10
const frontLen = plot.front_y_data.length
const ellipseIndices =
  frontLen <= ELLIPSE_COUNT
    ? plot.front_y_data.map((_, i) => i)
    : Array.from({ length: ELLIPSE_COUNT }, (_, k) =>
        Math.round((k * (frontLen - 1)) / (ELLIPSE_COUNT - 1))
      )
```

- [ ] **Step 6: Always render the band; replace static ellipse block with hover-driven ellipse**

Replace the whole uncertainty-visualization region (currently lines 242–279: the `{visualizationMode === 'band' && (...)}` fragment and the `{visualizationMode === 'ellipses' && (...)}` block) with:

```tsx
          {/* Uncertainty band — always shown */}
          <Customized
            component={() => (
              <QualityUncertaintyBand
                xLowerBoundData={xLowerBoundData}
                xUpperBoundData={xUpperBoundData}
                xDomain={xDomainT}
                yDomain={yDomainT}
              />
            )}
          />
          <Area
            type="monotone"
            dataKey="uncertaintyY"
            fill="#f6c47e"
            fillOpacity={0.3}
            stroke="none"
            name="UncertaintyY"
            isAnimationActive={false}
          />
          {/* Single 95% confidence ellipse for the hovered front point */}
          {hoverIndex !== null && (
            <Customized
              component={() => (
                <ConfidenceEllipses
                  ellipseIndices={[hoverIndex]}
                  frontYData={plot.front_y_data}
                  obj1Error={plot.obj1_error}
                  obj2Error={plot.obj2_error}
                  xDomain={xDomainT}
                  yDomain={yDomainT}
                />
              )}
            />
          )}
```

Note: `hoverIndex` is already declared (`const [hoverIndex, setHoverIndex] = useState<number | null>(null)`) before the `return`, so it is in scope here.

- [ ] **Step 7: Update the legend — always show band items + hover-ellipse item**

Replace the mode-conditional legend region (currently lines 424–454: the `{visualizationMode === 'ellipses' && (...)}` block and the `{visualizationMode === 'band' && (...)}` block) with this always-rendered markup:

```tsx
          <div className={classes.legendItem}>
            <div
              className={classes.legendColor}
              style={{ background: 'rgba(246, 196, 126, 0.6)' }}
            />
            <span>Uncertainty (cost)</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColor}
              style={{ background: 'rgba(144, 194, 144, 0.6)' }}
            />
            <span>Uncertainty (quality)</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColorCircle}
              style={{
                background: 'rgba(7, 122, 206, 0.08)',
                border: '1px solid rgba(7, 122, 206, 0.5)',
                boxSizing: 'border-box',
              }}
            />
            <span>95% credible region (hover a point)</span>
          </div>
```

- [ ] **Step 8: Drop `visualizationModeSelector` from the controls block**

Replace the bottom controls block (currently lines 456–464) with one gated only on `renderControls`:

```tsx
{
  renderControls && (
    <div className={classes.buttonColumn}>
      {renderControls({
        onToggleFitToFront: () => setFitToFront(f => !f),
        onResetToDefault: () => onResetToDefault?.(),
      })}
    </div>
  )
}
```

- [ ] **Step 9: Remove the now-unused `ReactNode` import if unused**

`ReactNode` was used only by the deleted `visualizationModeSelector` prop and `renderControls`. `renderControls` still returns `ReactNode`, so **keep** the import. Verify by checking line 43 (`renderControls?: (...) => ReactNode`) still references it — it does, so leave `import { ReactNode, useState } from 'react'` unchanged.

- [ ] **Step 10: Typecheck the plots package**

Run: `cd /workspace/packages/plots && npx tsc --noEmit`
Expected: no errors. (If `tsc --noEmit` is not configured, run `npm run build` and expect a clean `tsc` pass before `vite build`.)

- [ ] **Step 11: Stage (commit deferred)**

```bash
git add packages/plots/src/pareto-front-plot/pareto-front-plot.tsx
```

Do NOT `git commit` — the user's commit hold is in effect.

---

## Task 2: Drop mode re-exports from the plots barrel

**Files:**

- Modify: `packages/plots/src/pareto-front-plot/index.ts`

- [ ] **Step 1: Remove the mode re-exports**

Replace the full file contents with:

```ts
export { default as ParetoFrontPlot } from './pareto-front-plot'
```

- [ ] **Step 2: Typecheck**

Run: `cd /workspace/packages/plots && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Stage (commit deferred)**

```bash
git add packages/plots/src/pareto-front-plot/index.ts
```

---

## Task 3: Remove mode wiring from the ui consumer

**Files:**

- Modify: `packages/ui/src/features/multi-objective/result.tsx`

- [ ] **Step 1: Fix the plots import (remove the two mode names)**

Change the import (currently lines 1–6) to:

```tsx
import {
  ParetoFrontPlot,
  OneDData,
} from '@boostv/process-optimizer-frontend-plots'
```

- [ ] **Step 2: Remove the unused MUI + react imports**

`Select` and `MenuItem` were used only by the selector; `useState` only by `paretoVizMode`. Confirm neither is used elsewhere (grep), then:

- Change `import { Box, Button, MenuItem, Select } from '@mui/material'` (line 27) to:
  ```tsx
  import { Box, Button } from '@mui/material'
  ```
- Delete `import { useState } from 'react'` (line 32).

Verify first:

```bash
cd /workspace/packages/ui && grep -nE '\b(Select|MenuItem|useState)\b' src/features/multi-objective/result.tsx
```

Expected after edits: only the lines being removed match; no other usages remain.

- [ ] **Step 3: Remove the `paretoVizMode` state**

Delete (currently lines 97–98):

```tsx
const [paretoVizMode, setParetoVizMode] =
  useState<ParetoVisualizationMode>('ellipses')
```

- [ ] **Step 4: Remove the two mode props from `<ParetoFrontPlot>`**

Delete the `visualizationMode={paretoVizMode}` line and the entire `visualizationModeSelector={ <Select ...> ... </Select> }` prop (currently lines 240–257), leaving the surrounding props (`onResetToDefault`, `styles`) intact:

```tsx
                onResetToDefault={() =>
                  dispatch({ type: 'setSelectedParetoPoint', payload: null })
                }
                styles={styles?.pareto}
              />
```

- [ ] **Step 5: Typecheck + run the ui test suite**

```bash
cd /workspace/packages/ui && npx tsc --noEmit && npm test -- --run
```

Expected: typecheck clean (no unused-import or missing-export errors); existing `result.utils.test.ts` still passes. No new tests are added — the change is prop removal.

- [ ] **Step 6: Stage (commit deferred)**

```bash
git add packages/ui/src/features/multi-objective/result.tsx
```

---

## Task 4: Build the plots package and manually verify in the app

**Files:** none (verification only)

- [ ] **Step 1: Build the plots package so the consumer picks up the change**

Run: `cd /workspace/packages/plots && npm run build`
Expected: clean `tsc` + `vite build`, `dist/` regenerated.

- [ ] **Step 2: Run the demo app**

Run: `cd /workspace && npm run dev:app` (the runnable app target). Open the served URL.

- [ ] **Step 3: Load the Multi Objective sample and verify band-only default**

Use "Load Multi Objective Sample Calculated".
Expected:

- The green (quality) + tan (cost) uncertainty bands render by default.
- **No** visualization-mode selector dropdown is present.
- No console errors.

- [ ] **Step 4: Verify the hover ellipse**

Move the cursor across the front.
Expected:

- Exactly **one** blue 95% confidence ellipse appears, centred on the snapped nearest front point, alongside the existing guide line / dot / label.
- The ellipse tracks the cursor as it moves between points.
- The ellipse disappears on mouse-leave.
- The legend shows "Uncertainty (cost)", "Uncertainty (quality)", and "95% credible region (hover a point)".

- [ ] **Step 5: Cross-check in brownie-bee (optional, if stack is running)**

Open the multi-objective experiment in brownie-bee against the running backend; confirm identical behavior.

- [ ] **Step 6: Confirm single-objective is unaffected**

Load a single-objective sample (e.g. catapult); confirm it still renders its PNG plots and no Pareto plot, with no errors.

---

## Self-Review

**Spec coverage:**

- Band always on → Task 1 Steps 4, 6. ✓
- Hover-only single ellipse reusing `ConfidenceEllipses` → Task 1 Step 6. ✓
- Mode toggle removed (props/exports/consumer) → Task 1 Steps 1–3, 8; Task 2; Task 3. ✓
- `ConfidenceEllipses` and `HoverOverlay` kept unchanged → File Structure + reused in Task 1 Step 6. ✓
- Legend updated → Task 1 Step 7. ✓
- No backend/data-shape change → confirmed, view-layer only. ✓

**Placeholder scan:** No TBD/TODO; every code step shows full replacement code. ✓

**Type consistency:** `ConfidenceEllipses` is called with its existing prop names (`ellipseIndices`, `frontYData`, `obj1Error`, `obj2Error`, `xDomain`, `yDomain`) — matches `overlays/confidence-ellipses.tsx`. `hoverIndex` referenced in Task 1 Step 6 matches the existing `useState<number | null>` declaration. ✓
