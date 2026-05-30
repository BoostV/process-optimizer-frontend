# 0002. Record decisions in ADRs; treat agent plans/specs as branch-only

- **Status:** accepted
- **Date:** 2026-05-30
- **Deciders:** Jakob Langdal

## Context

Agent-driven development (the superpowers brainstorming / writing-plans
workflow, and similar tools) produces a spec and a plan for essentially every
feature. Committing all of them to `main` accumulates ephemeral, quickly-stale
documents that bury the few decisions that actually matter. We wanted a durable
record of _why_ the code is shaped as it is, without the noise of _how_ each
feature was built — and the convention had to work across agent frameworks, not
just one tool.

## Decision

We will keep **one** durable design document on `main`: Architecture Decision
Records under `docs/adr/` (Nygard format).

- **Agent-generated plans/specs are working artifacts.** They may live on the
  branch — and in the PR — during development and review, but are removed in a
  cleanup commit before merge. They are not kept on `main`.
- **At branch finalization, distil any durable decision into an ADR**, with a
  human approving it. Don't force one per branch; most branches record none.
- **This is advisory, not enforced.** Plans/specs are not git-ignored and there
  is no CI gate; the agent surfaces the cleanup/distillation and the human
  decides.
- Instructions live in `AGENTS.md` (vendor-neutral), imported by `CLAUDE.md`.
  The Claude Code `finish-branch` skill encodes the procedure.

## Consequences

- `main` carries only high-signal decision records; plans/specs don't rot there.
- The convention is portable across agent frameworks via `AGENTS.md`.
- Reviewers still see the plans/specs in the PR, before the cleanup commit.
- Because it's advisory, a branch could merge with stale specs still committed,
  or without an ADR that arguably should exist. Accepted: we preferred low
  ceremony over enforcement for a small team. The `finish-branch` reminder is
  the mitigation.

## Alternatives considered

- **Keep specs/plans committed permanently** (the original workflow default).
  Rejected: accumulates noise and stale docs, and buries the "why".
- **Git-ignore specs/plans entirely** (never committed). Rejected: reviewers
  wouldn't see them in the PR. We chose branch-visible + cleanup-before-merge.
- **Mechanically enforce the cleanup** (git-ignore, or a CI/hook gate).
  Rejected: too much ceremony for a small team; an advisory reminder is enough.
