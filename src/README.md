# Source Code

All PortFlow AI application source code lives in this directory.

## Layout

```
src/
├── backend/          FastAPI application (Python 3.12)
│   ├── app/          Routes, schemas, services, core config
│   └── tests/        Pytest unit and integration tests
├── database/         SQLAlchemy base, session factory, Alembic migrations
├── frontend/         React + TypeScript + Vite + Tailwind CSS workspace
├── ml/               Training scripts and inference pipeline
├── optimizer/        OR-Tools CP-SAT berth/crane solver
├── mcp-server/       IBM Bob MCP tool definitions
├── data/             Synthetic data generator and seed files
└── tests/            Cross-component integration tests
```

## Quick Start

See [../docs/setup-guide.md](../docs/setup-guide.md) for the complete,
step-by-step instructions. A condensed version:

```powershell
# Backend
cd src
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000

# Frontend (separate terminal)
cd src\frontend
npm install
npm run dev
```

## Environment Variables

Copy the example files before running:

```powershell
Copy-Item src\backend\.env.example src\backend\.env
Copy-Item src\frontend\.env.example src\frontend\.env
```

Never commit `.env` files. All required variables and their descriptions are
documented in `backend/.env.example` and `frontend/.env.example`.
