# Agent guide

Vendor-neutral working agreement for AI coding agents in this repository.
Framework-specific entrypoints (e.g. `CLAUDE.md`) import this file.

## Project

`process-optimizer-frontend` — a TypeScript monorepo of publishable packages
under `packages/*` (`@boostv/process-optimizer-frontend-{core,plots,ui,api}`),
plus a `sample-app` demo. React 19, Recharts v3, Zod, Vite, Vitest, MUI.

Vendored, untracked sibling projects (`brownie-bee`, `brownie-bee-backend`,
`process-optimizer-api`) may be present for local end-to-end testing. They are
**not** part of this repo — never commit them or changes inside them here.

## Build & test

- Per package: `npm run build` (runs `tsc` then `vite build`), `npm test` (Vitest).
- Demo app: `npm run dev:app`. Package UI harness: `npm run dev:ui`.
- A husky + lint-staged pre-commit hook runs prettier/eslint on staged files.

## Documentation & decision records

We keep **one** kind of durable design document on `main`: Architecture
Decision Records (ADRs). Everything else an agent produces while building is a
working artifact that does not survive the branch.

- **ADRs — `docs/adr/`.** Durable, high-level decisions only: an architectural
  choice, a reversal of a prior choice, a cross-cutting convention, a notable
  trade-off. Nygard format; see `docs/adr/template.md` and `docs/adr/README.md`.
  Numbered `NNNN-title.md`. **Do not force one ADR per branch** — most branches
  record none. Only write one when a future maintainer would ask "why is it
  like this?" and the code alone won't answer.
- **Agent-generated plans & specs.** Whatever planning/spec docs an agent
  produces while building — wherever the workflow puts them (e.g.
  `docs/superpowers/`, `docs/plans/`, a branch scratch file). They are working
  artifacts: useful on the branch and during review, but not kept on `main`.
  They may be committed on the branch (so reviewers see them in the PR), and are
  **removed in a cleanup commit before the PR is merged** — see below.
- **Explanations that aren't decisions** (how a module works, why an algorithm
  is shaped a certain way) belong next to the code — a module `README` or code
  comments — not in an ADR.

## Finalizing a feature branch

Before a feature branch is merged, distil its working artifacts into the
durable record:

1. Find the branch's agent-generated plans/specs (wherever they live) and read
   them alongside the commit history/diff.
2. Decide whether the branch embodies a **durable decision** (per the ADR bar
   above). If not — and that is the common case — record nothing.
3. If it does: draft an ADR from the template and **get a human to approve it**
   before finalizing. "What is architecturally relevant" is a judgment call
   that is not fully delegated to the agent.
4. The plans/specs have now served their purpose — their durable content (if
   any) lives in the ADR, the rest stays in git history. Keep them through
   review, then **remove them in a cleanup commit before merge**.
5. Complete the usual finishing steps: tests/build green, PR or merge, delete
   the branch.

This is guidance, not a gate: it is **not mechanically enforced**. The agent's
job is to surface it — remind the user about the cleanup commit and confirm
before merging — not to block the merge.

Agents working in Claude Code: a `finish-branch` skill encodes this procedure —
use it when wrapping up a branch.

## Inspecting features (agents)

To visually verify a frontend change, use the Playwright inspection harness in
`inspection/` rather than building ad-hoc scaffolding. It loads a sample in the
`dev:ui` demo and writes screenshots to `inspection/output/`. Run it locally
(`npm run inspect:setup` once, then `npm run inspect`) or — when the environment
lacks browser system libraries — in Docker (`npm run inspect:docker`, which uses
the official Playwright image). See `inspection/README.md`.

## Conventions

- Match surrounding code; formatting is enforced by prettier/eslint — don't
  hand-format against them.
- Branch from `main`; commit or push only when the user asks.
- Don't add unrelated refactors to a focused change.
