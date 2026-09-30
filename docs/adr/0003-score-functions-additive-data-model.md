# 0003. Score functions: additive data model that persists into the existing score entry

- **Status:** accepted
- **Date:** 2026-07-24
- **Deciders:** Jack Ord

## Context

Users need to define a per-objective **score function** — a mathjs expression
over named "responses" (measured values entered per data point) and existing
factors — that computes each data point's quality/cost score, instead of typing
the score by hand.

The score value is load-bearing downstream: the optimizer request builder, the
Pareto selection, the plots, and the CSV export all read it from the existing
`{ type: 'score', name, value }` entry in a data point's `data` array. Anything
that changed that contract would ripple into the Python optimizer API and every
consumer of experiment data.

## Decision

Model score functions as **purely additive** to the experiment data model in
`@boostv/process-optimizer-frontend-core`, behind a `v21` data-format migration:

- `scoreVariable.scoreFunction` — the expression plus its variable definitions
  (each `{ name, symbol, source: 'response' | 'factor', factorName? }`).
- `dataEntry.responses` — per-data-point response values plus a `useFunction`
  toggle (function-computed vs. manually typed).

The computed value (or the typed value, in manual mode) **continues to live in
the existing `{ type: 'score', name, value }` entry**. The reducer computes it
(`computeScore`) and writes it there; a new function-mode point that has no
score entry yet gets one created, inserted in canonical order so multi-objective
score columns stay positionally aligned. Nothing downstream is modified — the
optimizer request, Pareto, plots, and CSV all keep reading the same entry.

Key commits: `7d9e459` (schema + v21 migration), `5d7a451` (reducer actions),
`27055cf` (compute/persist for new points, preserving score order).

## Consequences

- **Easier:** zero changes to the optimizer/backend or any downstream consumer;
  pre-`v21` experiments migrate transparently because the new fields are
  optional and additive.
- **Harder / accepted costs:** the score is now sometimes _derived_ state — the
  reducer must recompute and persist it when the function or a row's responses
  change, and a validation flags rows whose responses are missing (excluded from
  the optimizer via `meta.valid`). The UI must track function-vs-manual mode per
  row. Expression evaluation runs client-side via mathjs.
- New data points default to using a defined function; pre-existing points stay
  manual until switched, so existing hand-entered scores are never silently
  overwritten.

## Alternatives considered

- **A separate "computed score" field, distinct from the existing score entry.**
  Rejected: every downstream consumer (optimizer request, Pareto, plots, CSV)
  would have to learn about it, defeating the goal of leaving them untouched.
- **Compute scores in the backend / optimizer API.** Rejected: couples the
  statistical engine to a UI-authoring concern, adds round-trips, and pushes
  expression parsing into Python.
- **Store responses inside the `{ type: 'score' }` entry.** Rejected: overloads
  the shape downstream code reads; a separate additive `responses` field keeps
  the score entry's contract intact.
