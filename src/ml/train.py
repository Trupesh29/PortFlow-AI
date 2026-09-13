"""Offline model training script for PortFlow AI.

Usage (from the src/ directory):
    python -m ml.train

Note: On Windows, run with UTF-8 mode if needed:
    set PYTHONUTF8=1 && python -m ml.train

What this does:
1. Generates the 5 synthetic scenarios via generate_synthetic.py.
2. Merges all scenario datasets into one training DataFrame.
3. Engineers features via ml.features.
4. Trains two scikit-learn pipelines:
   - GradientBoostingRegressor  → waiting_time_v1.joblib
   - GradientBoostingClassifier → congestion_v1.joblib
5. Evaluates both models (MAE/RMSE for regression, ROC-AUC/F1 for classifier).
6. Writes artifacts to ml/artifacts/.
7. Prints a concise evaluation report.

All data is entirely synthetic and fictional. No real port data is used.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# Ensure src/ is on the path when called via `python -m ml.train`
SRC_DIR = Path(__file__).resolve().parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

import numpy as np
import joblib

from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    mean_absolute_error,
    root_mean_squared_error,
    roc_auc_score,
    f1_score,
)

from data.generate_synthetic import generate_dataset, SCENARIOS
from ml.features import FEATURE_NAMES, build_feature_matrix

ARTIFACTS_DIR = Path(__file__).parent / "artifacts"
WAITING_TIME_MODEL_PATH = ARTIFACTS_DIR / "waiting_time_v1.joblib"
CONGESTION_MODEL_PATH = ARTIFACTS_DIR / "congestion_v1.joblib"

MODEL_META_PATH = ARTIFACTS_DIR / "model_meta.json"

RANDOM_STATE = 2026


def _collect_training_data() -> tuple[list[dict], dict[str, dict], list[dict], list[dict]]:
    """Merge all 5 scenarios into a single training corpus.

    Returns (schedules_with_targets, vessels_by_imo, berths, cranes).
    Schedules are enriched with `waiting_minutes` from historical_operations.
    """
    all_schedules: list[dict] = []
    vessels_by_imo: dict[str, dict] = {}
    berths: list[dict] = []
    cranes: list[dict] = []

    for scenario in SCENARIOS:
        ds = generate_dataset(seed=2026, scenario=scenario)

        # Build vessel lookup
        for v in ds["vessels"]:
            vessels_by_imo[v["imo_number"]] = v

        # Use the first scenario's berths/cranes as the representative snapshot
        if not berths:
            berths = ds["berths"]
            cranes = ds["cranes"]

        # Enrich schedules with waiting_minutes from historical_operations
        ops_by_idx = {op["schedule_index"]: op for op in ds["historical_operations"]}
        for i, sched in enumerate(ds["vessel_schedules"]):
            enriched = dict(sched)
            op = ops_by_idx.get(i)
            if op:
                enriched["waiting_minutes"] = op.get("waiting_minutes", 0)
                enriched["service_minutes"] = op.get("service_minutes", 0)
            else:
                enriched["waiting_minutes"] = 0
            all_schedules.append(enriched)

    return all_schedules, vessels_by_imo, berths, cranes


def train() -> None:
    """Run the full training pipeline and persist model artifacts."""
    print("=" * 60)
    print("PortFlow AI — ML Training Pipeline (Phase 7)")
    print("=" * 60)

    # ── 1. Collect data ────────────────────────────────────────────
    print("\n[1/5] Generating synthetic training data …")
    schedules, vessels_by_imo, berths, cranes = _collect_training_data()
    print(f"      Loaded {len(schedules)} schedule rows from {len(SCENARIOS)} scenarios.")

    # ── 2. Feature engineering ─────────────────────────────────────
    print("[2/5] Engineering features …")
    X, y_wait, y_cong = build_feature_matrix(schedules, vessels_by_imo, berths, cranes)
    assert y_wait is not None and y_cong is not None, "Targets missing — check data."

    print(f"      X shape: {X.shape}  |  features: {len(FEATURE_NAMES)}")
    print(f"      Waiting-time range: [{y_wait.min():.0f}, {y_wait.max():.0f}] minutes")
    print(f"      Congested (label=1): {y_cong.sum()} / {len(y_cong)} rows "
          f"({100 * y_cong.mean():.1f}%)")

    X_train, X_test, yw_train, yw_test, yc_train, yc_test = train_test_split(
        X, y_wait, y_cong, test_size=0.20, random_state=RANDOM_STATE, stratify=y_cong
    )

    # ── 3. Train waiting-time regressor ────────────────────────────
    print("\n[3/5] Training waiting-time regressor …")
    reg_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("gbr", GradientBoostingRegressor(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=4,
            min_samples_split=4,
            random_state=RANDOM_STATE,
            subsample=0.85,
        )),
    ])
    reg_pipeline.fit(X_train, yw_train)
    yw_pred = reg_pipeline.predict(X_test)
    yw_pred_clipped = np.clip(yw_pred, 0, None)  # waiting time can't be negative
    mae = mean_absolute_error(yw_test, yw_pred_clipped)
    rmse = root_mean_squared_error(yw_test, yw_pred_clipped)
    cv_mae = -cross_val_score(reg_pipeline, X, y_wait, cv=5,
                              scoring="neg_mean_absolute_error").mean()
    print(f"      Test  MAE : {mae:.2f} min  |  RMSE: {rmse:.2f} min")
    print(f"      5-fold CV MAE: {cv_mae:.2f} min")

    # Feature importances
    gbr = reg_pipeline.named_steps["gbr"]
    importances_reg = dict(zip(FEATURE_NAMES, gbr.feature_importances_))
    top_reg = sorted(importances_reg.items(), key=lambda x: x[1], reverse=True)[:5]
    print("      Top 5 features:", ", ".join(f"{k}({v:.3f})" for k, v in top_reg))

    # ── 4. Train congestion classifier ────────────────────────────
    print("\n[4/5] Training congestion classifier …")
    clf_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("gbc", GradientBoostingClassifier(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=4,
            min_samples_split=4,
            random_state=RANDOM_STATE,
            subsample=0.85,
        )),
    ])
    clf_pipeline.fit(X_train, yc_train)
    yc_prob = clf_pipeline.predict_proba(X_test)[:, 1]
    yc_pred = clf_pipeline.predict(X_test)
    auc = roc_auc_score(yc_test, yc_prob)
    f1 = f1_score(yc_test, yc_pred, zero_division=0)
    cv_auc = cross_val_score(clf_pipeline, X, y_cong, cv=5,
                             scoring="roc_auc").mean()
    print(f"      Test  ROC-AUC: {auc:.4f}  |  F1: {f1:.4f}")
    print(f"      5-fold CV AUC: {cv_auc:.4f}")

    gbc = clf_pipeline.named_steps["gbc"]
    importances_clf = dict(zip(FEATURE_NAMES, gbc.feature_importances_))
    top_clf = sorted(importances_clf.items(), key=lambda x: x[1], reverse=True)[:5]
    print("      Top 5 features:", ", ".join(f"{k}({v:.3f})" for k, v in top_clf))

    # ── 5. Persist artifacts ───────────────────────────────────────
    print("\n[5/5] Persisting model artifacts …")
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(reg_pipeline, WAITING_TIME_MODEL_PATH)
    joblib.dump(clf_pipeline, CONGESTION_MODEL_PATH)

    meta = {
        "waiting_time_model": {
            "version": "waiting_time_v1",
            "algorithm": "GradientBoostingRegressor",
            "sklearn_version": __import__("sklearn").__version__,
            "n_training_rows": len(X_train),
            "test_mae_minutes": round(mae, 3),
            "test_rmse_minutes": round(rmse, 3),
            "cv5_mae_minutes": round(cv_mae, 3),
            "feature_importances": {k: round(v, 5) for k, v in importances_reg.items()},
            "data_source": "synthetic",
            "trained_at_utc": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        },
        "congestion_model": {
            "version": "congestion_v1",
            "algorithm": "GradientBoostingClassifier",
            "sklearn_version": __import__("sklearn").__version__,
            "n_training_rows": len(X_train),
            "test_roc_auc": round(auc, 5),
            "test_f1": round(f1, 5),
            "cv5_roc_auc": round(cv_auc, 5),
            "congestion_threshold_minutes": 30,
            "feature_importances": {k: round(v, 5) for k, v in importances_clf.items()},
            "data_source": "synthetic",
            "trained_at_utc": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        },
        "feature_names": FEATURE_NAMES,
        "scenarios_used": list(SCENARIOS),
        "total_training_rows": len(schedules),
    }
    MODEL_META_PATH.write_text(json.dumps(meta, indent=2), encoding="utf-8")

    print(f"      [OK] {WAITING_TIME_MODEL_PATH.name}  ({WAITING_TIME_MODEL_PATH.stat().st_size // 1024} KB)")
    print(f"      [OK] {CONGESTION_MODEL_PATH.name}    ({CONGESTION_MODEL_PATH.stat().st_size // 1024} KB)")
    print(f"      [OK] {MODEL_META_PATH.name}")

    print("\n" + "=" * 60)
    print("Training complete.  Next:")
    print("  python -m uvicorn backend.app.main:app --port 8000")
    print("  POST /api/v1/predictions/waiting-time")
    print("  POST /api/v1/predictions/congestion")
    print("=" * 60)


if __name__ == "__main__":
    train()
