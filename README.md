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

The repository currently contains the contract-first architecture, a working FastAPI health endpoint, and a responsive React operations shell. Prediction, optimisation, production data persistence, and the MCP tool implementation remain in progress and must not yet be represented as complete in the demo.

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
|   |-- frontend/              # React operations workspace
|   |-- backend/               # FastAPI application
|   |-- database/              # Database models and migrations
|   |-- ml/                    # Training and inference
|   |-- optimizer/             # Berth/crane solver
|   `-- mcp-server/            # IBM Bob MCP tools
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

- The repository is in active hackathon development; the ML model and optimiser are not implemented yet.
- Demo data will be synthetic and reproducible because no confidential or client port data is used.
- The MVP targets one terminal and does not ingest live AIS or IoT feeds.
- Routing and plan approval always require a human decision.

## What We Are Most Proud Of

The design goes beyond showing a risk score: it connects prediction to a constraint-aware operational action, quantifies the expected improvement, and keeps the supervisor in control of consequential decisions.

## Hackathon Submission Window

The organiser email states that first-round submissions are accepted only on **15 September 2026 from 12:00 PM to 11:45 PM**. The team must confirm the organiser's timezone, obtain a green GitHub Actions validation, and submit the public repository URL before the window closes.
