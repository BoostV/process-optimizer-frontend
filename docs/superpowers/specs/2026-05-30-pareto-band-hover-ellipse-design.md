# Pareto plot: band-always view with hover ellipse

**Date:** 2026-05-30
**Branch:** pareto-plot
**Status:** Approved (design)

## Problem

The Pareto front plot currently exposes two mutually exclusive uncertainty
visualizations behind a mode toggle:

- `band` — continuous green (quality) + tan (cost) ribbons along the whole front.
- `ellipses` — ~10 sampled 95% confidence ellipses drawn statically along the front.

The toggle forces an either/or choice. The band gives the best at-a-glance read
of global front reliability, while a confidence ellipse is most useful when the
user is evaluating one specific trade-off point. Showing 10 static ellipses
clutters the chart; showing none loses the per-point joint-uncertainty signal.

## Goal

Make the uncertainty **band the only persistent view**, and surface the 95%
confidence **ellipse for a single front point on hover** — combining the global
band with on-demand per-point joint uncertainty, and removing the mode toggle.

## Decisions

- **Ellipse trigger:** hovered point only. The ellipse tracks the cursor's
  nearest front point and clears on mouse-leave. No persistent ellipse on the
  selected (blue) point.
- **Mode toggle:** removed entirely — selector UI, props, and exports deleted.
  Band is hardcoded.
- **`ConfidenceEllipses` component:** kept and reused. It already accepts
  `ellipseIndices: number[]`; the hover passes `[hoverIndex]` instead of 10
  sampled indices. No new ellipse-drawing code.

## Changes

### 1. `packages/plots/src/pareto-front-plot/pareto-front-plot.tsx`

- Remove the `paretoVisualizationModes` const, the `ParetoVisualizationMode`
  type, and the `visualizationMode` / `visualizationModeSelector` props.
- Band always renders: drop the `visualizationMode === 'band'` guard around
  `QualityUncertaintyBand` + the cost `<Area>`. The `bandX`/`bandY` domain
  inputs become unconditional (only one mode now, so no rescale-on-switch
  concern), keeping the band inside the axes.
- Remove the `ELLIPSE_COUNT` / `ellipseIndices` static sampling logic.
- Replace the static ellipse block with a hover-driven one:
  `{hoverIndex !== null && <Customized component={() => <ConfidenceEllipses
ellipseIndices={[hoverIndex]} frontYData=… obj1Error=… obj2Error=… xDomain=…
yDomain=… />} />}`. Place it after the band and before the scatters/line so the
  front and dots draw on top of the ellipse.
- Legend: always show the two band items (cost/quality). Replace the
  mode-conditional "95% credible region" swatch with a single always-present
  ellipse swatch labelled **"95% credible region (hover a point)"** so the
  ellipse is discoverable.

### 2. `packages/plots/src/pareto-front-plot/hover-overlay.tsx`

- **Unchanged.** It continues to own pointer capture, the guide line, snapped
  dot, label, and `hoverIndex` updates. The ellipse is a separate `<Customized>`
  layer in the parent keyed off the same `hoverIndex`.

### 3. `packages/plots/src/pareto-front-plot/overlays/confidence-ellipses.tsx`

- **Kept unchanged** and reused for the single hovered ellipse.

### 4. `packages/plots/src/pareto-front-plot/index.ts`

- Remove the `paretoVisualizationModes` / `ParetoVisualizationMode` re-exports.

### 5. `packages/ui/src/features/multi-objective/result.tsx`

- Remove the `paretoVisualizationModes` / `ParetoVisualizationMode` imports, the
  `paretoVizMode` `useState`, and the `visualizationMode` +
  `visualizationModeSelector` props on `<ParetoFrontPlot>`.
- Drop the now-unused `Select`, `MenuItem`, and `useState` imports.

## Out of scope

- No backend or data-shape changes; `obj1_error` / `obj2_error` are consumed as
  today.
- No persistent selected-point ellipse.
- No change to the band overlay internals or domain-clamp behavior.

## Testing

- Rebuild the plots package.
- `npm run dev:app` → load the Multi Objective sample: band renders by default,
  no mode selector present, no console errors.
- Hover a front point: exactly one ellipse appears at the snapped point, tracks
  the cursor, and clears on mouse-leave. Guide line / dot / label behave as before.
- Load the multi experiment in brownie-bee against the running backend and
  confirm the same.
- Single-objective experiments unaffected (no Pareto plot rendered).
