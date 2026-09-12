# Edited Plan 1 - Hackathon Contract and Submission Baseline

## Assignment

- **Recommended model:** Claude Sonnet
- **Reasoning:** High
- **Purpose:** Merge the existing PortFlow architecture contract with the official IBM Bobathon submission requirements.
- **Allowed work:** Documentation and submission metadata only.
- **Do not implement application code in this plan.**

## Copy-Paste Prompt

```text
Act as the senior product architect and hackathon submission engineer for:

PortFlow AI - Container Congestion Predictor & Port Operations Optimiser

You are editing an existing repository. Do not start over, delete correct work,
or replace detailed documents with shorter generic versions.

Repository context:

- Current local workspace: F:\PortFlow-AI
- Required final public repository name: bob-ai-hackathon-portflow-ai
- Selected official problem: L1 - Container Congestion Predictor & Port
  Operations Optimiser
- Official track: AI
- The public GitHub repository must be created with "Use this template" from
  the official IBM Bobathon template. It must not be created as a fork.

Before editing, read all of these files completely:

- README.md
- submission.yaml
- docs/PROJECT_CONTEXT.md
- docs/API_CONTRACT.md
- docs/DATA_DICTIONARY.md
- docs/DEFINITION_OF_DONE.md
- docs/AI_WORKFLOW.md
- docs/AI_HANDOFF.md
- docs/problem-statement.md
- docs/solution-overview.md
- docs/architecture.md
- docs/setup-guide.md
- docs/submission-readiness.md
- docs/template-guide.md
- CONTRIBUTING.md
- .github/workflows/validate.yml
- bob_sessions/README.md

Also inspect the top-level repository tree. Treat the official validator as a
fixed contract: do not modify .github/workflows/validate.yml.

Task:

Audit and edit the documentation and submission metadata so the PortFlow
architecture and the official Bobathon submission specification form one
consistent contract.

Official problem alignment:

The solution must demonstrably support this end-to-end outcome:

1. Predict congestion hotspots using vessel schedules and berth capacity.
2. Predict or quantify vessel waiting time.
3. Recommend alternate routing strategies when they provide a positive net
   operational benefit.
4. Optimise berth and crane assignments jointly rather than separately.
5. Generate a 72-hour port operations plan for shift supervisors.
6. Explain model and solver outputs without allowing an LLM to invent numerical
   schedules or approve consequential actions.

Primary user:

- Port shift supervisor for one container terminal.
- The supervisor must be able to understand the cause of a risk, compare a
  baseline with an optimised proposal, and explicitly approve routing or plan
  changes.

Approved architecture:

Frontend:
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Recharts and Leaflet only when a real feature requires them

Backend:
- Python 3.12
- FastAPI
- Pydantic
- SQLAlchemy 2
- Alembic
- PostgreSQL

ML:
- Pandas
- NumPy
- scikit-learn
- optional XGBoost only if it measurably improves the evaluated baseline
- Joblib for small serialised models

Optimisation:
- Google OR-Tools CP-SAT

IBM Bob:
- IBM Bob IDE must be a core development tool, not just mentioned in the README.
- Relevant Bob task histories and task-consumption screenshots must be exported
  into bob_sessions/.
- A PortFlow MCP server may expose structured, safe, read-oriented tools to Bob
  for risk explanations and plan summaries.
- IBM Bob or another LLM must not calculate berth/crane assignments, fabricate
  predictions, confirm rerouting, or approve an operations plan.

Deployment target:
- Public GitHub repository
- PostgreSQL and FastAPI deployment suitable for Render or IBM Cloud
- React static deployment suitable for Render, Vercel, or IBM Cloud
- Do not claim deployment until a working public URL exists

Data policy:

- Use reproducible, seed-driven synthetic data when operational port data is
  unavailable.
- Clearly label synthetic records and document the generation assumptions.
- Do not use confidential data, client data, personal information, social-media
  data, or data without appropriate permission.
- Keep a source/provenance record for any public dataset used.

Repository submission contract:

The following top-level paths must exist and remain correctly named:

- submission.yaml
- README.md
- src/
- docs/problem-statement.md
- docs/solution-overview.md
- docs/architecture.md
- docs/setup-guide.md
- demo/demo-video-link.txt
- demo/live-demo-url.txt
- demo/screenshots/
- presentation/
- bob_sessions/
- CONTRIBUTING.md
- .github/workflows/validate.yml

All application code must live under src/. Existing detailed PortFlow contract
documents may remain under docs/ as additional documentation.

Required documentation work:

1. README.md
   - State the exact L1 problem and primary user.
   - Explain the prediction-to-action differentiator.
   - Include an honest current implementation status.
   - Include the repository structure and exact run commands.
   - Link demo, screenshots, presentation, and Bob evidence.
   - Do not contain official template placeholders.

2. submission.yaml
   - Keep track equal to AI.
   - Ensure every validator-required field is non-empty.
   - Use 3-5 concrete key features.
   - Do not describe an unfinished capability as implemented.
   - Preserve honest known limitations.
   - Do not invent team members, emails, video URLs, or deployment URLs.

3. docs/problem-statement.md
   - Identify the port shift supervisor and operational pain.
   - Explain why spreadsheets and prediction-only dashboards are insufficient.
   - Avoid unsupported numerical claims.
   - Define a testable success outcome.

4. docs/solution-overview.md
   - Explain the complete prediction -> optimisation -> human approval loop.
   - Distinguish ML, deterministic business logic, CP-SAT, and LLM/Bob roles.
   - Explain why the solution is differentiated from a basic risk dashboard.

5. docs/architecture.md
   - Include a valid Mermaid component/data-flow diagram.
   - Include a technology/responsibility table.
   - Explain the end-to-end data flow, security controls, reproducibility,
     synthetic-data policy, and MVP scalability.

6. docs/setup-guide.md
   - Assume all application code lives under src/.
   - Include prerequisites, environment variables, exact install/run/test
     commands, health verification, and troubleshooting.
   - Do not include a repository URL that does not exist; mark it as pending if
     the official public repository has not been created.

7. Existing contract documents
   - Preserve their detail.
   - Reconcile field names, endpoint names, UTC handling, risk thresholds, and
     human-approval rules.
   - Record any necessary contract change explicitly in docs/AI_HANDOFF.md.

8. docs/submission-readiness.md
   - Record current status using Complete, In progress, Not started, or Blocked.
   - Separate automated work from manual artifacts: team details, Bob exports,
     demo video, screenshots, slide deck, public URLs, and final form submission.
   - Record the organiser window: 15 September 2026, 12:00 PM-11:45 PM, with a
     note to confirm the organiser timezone.

9. bob_sessions/README.md
   - Explain that each relevant IBM Bob task needs both the exported Markdown
     history and the task-consumption-summary screenshot.
   - Include a credential-removal warning.
   - Never fabricate Bob session evidence.

Hard constraints:

- Documentation and metadata only; do not change source code.
- Do not modify the official validation workflow.
- Do not create fake URLs or screenshots.
- Do not insert secrets or real credentials.
- Do not invent team member details.
- Do not commit, push, rename a GitHub repository, or submit a form.
- Do not broaden the MVP with IoT, AIS live feeds, Kafka, Kubernetes,
  microservices, blockchain, Redis, Celery, Spark, Hadoop, or GraphQL.

Validation before finishing:

1. Confirm all required template paths exist.
2. Parse submission.yaml and confirm required fields are present.
3. Search README.md for official placeholder text.
4. Review all architecture documents for contradictions.
5. Verify all setup commands use the src/ layout.
6. Check for accidentally documented secrets or nonexistent links.
7. Run git diff --check.

Update docs/AI_HANDOFF.md with:

- completed work;
- changed files;
- validation performed;
- unresolved team/manual information;
- contract changes;
- exact next task.

Return a concise completion report and stop. Do not begin Plan 2.
```

## Expected Result

Plan 1 should update only documentation and submission metadata. It must not generate application code, fake artifacts, or external GitHub changes.

## Completion Checklist

- [ ] Exact L1 problem is consistently stated.
- [ ] Primary user and end-to-end demo outcome are defined.
- [ ] Official top-level template paths are documented.
- [ ] All code paths in the setup guide use `src/`.
- [ ] `submission.yaml` parses and required fields are non-empty.
- [ ] README has no official template placeholders.
- [ ] ML, optimiser, deterministic logic, and IBM Bob roles are distinct.
- [ ] Synthetic-data and prohibited-data policies are explicit.
- [ ] Human approval is required for routing and plans.
- [ ] Bob task-export requirements are explicit.
- [ ] Manual artifacts are not fabricated.
- [ ] Official validator is unchanged.
- [ ] `docs/AI_HANDOFF.md` is current.

## Suggested Commit After Human Review

```bash
git add README.md submission.yaml CONTRIBUTING.md docs bob_sessions
git commit -m "docs: align PortFlow with Bobathon submission contract"
```

Do not commit until team details and the diff have been reviewed by a human.
