# Edited Plan 2 - Bobathon-Compliant Application Skeleton

## Assignment

- **Recommended model:** Gemini 3.7 Flash
- **Thinking level:** Medium
- **Tool:** Google Antigravity
- **Purpose:** Verify and repair the existing skeleton so it satisfies the official template and runs from `src/`.
- **Do not implement database models, ML, optimisation, routing, or a copilot in this plan.**

## Copy-Paste Prompt

```text
Act as a senior full-stack engineer and repository maintainer for PortFlow AI.

You are working in an existing repository. Plan 1 documentation and much of the
application skeleton may already exist. Inspect first, preserve correct work,
and change only what is missing, broken, duplicated, or inconsistent.

Repository context:

- Current local workspace: F:\PortFlow-AI
- Final required public repository name: bob-ai-hackathon-portflow-ai
- Official problem: L1 - Container Congestion Predictor & Port Operations
  Optimiser
- Official track: AI
- The official Bobathon template requires every application source file to live
  under src/.

Precondition:

Plan 1 must be complete. Before editing, read:

- README.md
- submission.yaml
- CONTRIBUTING.md
- .gitignore
- .python-version
- .github/workflows/validate.yml
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
- bob_sessions/README.md
- src/README.md

If these documents contain a major unresolved contradiction that changes the
code architecture, stop and report it. Do not invent a new contract.

Task:

Audit and repair the existing repository skeleton so it is small, executable,
secure, honest, and compliant with the official Bobathon layout.

Required top-level layout:

bob-ai-hackathon-portflow-ai/
|-- README.md
|-- submission.yaml
|-- CONTRIBUTING.md
|-- .gitignore
|-- .python-version
|-- .github/
|   `-- workflows/
|       `-- validate.yml
|-- docs/
|   |-- problem-statement.md
|   |-- solution-overview.md
|   |-- architecture.md
|   |-- setup-guide.md
|   `-- additional PortFlow contract documents
|-- src/
|   |-- .env.example
|   |-- README.md
|   |-- frontend/
|   |-- backend/
|   |-- database/
|   |-- ml/
|   |-- optimizer/
|   |-- mcp-server/
|   |-- data/
|   `-- tests/
|-- demo/
|   |-- README.md
|   |-- demo-video-link.txt
|   |-- live-demo-url.txt
|   `-- screenshots/
|-- presentation/
`-- bob_sessions/

Migration rule:

- If legacy application folders such as frontend/, backend/, database/, ml/,
  optimizer/, mcp-server/, data/, or tests/ exist at the repository root,
  compare them with src/<folder>/ before moving anything.
- Preserve the newest intentional source changes.
- Never overwrite one divergent copy without reporting the difference.
- Generated node_modules/, dist/, .venv/, caches, and logs must remain ignored
  and must not be copied into src/ as source code.
- Do not delete user work. If duplicate source trees differ materially, stop and
  report the exact paths.

Approved stack for this plan:

Frontend:
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router

Backend:
- Python 3.12
- FastAPI
- Pydantic
- pydantic-settings
- SQLAlchemy 2 packages may be declared but no models are implemented
- PostgreSQL configuration may be declared but no connection is required
- Uvicorn

Project constraints:

- Modular monolith
- No IoT or hardware
- No live AIS integration
- No Kafka, Kubernetes, microservices, blockchain, Redis, Celery, GraphQL,
  Spark, or Hadoop
- No fake predictions, optimiser assignments, vessel positions, alerts, KPIs,
  cost savings, or demo URLs
- Do not modify the architecture contracts unless a blocking implementation
  mismatch is documented first
- Do not modify .github/workflows/validate.yml

Backend requirements:

Location: src/backend/

1. Preserve or create a functioning FastAPI application.
2. Use /api/v1 as the API prefix.
3. Implement only this real endpoint:

   GET /api/v1/health

4. Exact response:

   {
     "status": "healthy",
     "service": "portflow-api",
     "version": "0.1.0"
   }

5. Configure settings with pydantic-settings.
6. Read DATABASE_URL and CORS_ORIGINS from environment variables.
7. Configure CORS from settings.
8. Add a consistent API error envelope and global error handling.
9. Do not connect to PostgreSQL in this plan.
10. Do not call Base.metadata.create_all.
11. Do not create placeholder feature endpoints that return invented values.
12. Empty future modules may contain README files or explicit TODO comments.

Backend package set should remain minimal:

- fastapi
- uvicorn[standard]
- pydantic
- pydantic-settings
- sqlalchemy
- psycopg[binary]
- alembic
- pytest
- httpx

Backend commands must work from src/:

   python -m uvicorn backend.app.main:app --reload --port 8000
   python -m pytest backend/tests -q

Frontend requirements:

Location: src/frontend/

1. Preserve or create a React + Vite + TypeScript application.
2. Configure Tailwind CSS and React Router.
3. Provide these routes:

   /
   /vessels
   /map
   /predictions
   /optimizer
   /operations-plan
   /copilot

4. Build a compact maritime operations shell containing:

   - PortFlow AI product name;
   - responsive sidebar or top navigation;
   - active-route indication;
   - page title;
   - API health state;
   - honest "Demo data not loaded" empty states.

5. Use a navy and teal operational visual direction.
6. Do not create a marketing landing page.
7. Do not add fake KPI cards, charts, vessel markers, predictions, assignments,
   or cost savings.
8. Do not add Recharts, Leaflet, Axios, or a state library until a later real
   feature needs them.
9. Use maintained dependency versions compatible with the installed Node.js
   version and ensure npm audit has no unresolved high-severity issue.

Frontend commands must work from src/frontend/:

   npm install
   npm run build
   npm run dev

Environment requirements:

Create or preserve:

- src/.env.example as an index only;
- src/backend/.env.example for backend variables;
- src/frontend/.env.example for frontend variables.

Backend example variables:

APP_NAME=PortFlow AI API
APP_ENV=development
API_V1_PREFIX=/api/v1
DATABASE_URL=postgresql+psycopg://portflow:portflow@localhost:5432/portflow
CORS_ORIGINS=["http://localhost:5173"]
LOG_LEVEL=INFO

Frontend example variables:

VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_DEFAULT_PORT_ID=

Do not create real .env files for submission. Never insert production secrets,
IBM Cloud credentials, API keys, or personal tokens.

Root safeguards:

1. .python-version must contain 3.12.
2. .gitignore must exclude at least:

   - .env and environment variants;
   - node_modules/;
   - dist/;
   - .venv/;
   - __pycache__/;
   - .pytest_cache/;
   - generated ML artifacts;
   - generated raw/processed data while preserving intentional .gitkeep files;
   - local databases;
   - logs;
   - any legacy root frontend dependency cache.

3. Do not ignore src/ or required demo/presentation/Bob evidence directories.
4. README and docs/setup-guide.md must use the actual src/ commands.

Official submission safeguards:

- Preserve the official validator unchanged.
- Preserve submission.yaml and all required top-level template files.
- Keep the real demo-video placeholder until a human supplies a genuine public
  video URL; do not game the validator with "pending" or a fake URL.
- Use NOT DEPLOYED in demo/live-demo-url.txt until a real deployment exists.
- Do not create fake screenshots, a fake slide deck, or fake Bob exports.
- Do not commit, push, create/rename a GitHub repository, change visibility, or
  submit the organiser form in this plan.

Validation:

1. Inventory trackable files and confirm all application code is under src/.
2. Install or verify frontend dependencies.
3. Run npm audit and report exact findings.
4. Run npm run build and report the exact result.
5. Create/use a Python 3.12 virtual environment under src/.venv.
6. Install or verify backend dependencies.
7. Run pip check.
8. Run python -m pytest backend/tests -q from src/.
9. Start FastAPI temporarily and request /api/v1/health if safely possible.
10. Verify Python imports from src/.
11. Confirm no real .env or credential files are trackable.
12. Parse submission.yaml and confirm required fields are non-empty.
13. Confirm the only expected submission-validator blocker is the real manual
    artifact that has not yet been supplied, such as the demo video.
14. Run git diff --check and inspect git status for unrelated changes.

Do not implement:

- database ORM models or Alembic revisions;
- CRUD endpoints;
- authentication;
- CSV import;
- synthetic-data generator;
- ML features, training, inference, or artifacts;
- OR-Tools logic;
- alternate routing;
- operations-plan generation;
- IBM Bob MCP tools;
- charts or maps with invented data;
- deployment configuration.

After finishing, update:

- docs/AI_HANDOFF.md with changed files, commands, exact tests, known issues,
  contract changes, and recommended next task;
- docs/submission-readiness.md with the verified current state.

Return a concise completion report and stop. Do not begin Plan 3.
```

