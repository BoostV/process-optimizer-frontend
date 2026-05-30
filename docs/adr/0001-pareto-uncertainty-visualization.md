# 0001. Pareto front uncertainty: band view + opt-in hover ellipse

- **Status:** accepted
- **Date:** 2026-05-30
- **Deciders:** Jakob Langdal

## Context

The Pareto front plot (`@boostv/process-optimizer-frontend-plots`) visualises
the model's per-point uncertainty along the front — a quality error
(`obj1_error`) and a cost error (`obj2_error`) at each predicted point.

It originally offered two mutually exclusive views behind a mode toggle:

- a continuous **uncertainty band** (quality and cost ribbons along the whole
  front), and
- **~10 statically-sampled 95% confidence ellipses**.

The toggle forced an either/or choice. Ten static ellipses cluttered the chart
and obscured the front; the band alone gave a good global read of reliability
but lost the per-point _joint_ (quality×cost) uncertainty that an ellipse shows.

## Decision

We will make the **band the only persistent view**, and show a **single 95%
confidence ellipse for the front point under the cursor**, reusing the existing
`ConfidenceEllipses` component with a one-element index list.

The visualization-mode toggle is removed entirely: the `paretoVisualizationModes`
const, the `ParetoVisualizationMode` type, and the `visualizationMode` /
`visualizationModeSelector` props are gone.

The hover ellipse is **opt-in** via a `showHoverEllipse` prop on
`ParetoFrontPlot` (default `false`), threaded as `showParetoHoverEllipse`
through the `ui` package's multi-objective `Result`. In-repo consumers default
to off; the Brownie Bee application opts in.

See commit `cfeff6c` on branch `pareto-plot`.

## Consequences

- A single, uncluttered chart: the band carries global front reliability, the
  hover ellipse gives on-demand per-point joint uncertainty.
- Smaller `ParetoFrontPlot` API surface.
- **Breaking** for any consumer that used the removed mode props/exports. Only
  the in-repo `ui` consumer existed and was updated; external consumers must
  drop those props.
- Default-off means the demo / sample app no longer shows the ellipse unless a
  consumer opts in — accepted deliberately so each consumer decides.
- The ellipse is axis-aligned (treats the two errors as independent) and only
  appears on hover, so it is a per-point probe, not a static overview.

## Alternatives considered

- **Keep the mode toggle.** Rejected: the either/or friction and the clutter of
  ten static ellipses were the original problem.
- **Also draw a persistent ellipse on the selected point.** Rejected for now to
  keep the resting chart uncluttered; can be revisited if users want the
  selected point's region always visible.
- **Default the hover ellipse on.** Rejected in favour of opt-in (default off)
  so adding the feature changes no existing consumer's behaviour implicitly.
