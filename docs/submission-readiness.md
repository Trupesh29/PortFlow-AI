# Bobathon Submission Readiness

## Official Requirements Applied

- Public repository created using the official template, not a fork.
- Repository name: `bob-ai-hackathon-portflow-ai`.
- All project code under `src/`.
- Required root `submission.yaml`, README, documentation, demo, presentation, and validator paths preserved.
- Relevant IBM Bob IDE task reports and usage screenshots stored in `bob_sessions/`.
- No credentials, client data, personal information, confidential data, or social-media data committed.

## Current Status — 13 September 2026

| Area | Status | Evidence or next action |
|---|---|---|
| Problem selection | Complete | L1 Port Congestion Predictor and Operations Optimiser |
| Official local structure | Complete | All app code under `src/`; `src/README.md` and `src/.env.example` present |
| Application skeleton | Complete | FastAPI health endpoint and React shell verified |
| Database foundation | Implemented for MVP tables | Apply `alembic -c database/alembic.ini upgrade head` on a non-production PostgreSQL database |
| Synthetic dataset | Implemented and tested | Use `python -m data.generate_synthetic`; all output is fictional and seed-driven |
| Dashboard slice & Baseline congestion | Complete | Working end-to-end FastAPI summary/congestion (`baseline_rule_v1`) + React dashboard with 5 scenarios |
| ML prediction | Complete | `GradientBoostingRegressor` (MAE 23.5 min) + `GradientBoostingClassifier` (ROC-AUC 0.79) in `src/ml/`; `POST /predictions/waiting-time` and `POST /predictions/congestion` live; React Predictions page |
| Optimiser | Not started | Add runtime CP-SAT assignments in `src/optimizer/` |
| IBM Bob MCP tools | Not started | Add safe read/explanation tools in `src/mcp-server/` after APIs exist |
| Demo deployment | Not started | Add URL or record local demo |
| Demo video | Blocked on working journey | Replace placeholder in `demo/demo-video-link.txt` |
| Screenshots | Blocked on working UI | Add at least three final-state images to `demo/screenshots/` |
| Presentation | Not started | Add `presentation/slides.pdf` or `.pptx` |
| Bob session evidence | Requires IBM Bob IDE | Export real histories and usage screenshots to `bob_sessions/` |
| GitHub template repository | Requires GitHub action | Create public repo with official template; name: `bob-ai-hackathon-portflow-ai` |
| GitHub validation | Blocked by demo video link | Confirm green after video URL is added |
| Submission form | Time-gated | Submit 15 September 2026, 12:00 PM–11:45 PM |

## Deadline Priorities

1. Create the correctly named public repository from the official template and connect this workspace to it.
2. Implement one polished end-to-end journey: scenario load -> prediction -> optimisation -> approved plan.
3. Use IBM Bob IDE for meaningful implementation/review tasks and export the required evidence.
4. Record the demo and capture screenshots only after the journey is stable.
5. Add the deck, run the validator, test all public links in a signed-out browser, and submit early in the allowed window.

## Manual Information to Confirm

- Final team name and all member names/emails.
- Whether `PortFlow AI` is the desired team name as well as the project name.
- Organiser timezone for the submission window.
- Final public repository, deployed application, demo video, and slide-deck links.
