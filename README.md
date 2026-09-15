# PortFlow AI

> Predict congestion early. Re-plan port operations before queues form.

PortFlow AI is a decision-support prototype for container-terminal shift supervisors. It provides a 72-hour baseline congestion forecast, trained ML congestion and waiting-time predictions, and five scenario simulations. Optimizer, plan approval, and Copilot pages demonstrate the proposed workflow with static data.

## Team. 

| Field | Value |
|---|---|
| Team name | The Watson Four |
| Track | AI |
| Team lead | Deep Makwana |
| Lead email | 24dcs048@charusat.edu.in |
| Members | Manav Kansagara, Smit Kansagara, Trupesh Hingrajiya |
| Project | L1 - Container Congestion Predictor & Port Operations Optimiser |

## Problem Statement

Container-terminal supervisors often coordinate vessel arrivals, berth availability, and crane allocation in separate spreadsheets. Congestion is therefore recognised after queues form, causing avoidable waiting time, overtime, and schedule disruption.

## Solution

PortFlow AI uses schedules and capacity data to calculate congestion pressure and estimate waiting time. Supervisors can compare five synthetic scenarios and request trained predictions. Runtime optimisation, alternate routing, and Bob MCP integration are planned extensions.

## Key Features

- Interactive 72-hour dashboard using `baseline_rule_v1`.
- Five reproducible operational disruption scenarios.
- Trained Gradient Boosting waiting-time and congestion predictions.
- API-backed schedules, berth compatibility, and crane availability.
- Static demo interfaces for berth layout and supervisor plan review.

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
| AI | scikit-learn Gradient Boosting, joblib, NumPy |
| Planned integrations | OR-Tools CP-SAT and IBM Bob MCP; not implemented |
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
python -m ml.train
python -m uvicorn backend.app.main:app --env-file backend/.env --reload --port 8000
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

Submission audit: [docs/submission-readiness.md](docs/submission-readiness.md). Video script: [demo/recording-script.md](demo/recording-script.md). Deck: [presentation/slides.pptx](presentation/slides.pptx).

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

Our strongest implemented work is the reproducible scenario dashboard and trained prediction pipeline. Supervisors can inspect capacity pressure and request actual model outputs, with clear synthetic-data and implementation disclosures.

## Hackathon Submission Window

The organiser email states that first-round submissions are accepted only on **15 September 2026 from 12:00 PM to 11:45 PM**. The team must confirm the organiser's timezone, obtain a green GitHub Actions validation, and submit the public repository URL before the window closes.
