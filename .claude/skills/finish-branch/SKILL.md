---
name: finish-branch
description: Use when wrapping up, finalizing, or merging a feature branch in this repo. Distils the branch's agent-generated plans/specs into a durable Architecture Decision Record when warranted (with human approval), then reminds the user to remove the plans/specs in a cleanup commit before the usual tests/merge/cleanup steps.
---

# Finish branch

Finalize a feature branch in this repo. The distinctive step is **distilling the
branch's agent-generated plans/specs into a durable ADR** when warranted, then
removing those plans/specs in a cleanup commit before merge — see `AGENTS.md`
and `docs/adr/README.md` for the policy. This is advisory: surface it to the
user, don't enforce it.

Do not start until the feature work itself is complete and the user is wrapping
up the branch.

## Checklist

Create a TodoWrite item per step and work them in order.

1. **Confirm scope.** Identify the branch and its diff against `main`
   (`git log --oneline main..HEAD`, `git diff main...HEAD --stat`). Confirm with
   the user that the feature is done and ready to finalize.

2. **Gather the working artifacts.** Find the agent-generated plans/specs for
   this branch wherever they live (e.g. `docs/superpowers/`, `docs/plans/`, a
   branch scratch file — they may or may not be committed). Read them with the
   commit messages and the diff. You now have the full "what and why."

3. **Decide if an ADR is warranted.** Apply the bar in `docs/adr/README.md`:
   write one only if a future maintainer would ask "why is it like this?" and
   the code won't answer — an architectural choice, a reversal of a prior
   decision, a cross-cutting convention, or a non-obvious trade-off.
   **Most branches warrant none.** If none: say so, with a one-line reason, and
   skip to step 6.

4. **Draft the ADR.** Copy `docs/adr/template.md` to the next number
   `docs/adr/NNNN-short-title.md`. Fill in Context / Decision / Consequences /
   Alternatives considered. Keep it short; link to the key commit(s)/PR and to
   any superseded ADR. Add a row to the index table in `docs/adr/README.md`.

5. **Get human approval of the ADR.** Show the user the drafted ADR and ask them
   to confirm or edit before proceeding. Judgment about what is architecturally
   relevant stays with the human. Revise until approved.

6. **Verify green.** Build and test the packages the branch touched
   (`npm run build`, `npm test` in each). Report results honestly; do not
   finalize over failures without the user's say-so.

7. **Clean up the plans/specs.** If they were committed on the branch, remove
   them in a dedicated cleanup commit so they don't land on `main` — their
   durable content (if any) is now in the ADR, the rest stays in git history.
   Keep them through review; the natural time to remove is just before merge.
   **Don't enforce this** — surface it: remind the user and confirm, rather than
   blocking the merge if they'd rather keep them.

8. **Finalize.** Commit the ADR (and code, if uncommitted) on the branch, then
   open a PR or merge per the user's preference and delete the branch. If the
   `superpowers:finishing-a-development-branch` skill is available, use it for
   this git mechanics step. End git commit messages with the repo's required
   `Co-Authored-By` trailer.

## Notes

- One ADR per branch is a smell — recording nothing is the common, healthy case.
- Never commit the vendored `brownie-bee*` / `process-optimizer-api` directories
  or changes inside them.
- Don't invent a timeframe or follow-up the branch didn't actually create.
