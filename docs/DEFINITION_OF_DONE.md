# PortFlow AI — Definition of Done

> **Version:** 1.0
> **Date:** 2026-09-12
> **Status:** Authoritative — all contributors must satisfy every criterion before marking a feature DONE.

---

## Overview

A feature is **DONE** only when **all** of the following criteria are satisfied. Partial completion must be explicitly flagged using the process described in Section 9.

---

## Criterion 1 — Real Application Logic

> The feature uses real application logic rather than hard-coded output.

- [ ] ML prediction endpoints return outputs from a trained scikit-learn or XGBoost model loaded via Joblib. No `return {"congestion_probability": 0.87}` literals.
- [ ] The optimiser endpoint returns assignments computed by OR-Tools CP-SAT at runtime. No pre-computed or hard-coded schedules.
- [ ] The routing recommendation computes cost from actual field values in the database. No static comparisons.
- [ ] Synthetic data, if used, is generated programmatically by a seed-driven data generation script — not manually copy-pasted into fixtures.

**Rationale:** Hard-coded outputs break the moment data changes and undermine the demo's credibility. Every prediction must actually predict.

---

## Criterion 2 — API Contract Compliance

> The feature's API follows `API_CONTRACT.md` exactly.

- [ ] Endpoint path and HTTP method match `API_CONTRACT.md`.
- [ ] Request fields use the same names, types, and validation rules as documented.
- [ ] Response fields use the same names, types, and envelope structure as documented.
- [ ] Error responses use the standard error envelope defined in `API_CONTRACT.md` Section 16.
- [ ] No field has been renamed, removed, or added without a documented contract change (see Criterion 7).
- [ ] The `/api/v1` prefix is applied.
- [ ] Timestamps are ISO 8601 UTC in all request and response payloads.

**Rationale:** The frontend depends on this contract. Silent changes break the UI and waste debugging time.

---

## Criterion 3 — Success and Failure Handling

> The feature handles both the happy path and failure paths gracefully.

**Success path:**
- [ ] Returns the documented HTTP status code (200 or 201).
- [ ] Response body matches the documented schema.

**Failure paths:**
- [ ] Missing required fields return HTTP 422 with a `VALIDATION_ERROR` envelope identifying the offending field.
- [ ] Unknown UUIDs return HTTP 404 with a `NOT_FOUND` envelope.
- [ ] Business rule violations (e.g. ETD before ETA) return HTTP 422 with an explanatory message.
- [ ] ML model not loaded returns HTTP 503 with `"error": "model_unavailable"`.
- [ ] Solver returns INFEASIBLE: the API returns HTTP 200 with `"solver_status": "INFEASIBLE"` and an empty assignments list. It does not return HTTP 500.
- [ ] Database connection failure returns HTTP 503 (not 500).
- [ ] Unhandled exceptions are caught by a global exception handler that returns HTTP 500 with a `INTERNAL_ERROR` envelope.
- [ ] Frontend displays a user-readable error message for every non-200 response.

---

## Criterion 4 — Tests Pass

> Relevant tests pass before the feature is merged.

**Backend (Python / pytest):**
- [ ] At least one unit test per service function covering the happy path.
- [ ] At least one unit test per service function covering the primary failure path.
- [ ] At least one integration test per API endpoint using FastAPI `TestClient`.
- [ ] All existing tests continue to pass (no regressions).
- [ ] `pytest` exits with code 0.

**Frontend (Vitest / React Testing Library):**
- [ ] At least one component test per new UI component.
- [ ] The test renders the component and asserts at least one expected element is present.
- [ ] `npm test` exits with code 0.

**ML model:**
- [ ] A smoke test loads the serialised model from disk and asserts it produces a prediction without throwing.

**Optimiser:**
- [ ] A smoke test runs the solver on a minimal 2-vessel, 2-berth, 2-crane problem and asserts `solver_status` is `OPTIMAL` or `FEASIBLE`.

