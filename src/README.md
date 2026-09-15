# Source Code

All PortFlow AI application source code lives in this directory.

## Layout

```
src/
├── backend/          FastAPI application (Python 3.12)
│   ├── app/          Routes, schemas, services, core config
│   │   ├── api/      FastAPI routers (health, dashboard, schedules, resources, scenarios)
│   │   ├── schemas/  Pydantic request and response contracts
│   │   └── services/ Operational calculations & baseline_rule_v1 congestion engine
│   └── tests/        Pytest unit and API contract tests
├── database/         SQLAlchemy 2 models, session factory, Alembic migrations
├── frontend/         React 18 + TypeScript + Vite + Tailwind CSS operations workspace
│   ├── src/
│   │   ├── components/ Operational header, scenario selector, KPI cards, timeline chart, tables
│   │   ├── pages/      Live operations dashboard page
│   │   └── api/        Typed API client
│   └── src/test/     Vitest + Testing Library test suite
├── ml/               Training scripts, inference pipeline, and trained model artifacts
├── optimizer/        OR-Tools CP-SAT berth/crane solver (not implemented)
├── mcp-server/       IBM Bob MCP tool definitions (not implemented)
├── data/             Synthetic data generator and seed files
└── tests/            Cross-component integration tests
```

## Quick Start

See [../docs/setup-guide.md](../docs/setup-guide.md) for complete instructions.

```powershell
# Backend
cd src
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
python -m uvicorn backend.app.main:app --reload --port 8000

# Frontend (separate terminal)
cd src\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

## Implemented API Endpoints (`/api/v1`)

- `GET /health`: System liveness and component statuses.
- `GET /dashboard/summary`: Operational KPIs, berth occupancy, crane counts, peak risk, and average wait time.
- `GET /dashboard/congestion`: 72-hour congestion timeline partitioned into 12 six-hour buckets (`baseline_rule_v1`).
- `GET /schedules`: Vessel arrivals with physical berth compatibility and baseline impact analysis.
- `GET /resources/berths`: Berth dimensions, draft limits, and availability.
- `GET /resources/cranes`: Crane throughputs and assignment status.
- `GET /scenarios`: Synthetic operational scenarios (`baseline`, `arrival_surge`, `crane_outage`, `berth_closure`, `handling_slowdown`).
- `POST /predictions/waiting-time`: ML waiting-time prediction (GradientBoostingRegressor, MAE ≈23 min).
- `POST /predictions/congestion`: ML congestion probability prediction (GradientBoostingClassifier, ROC-AUC 0.79).

## Testing and Verification

```powershell
# Backend unit & API tests (24 passed)
cd src
python -m pytest backend/tests -v -m "not integration"

# Frontend component & integration tests (5 passed)
cd src\frontend
npm test

# Frontend production build (0 errors)
cd src\frontend
npm run build
```

## Synthetic Data & Heuristic Baseline Notice

All demonstration records are synthetic. Congestion forecasts are calculated deterministically using `baseline_rule_v1` without claiming machine learning or statistical confidence.
