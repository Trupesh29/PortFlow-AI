# Setup Guide

This guide starts the current PortFlow AI application skeleton on Windows PowerShell. The same Python and npm commands work on macOS/Linux after using the platform's virtual-environment activation command.

## Prerequisites

- Git
- Python 3.12
- Node.js 18 or newer; Node.js 20 is recommended
- npm
- PostgreSQL 15 or newer for database phases; it is not required for the current health check
- IBM Bob IDE with the hackathon-provisioned account for Bob-assisted tasks and report export

## 1. Clone

The final public repository must be created with **Use this template** from the official Bobathon template and named `bob-ai-hackathon-portflow-ai`.

```powershell
git clone https://github.com/Trupesh29/bob-ai-hackathon-portflow-ai.git
cd bob-ai-hackathon-portflow-ai
```

## 2. Backend

Run the backend from `src/` because its imports use `backend.app`.

```powershell
cd src
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
python -m uvicorn backend.app.main:app --reload --port 8000
```

Open `http://localhost:8000/api/v1/health`. The expected response is:

```json
{
  "status": "healthy",
  "service": "portflow-api",
  "version": "0.1.0"
}
```

API documentation is available at `http://localhost:8000/docs`.

## 3. Frontend

Open another PowerShell terminal:

```powershell
cd src\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## 4. Environment Variables

Backend variables are documented in `src/backend/.env.example`:

| Variable | Purpose | Development value |
|---|---|---|
| `APP_NAME` | API display name | `PortFlow AI API` |
| `APP_ENV` | Runtime environment | `development` |
| `API_V1_PREFIX` | API prefix | `/api/v1` |
| `DATABASE_URL` | PostgreSQL connection URL | Local non-production URL |
| `CORS_ORIGINS` | Allowed browser origins | `http://localhost:5173` |
| `LOG_LEVEL` | Application log level | `INFO` |

Frontend variables are documented in `src/frontend/.env.example`:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL for API calls |
| `VITE_DEFAULT_PORT_ID` | Optional default terminal identifier |

Never commit `backend/.env`, `frontend/.env`, IBM Cloud credentials, or API keys.

## 5. Tests and Build

Backend:

```powershell
cd src
python -m pytest backend\tests -q
```

This runs the health-check unit test. Expected output:

```
.
1 passed in ...s
```

Frontend:

```powershell
cd src\frontend
npm run build
```

## 6. Submission Validation

Every push triggers `.github/workflows/validate.yml`. On GitHub, open **Actions**, select **Validate Submission**, and confirm the latest run is green.

The action stays red until `demo/demo-video-link.txt` contains the real public video URL. Before submission, also verify at least three screenshots, the presentation, all Bob session reports, and the public repository visibility.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `No module named backend` | Backend started from the wrong folder | Change to `src/` and run `python -m uvicorn backend.app.main:app` |
| PowerShell blocks activation | Local execution policy | Run the interpreter directly as `.\.venv\Scripts\python.exe -m ...` |
| Browser reports a CORS error | Frontend URL is not allowed | Match `CORS_ORIGINS` to the actual Vite origin |
| Port 8000 or 5173 is busy | Another development server is running | Stop that server or choose another port and update the frontend API URL |
| GitHub validation fails on video | Placeholder is still present | Add a viewable YouTube, Loom, Box, or Google Drive link |
| Database connection fails | PostgreSQL is not running or URL is wrong | Start PostgreSQL and check `DATABASE_URL`; the current health endpoint itself does not require PostgreSQL |
