# CLAUDE.md

@AGENTS.md

The shared working agreement above applies. Claude Code specifics:

- **Finalizing a branch:** use the `finish-branch` skill (`.claude/skills/finish-branch/`).
  It runs the ADR-distillation step described in `AGENTS.md` before the usual
  merge/cleanup steps.
- **Specs & plans** from the brainstorming / writing-plans skills land in
  `docs/superpowers/{specs,plans}/` (other workflows may use other paths). They
  may be committed on the branch for review, but are not kept on `main`: at
  branch finish, distil any durable decision into an ADR and remove the
  plans/specs in a cleanup commit before merge. This is advisory — remind the
  user, don't enforce it.