## Expected Result

The existing repository should remain recognisably the same project, but all trackable application code should be under `src/`, the FastAPI health endpoint should pass, the React shell should build, and the official submission structure should remain intact.

## Completion Checklist

- [ ] Plan 1 documents were read.
- [ ] Existing work was inspected before editing.
- [ ] Required top-level Bobathon paths exist.
- [ ] All trackable application code is under `src/`.
- [ ] No divergent source copy was overwritten silently.
- [ ] React uses TypeScript, Tailwind, and React Router.
- [ ] All seven placeholder routes render.
- [ ] Navigation is responsive and shows the active route.
- [ ] Empty states are honest; no operational results are fabricated.
- [ ] FastAPI imports and starts from `src/`.
- [ ] `/api/v1/health` returns the exact contract response.
- [ ] Backend health test passes on Python 3.12.
- [ ] Frontend production build passes.
- [ ] Dependency audit results are recorded.
- [ ] Environment examples exist and real `.env` files are ignored.
- [ ] Official validator is unchanged.
- [ ] Manual submission artifacts are not fabricated.
- [ ] `docs/AI_HANDOFF.md` and `docs/submission-readiness.md` are updated.

## Suggested Commit After Human Review

```bash
git add .
git commit -m "chore: align application skeleton with Bobathon template"
```

Do not commit generated dependencies, build output, virtual environments, caches, or real secrets. Do not begin Plan 3 until the backend test, frontend build, and repository-structure checks pass.