---

## Criterion 5 — No Committed Secrets

> Environment variables contain no committed secrets.

- [ ] No API keys, database URLs, or passwords appear in committed files.
- [ ] All secrets are referenced via `os.getenv()` or `python-dotenv` on the backend, and via `import.meta.env` on the frontend.
- [ ] `.env`, `.env.local`, and `.env.production` are listed in `.gitignore`.
- [ ] A `.env.example` file documents all required environment variables with placeholder values and brief descriptions.
- [ ] The repository is scanned with `git grep` for common secret patterns (API keys, passwords) before the pull request is merged.

**Required environment variables for backend:**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Application secret (session signing) |
| `LLM_API_KEY` | Optional LLM provider API key |
| `MCP_SERVER_URL` | IBM Bob MCP server endpoint |
| `MODEL_DIR` | Directory where serialised ML models are stored |
| `ENV` | `development`, `staging`, or `production` |

---

## Criterion 6 — Documentation Matches Implementation

> All three contract documents match the implemented behaviour.

- [ ] `API_CONTRACT.md` matches every endpoint path, method, field name, type, and example value.
- [ ] `DATA_DICTIONARY.md` matches every database column name, type, unit, and valid range.
- [ ] `PROJECT_CONTEXT.md` MVP feature list reflects what is actually implemented.
- [ ] If any contract document was changed as part of this feature, the change is described in the pull request description and in `AI_HANDOFF.md`.
- [ ] The `AI_HANDOFF.md` "Contract changes" section is updated.

---

## Criterion 7 — Incomplete Functionality Is Clearly Identified

> Work that is intentionally deferred is visible and traceable.

- [ ] Any function or endpoint that is a stub (not yet implemented) is decorated with a `# TODO(portflow): <reason>` comment.
- [ ] Stub endpoints return HTTP 501 with `{"error": {"code": "NOT_IMPLEMENTED", "message": "..."}}` — not a fake 200 response.
- [ ] The `AI_HANDOFF.md` "Known issues" section lists every stub and known limitation introduced by this task.
- [ ] The demo journey defined in `PROJECT_CONTEXT.md` Section 7 is not broken by any stub. If a stub would break the demo, the feature is not DONE.

---

## Criterion 8 — Feature Supports the Primary Demo Journey

> The feature works correctly within the 2–3 minute demo storyline.

- [ ] The feature can be exercised end-to-end using the demo data set (synthetic, seed-driven).
- [ ] The feature produces correct, visually coherent output on the dashboard or in the relevant UI panel.
- [ ] IBM Bob (AI Copilot) can answer a question about this feature's output if the demo storyline calls for it.
- [ ] The feature does not require manual database manipulation or API calls outside the UI to demonstrate.

---

## Criterion 9 — Flagging Incomplete Work

If a feature cannot satisfy all eight criteria before a deadline, the contributor must:

1. Complete only the criteria that are fully achievable.
2. Document exactly which criteria are not satisfied in `AI_HANDOFF.md`.
3. Add `# TODO(portflow):` comments for every incomplete code path.
4. Ensure the demo journey still runs without encountering the incomplete paths.
5. Do **not** mark the feature as DONE — use status `IN PROGRESS` or `BLOCKED`.

---

## Quick Checklist (Copy for Pull Requests)

```markdown
## Definition of Done Checklist

- [ ] Criterion 1: Real application logic (no hard-coded outputs)
- [ ] Criterion 2: API contract compliance (paths, fields, envelopes)
- [ ] Criterion 3: Success and failure handling (happy path + error paths)
- [ ] Criterion 4: Tests pass (backend unit + integration, frontend component, ML smoke)
- [ ] Criterion 5: No committed secrets (.env.example updated)
- [ ] Criterion 6: Documentation matches implementation
- [ ] Criterion 7: Incomplete functionality clearly identified (stubs return 501)
- [ ] Criterion 8: Feature supports the primary demo journey
```
