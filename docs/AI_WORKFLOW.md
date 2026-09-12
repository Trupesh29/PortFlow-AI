# PortFlow AI — AI Workflow Rules

> **Version:** 1.0
> **Date:** 2026-09-12
> **Audience:** Any AI agent (IBM Bob, coding assistant, or LLM tool) contributing to this codebase.
> **Status:** Authoritative — these rules are non-negotiable for every AI-assisted task.

---

## Rule 0 — Read Contract Documents Before Editing

Before writing any code or modifying any file, the AI agent **must** read and internalise the following documents in this order:

1. `docs/PROJECT_CONTEXT.md` — understand the business problem, primary user, MVP, and demo journey.
2. `docs/API_CONTRACT.md` — understand every endpoint, field name, type, and envelope format.
3. `docs/DATA_DICTIONARY.md` — understand every data field, its unit, valid range, and source.
4. `docs/DEFINITION_OF_DONE.md` — understand the criteria that must be satisfied before a task is DONE.
5. `docs/AI_HANDOFF.md` — understand the current project state, completed work, and recommended next task.

**Do not skip this step.** Reading takes less time than correcting a misaligned implementation.

---

## Rule 1 — Implement Only the Assigned Task

- Implement exactly the task described in the assignment. Nothing more.
- Do not implement future tasks, even if they seem "obvious" or "nearby".
- If the task is ambiguous, stop and ask a clarifying question before writing code.
- If the task requires a decision that is not covered by these documents, document the decision in `AI_HANDOFF.md` and ask a human to review it.

**Rationale:** Scope creep during AI-assisted development is the leading cause of merge conflicts, broken contracts, and wasted integration work.

---

## Rule 2 — Do Not Redesign Unrelated Modules

- Only modify files that are directly required to complete the assigned task.
- Do not refactor, reformat, or reorganise unrelated files, even if the code looks suboptimal.
- If you notice a genuine bug in an unrelated module, document it in `AI_HANDOFF.md` under "Known issues" and stop there. Do not fix it unless it blocks the assigned task.

---

## Rule 3 — Do Not Add Unapproved Technologies

The approved technology stack is defined in `PROJECT_CONTEXT.md`. Do not introduce any library, framework, or service that is not already approved. This includes:

- No Kafka, Kubernetes, Spark, Hadoop, or blockchain components.
- No microservices or event-driven architecture.
- No new Python packages without explicit approval. If a new package is genuinely required, document the need in `AI_HANDOFF.md` and wait for approval before adding it.
- No new frontend libraries beyond what is listed in `package.json` at the time of task assignment.

---

## Rule 4 — Do Not Create Fake ML Predictions

- ML prediction endpoints must load and call a trained model file. They must not return static or hard-coded values.
- During development, if the model file does not yet exist, the endpoint must return HTTP 503 with `"error": "model_unavailable"`.
- A placeholder function that returns `{"congestion_probability": 0.87}` unconditionally is a contract violation, regardless of whether it is labelled "TODO".

**Exception:** A seed-driven synthetic data generation script may produce training data. This is not a fake prediction; it is a data generation step.

---

## Rule 5 — Do Not Create Hard-Coded Optimiser Results

- The optimiser endpoint must call OR-Tools CP-SAT at runtime and return the solver's output.
- Pre-computing assignments offline and returning them as static JSON is a contract violation.
- If the solver is not yet integrated, the endpoint must return HTTP 501 with `{"error": {"code": "NOT_IMPLEMENTED"}}`.

---

## Rule 6 — Do Not Silently Change API or Data Contracts

- If the assigned task requires a contract change (new field, renamed field, changed type, new endpoint), the AI agent must:
  1. Stop implementing.
  2. Document the proposed change in `AI_HANDOFF.md` under "Contract changes".
  3. Ask a human reviewer to approve the change before modifying `API_CONTRACT.md` or `DATA_DICTIONARY.md`.
- Do not rename fields, change types, or add fields to response objects without following this process.
- Do not implement a different response structure because it "feels cleaner". Follow the contract as written.

---

## Rule 7 — Run Targeted Tests After Every Change

After completing the assigned task (before updating `AI_HANDOFF.md`), the AI agent must:

1. Run the targeted test suite for the module being changed:
   - Backend: `pytest tests/<module>/ -v`
   - Frontend: `npm test -- --testPathPattern=<component>`
2. Fix any test failures before declaring the task complete.
3. Run the full test suite as a final check: `pytest` and `npm test`.
4. Record the test results (pass count, fail count) in `AI_HANDOFF.md`.

Do not skip testing because "the change is small". Small changes break things.

---

## Rule 8 — Update AI_HANDOFF.md After Every Task

After completing all code changes and tests, update `docs/AI_HANDOFF.md` with:

- **Current status**: One sentence describing where the project stands.
- **Completed work**: A bulleted list of exactly what was done in this task.
- **Changed files**: Every file path that was created or modified.
- **Commands executed**: Every command that was run (installs, migrations, tests, seeds).
- **Test results**: Pytest and npm test output summary.
- **Known issues**: Any bugs, stubs, or limitations introduced or discovered.
- **Contract changes**: Any proposed or approved changes to API_CONTRACT.md or DATA_DICTIONARY.md.
- **Recommended next task**: The single most valuable next step for the next AI agent or human developer.

Do not write vague updates. Be specific.

---

## Rule 9 — Stop After Completing the Assigned Task

- When the assigned task is complete and `AI_HANDOFF.md` is updated, stop.
- Do not begin the next logical task.
- Do not "clean up" adjacent code.
- Do not add extra features "while you're at it".
- The next task will be assigned explicitly.

**Rationale:** Unsolicited changes are the hardest to review and the most likely to introduce regressions.

---

## Summary Card

| Rule | Directive |
|------|-----------|
| 0 | Read all project contract documents before editing |
| 1 | Implement only the assigned task |
| 2 | Do not redesign unrelated modules |
| 3 | Do not add unapproved technologies |
| 4 | Do not create fake ML predictions |
| 5 | Do not create hard-coded optimiser results |
| 6 | Do not silently change API or data contracts |
| 7 | Run targeted tests after every change |
| 8 | Update AI_HANDOFF.md after every task |
| 9 | Stop after completing the assigned task |

---

## IBM Bob — Specific Constraints

IBM Bob (AI Copilot) operates through an MCP server. Additional rules apply:

- IBM Bob must call structured MCP tools backed by application services. It must not compute scheduling solutions internally using its language model.
- IBM Bob must not override or contradict the optimiser's numerical outputs. It may explain them in plain language.
- IBM Bob must not approve routing changes or plan approvals on behalf of the supervisor. It may explain recommendations; the supervisor must confirm.
- IBM Bob's responses must cite the MCP tool(s) called and the data source (`real` or `synthetic`) of any prediction or recommendation it references.
- IBM Bob must not hallucinate vessel names, berth codes, or cost figures. All values must come from MCP tool responses.
