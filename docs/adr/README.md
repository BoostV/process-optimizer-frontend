# Architecture Decision Records

This folder is the durable record of significant decisions in this repo. Each
ADR captures one decision: the context that forced it, what was decided, the
consequences, and the alternatives that were rejected.

ADRs are the **only** design document we keep on `main` long-term. The
agent-generated plans and specs produced while building may live on the branch
for review, but are removed in a cleanup commit before merge (see `AGENTS.md`).

## When to write one

Write an ADR when a future maintainer would ask _"why is it like this?"_ and the
code alone won't answer. Typical triggers:

- An architectural choice with viable alternatives.
- Reversing or superseding an earlier decision.
- A cross-cutting convention or constraint.
- A trade-off that is non-obvious from the code.

**Don't** write one for routine features, bug fixes, or refactors. Most branches
record no ADR — that's expected. One ADR per branch is a smell.

## How

1. Copy `template.md` to `NNNN-short-title.md` — `NNNN` is the next zero-padded
   number.
2. Fill it in. Keep it short; link to code, PRs, or superseded ADRs.
3. Set `Status` (`accepted` once agreed). When a later ADR overrides this one,
   set this one's status to `superseded by ADR-XXXX` and reference it.
4. Add a line to the index below.

## Index

| ADR                                              | Title                                                            | Status   |
| ------------------------------------------------ | ---------------------------------------------------------------- | -------- |
| [0001](0001-pareto-uncertainty-visualization.md) | Pareto front uncertainty: band view + opt-in hover ellipse       | accepted |
| [0002](0002-adrs-and-ephemeral-agent-docs.md)    | Record decisions in ADRs; treat agent plans/specs as branch-only | accepted |
