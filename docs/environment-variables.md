# Environment variables

The backend reads `.env` relative to its working directory. From `src/`, copy `src/.env.example` to `.env`, or pass `--env-file backend/.env` to uvicorn. Frontend variables belong in `src/frontend/.env`.

| Variable | Component | Purpose/default |
|---|---|---|
| APP_NAME | Backend | API display name; PortFlow AI API |
| APP_ENV | Backend | development; guards database reset |
| API_V1_PREFIX | Backend | /api/v1 |
| VERSION | Backend | 0.1.0 |
| SERVICE_NAME | Backend | portflow-api |
| DATABASE_URL | Backend | Optional local PostgreSQL connection |
| CORS_ORIGINS | Backend | JSON browser origins; http://localhost:5173 |
| LOG_LEVEL | Backend | INFO |
| SYNTHETIC_DATA_SEED | Backend | 2026 |
| VITE_API_BASE_URL | Frontend | http://localhost:8000/api/v1 |

`VITE_DEFAULT_PORT_ID` is currently unused. Models live at `src/ml/artifacts/`; no LLM or MCP variable is implemented. Retrain after changing scikit-learn versions. Never commit real `.env` files.
