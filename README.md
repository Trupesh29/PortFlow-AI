# PortFlow AI

> Predict congestion early. Re-plan port operations before queues form.

PortFlow AI is an AI-assisted decision-support system for container-terminal shift supervisors. It combines a 72-hour congestion forecast, vessel waiting-time prediction, joint berth-and-crane optimisation, and explainable recommendations in one operational workspace.

## Team. 

| Field | Value |
|---|---|
| Team name | PortFlow AI |
| Track | AI |
| Team lead | Trupesh |
| Project | L1 - Container Congestion Predictor & Port Operations Optimiser |

## Problem Statement

Container-terminal supervisors often coordinate vessel arrivals, berth availability, and crane allocation in separate spreadsheets. Congestion is therefore recognised after queues form, causing avoidable waiting time, overtime, and schedule disruption.

## Solution

PortFlow AI turns vessel schedules and terminal-capacity data into an actionable 72-hour plan. The system is designed to predict congestion risk, estimate vessel waiting time, compute feasible berth-and-crane assignments, compare alternate-port options, and explain the recommended actions through an IBM Bob-accessible MCP interface.

## Key Features

- Congestion-risk and vessel waiting-time prediction from reproducible operational data.
- Joint berth-and-crane optimisation with hard physical and availability constraints.
- Before/after operational metrics so a supervisor can verify the benefit of a plan.
- Human confirmation for routing changes and final plan approval.
- IBM Bob workflow evidence in `bob_sessions/` and an MCP integration surface for explainable operations.

## Current Build Status

The repository contains the contract-first architecture, a working FastAPI backend, and a fully functional React operations shell.

| Component | Status |
|---|---|
| FastAPI backend + health endpoint | ✅ Complete |
| React dashboard with 5 scenario simulator | ✅ Complete |
| 72-hour baseline congestion forecast (`baseline_rule_v1`) | ✅ Complete |
| ML waiting-time prediction (GradientBoostingRegressor) | ✅ Complete |
| ML congestion prediction (GradientBoostingClassifier) | ✅ Complete |
| Berth/crane resources and vessel schedules APIs | ✅ Complete |
| Operations Plan approval workflow (UI) | ✅ Complete (static demo) |
| Joint Berth & Crane Optimizer (UI) | ✅ Complete (static demo) |
| OR-Tools CP-SAT runtime optimizer | 🔄 Not implemented |
| IBM Bob MCP tool server | 🔄 Not implemented |
| PostgreSQL production data persistence | 🔄 Optional (synthetic fallback active) |
| Demo video | ⏳ Pending recording |

## Tech Stack

| Category | Technologies |
|---|---|
| Languages | Python 3.12, TypeScript |
| Frameworks | FastAPI, React, Vite, Tailwind CSS |
| AI and optimisation | scikit-learn or XGBoost, OR-Tools CP-SAT |
| IBM technology | IBM Bob IDE, IBM Bob MCP integration |
| Database | PostgreSQL with SQLAlchemy 2 |
| Quality | Pytest, TypeScript compiler, GitHub Actions |

## Repository Structure

```text
.
|-- submission.yaml            # Evaluator metadata
|-- src/                       # All application source code
|   |-- backend/               # FastAPI modular monolith
|   |-- frontend/              # React operations workspace
|   |-- database/              # SQLAlchemy models and Alembic migrations
|   |-- ml/                    # Training scripts and inference pipeline
|   |-- optimizer/             # OR-Tools CP-SAT berth/crane solver
|   |-- mcp-server/            # IBM Bob MCP tool definitions
|   |-- data/                  # Synthetic data generator and seed files
|   |-- tests/                 # Cross-component integration tests
|   |-- README.md              # src/ layout guide
|   `-- .env.example           # Environment variable reference
|-- docs/                      # Problem, solution, architecture, setup, contracts
|-- demo/                      # Demo URL, video URL, and screenshots
|-- presentation/              # Final pitch deck
|-- bob_sessions/              # Exported IBM Bob histories and usage screenshots
`-- .github/workflows/         # Official submission validator
```

## How to Run

### Backend

```powershell
cd src
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
python -m uvicorn backend.app.main:app --reload --port 8000
```

Verify: `http://localhost:8000/api/v1/health`

Expected response:

```json
{
  "status": "healthy",
  "service": "portflow-api",
  "version": "0.1.0"
}
```

### Frontend

```powershell
cd src\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open: `http://localhost:5173`

For prerequisites, tests, environment variables, and troubleshooting, see [docs/setup-guide.md](docs/setup-guide.md).

## Demo and Evidence

- Demo video: [demo/demo-video-link.txt](demo/demo-video-link.txt)
- Live application: [demo/live-demo-url.txt](demo/live-demo-url.txt)
- Screenshots: [demo/screenshots/](demo/screenshots/)
- Presentation: [presentation/](presentation/)
- IBM Bob task reports: [bob_sessions/](bob_sessions/)

## Known Limitations

- The OR-Tools CP-SAT berth/crane optimizer and IBM Bob MCP tools are not implemented; the Optimizer and Operations Plan pages show a static demo.
- Demo data is entirely synthetic and reproducible (seed 2026); no confidential or client port data is used.
- The MVP targets one terminal and does not ingest live AIS or IoT feeds.
- Plan approval and routing changes always require an explicit human decision.
- PostgreSQL is optional; the application falls back to synthetic data when the database is unavailable.

## What We Are Most Proud Of

The design goes beyond showing a risk score: it connects prediction to a constraint-aware operational action, quantifies the expected improvement, and keeps the supervisor in control of consequential decisions.

## Hackathon Submission Window

The organiser email states that first-round submissions are accepted only on **15 September 2026 from 12:00 PM to 11:45 PM**. The team must confirm the organiser's timezone, obtain a green GitHub Actions validation, and submit the public repository URL before the window closes.
