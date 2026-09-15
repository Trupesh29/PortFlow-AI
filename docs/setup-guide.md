# Setup Guide

This guide starts the PortFlow AI application on Windows PowerShell. The same Python and npm commands work on macOS/Linux after using the platform's virtual-environment activation command.

## Prerequisites

- Git
- Python 3.12 (or compatible 3.12+)
- Node.js matching the installed Vite engine requirement (Node.js 22.12+ recommended; verify `node --version`)
- npm
- PostgreSQL 15+ is optional for this demo; the API uses synthetic data when unavailable
- IBM Bob IDE is needed for genuine Bob work and judging evidence; it is not required to run the current application

## 1. Clone

The final public repository must be created with **Use this template** from the official Bobathon template and named `bob-ai-hackathon-the-watson-four` for team The Watson Four. The project name remains PortFlow AI.

```powershell
git clone https://github.com/Trupesh29/PortFlow-AI.git
cd PortFlow-AI
```

The current repository URL above is verified. Before final submission, confirm the guide's required repository naming and template creation.

## Environment reference

See [environment-variables.md](environment-variables.md) for every implemented variable and its purpose. `--env-file backend/.env` below ensures the copied backend file is actually loaded.

## 2. Backend

Run the backend from `src/` because its imports use `backend.app`.

```powershell
cd src
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
python -m ml.train
python -m uvicorn backend.app.main:app --env-file backend/.env --reload --port 8000
```

Verify backend endpoints:

- Health: `http://localhost:8000/api/v1/health`
- Summary KPIs: `http://localhost:8000/api/v1/dashboard/summary?port_code=PFA`
- Congestion Forecast (72h): `http://localhost:8000/api/v1/dashboard/congestion?port_code=PFA`
- Schedules: `http://localhost:8000/api/v1/schedules?port_code=PFA`
- Berths: `http://localhost:8000/api/v1/resources/berths?port_code=PFA`
- Cranes: `http://localhost:8000/api/v1/resources/cranes?port_code=PFA`
- Scenarios: `http://localhost:8000/api/v1/scenarios`

API documentation is available at `http://localhost:8000/docs`.

## 3. Frontend

Open another PowerShell terminal:

```powershell
cd src\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173` to access the live operations dashboard.

## 4. Operational Baseline Calculation Method (`baseline_rule_v1`)

The dashboard features a deterministic heuristic baseline calculation engine (`baseline_rule_v1`):

1. **Horizon Partitioning**: The requested horizon (default 72 hours) is divided into 12 six-hour windows $[t_{\text{start}}, t_{\text{end}})$.
2. **Demand Input**: Scheduled vessel arrivals and container move demand within the window.
3. **Resource Capacity**: Open berths and available quay cranes adjusted for the active scenario (e.g. Quay B3 closed in `berth_closure`, QC06/07 offline in `crane_outage`, 35% productivity drop in `handling_slowdown`).
4. **Physical Compatibility**: Verification that vessel draft $\le$ berth max draft and vessel length $\le$ berth max length.
5. **Pressure Formulation**:
   $$R_{\text{berth}} = \frac{\text{arrivals}}{\max(1, \text{available\_berths})}$$
   $$R_{\text{workload}} = \frac{\text{moves}}{\max(1, \text{crane\_moves\_throughput\_6h})}$$
   $$\text{Score } S = 0.45 \cdot \min(2.5, R_{\text{berth}}) + 0.35 \cdot \min(2.5, R_{\text{workload}}) + \text{bottleneck\_penalty}$$
   $$\text{Risk Probability} = \min(1.0, \max(0.0, \text{round}(S / 1.75, 2)))$$
6. **Risk Categorization**:
   - `LOW`: $< 0.40$
   - `MEDIUM`: $0.40 - 0.70$
   - `HIGH`: $0.70 - 0.90$
   - `CRITICAL`: $\ge 0.90$

> [!NOTE]
> `baseline_rule_v1` is a deterministic heuristic baseline, not a trained-model probability. Trained models are connected separately on the Congestion & Wait page. Retrain with `python -m ml.train` after installing dependencies so serialized models match your scikit-learn version.

## 5. Synthetic Data Disclosure

All vessel schedules, port geometries, and crane productivities are fictional and generated reproducibly with seed `2026`. No confidential, client, or live AIS port feeds are used. Responses explicitly return `is_synthetic: true`.

## 6. Database and Synthetic Scenarios

After PostgreSQL is running and `DATABASE_URL` is set in `src/backend/.env`:

```powershell
cd src
alembic -c database/alembic.ini upgrade head
python -m data.seed_database
python -m data.generate_synthetic
```

The seed is deterministic, idempotent, and fictional. `--reset` is guarded to development/test/local environments. Supported scenarios: `baseline`, `arrival_surge`, `crane_outage`, `berth_closure`, and `handling_slowdown`.

## 7. Tests and Verification

Backend unit and API tests:

```powershell
cd src
python -m pytest backend\tests -v -m "not integration"
```

Frontend unit and component tests:

```powershell
cd src\frontend
npm test
```

Frontend production build:

```powershell
cd src\frontend
npm run build
```

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `No module named backend` | Backend started from the wrong folder | Change to `src/` and run `python -m uvicorn backend.app.main:app` |
| PowerShell blocks activation | Local execution policy | Run the interpreter directly as `.\.venv\Scripts\python.exe -m ...` |
| Browser reports a CORS error | Frontend URL is not allowed | Match `CORS_ORIGINS` to the actual Vite origin |
| Port 8000 or 5173 is busy | Another development server is running | Stop that server or choose another port and update the frontend API URL |
| Database connection fails | PostgreSQL is not running | Start PostgreSQL or verify `DATABASE_URL` |
