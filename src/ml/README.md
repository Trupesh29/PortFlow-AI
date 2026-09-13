# ML Module — PortFlow AI

This directory contains the machine learning training pipeline, feature engineering, inference registry, and model artifacts for PortFlow AI.

## Model Overview

| Model | Algorithm | Version | Target | Metric |
|---|---|---|---|---|
| Waiting-Time Regressor | `GradientBoostingRegressor` | `waiting_time_v1` | `waiting_minutes` | MAE 23.5 min, RMSE 27.0 min |
| Congestion Classifier | `GradientBoostingClassifier` | `congestion_v1` | `congestion_label` (≥30 min wait) | ROC-AUC 0.79, F1 0.79 |

All models are trained on **synthetic, fictional port data only** (seed=2026, 180 rows across 5 scenarios). No real port or vessel data is used.

## Feature Vector (16 numeric features)

| Feature | Description |
|---|---|
| `vessel_draft_m` | Vessel draft in metres |
| `vessel_length_m` | Vessel LOA in metres |
| `vessel_beam_m` | Vessel beam in metres |
| `vessel_capacity_teu` | TEU capacity |
| `expected_containers` | Container moves expected |
| `priority` | Schedule priority (1–5) |
| `hour_of_day` | UTC hour of ETA |
| `day_of_week` | UTC weekday of ETA (0=Mon) |
| `concurrent_arrivals_6h` | Vessels arriving within ±3 h |
| `available_berths` | Berths with `status == 'available'` |
| `compatible_berths` | Berths satisfying draft + length |
| `compatible_ratio` | `compatible_berths / available_berths` |
| `available_cranes` | Cranes with `status == 'available'` |
| `crane_total_mph` | Sum moves/hour of available cranes |
| `berth_pressure` | `concurrent_arrivals / available_berths` |
| `workload_pressure` | `expected_containers / (crane_mph × 6)` |

## Files

```
ml/
  features.py        # Feature engineering (shared: training + inference)
  train.py           # Offline training script
  inference.py       # ModelRegistry singleton (lazy loader)
  artifacts/
    waiting_time_v1.joblib   # 285 KB — waiting-time regression pipeline
    congestion_v1.joblib     # 246 KB — congestion classification pipeline
    model_meta.json          # Training metadata, importances, metrics
```

## Training

```powershell
# From src/ directory
python -m ml.train
```

Outputs metrics, top feature importances, and writes artifacts to `ml/artifacts/`.

## API Endpoints (after training)

```
POST /api/v1/predictions/waiting-time
POST /api/v1/predictions/congestion
```

Both endpoints return HTTP 503 with `error: model_unavailable` if artifacts are missing.

## Congestion Labelling Rule

`congestion_label = 1` if `waiting_minutes >= 30`, else 0.  
Threshold chosen to match operational definition of a congestion event.

## Scenarios Used in Training

- `baseline` — standard arrivals
- `arrival_surge` — clustered arrivals
- `crane_outage` — 2 cranes offline
- `berth_closure` — 1 berth closed
- `handling_slowdown` — 35% productivity reduction
