# Solution Overview

## Core mechanism

PortFlow AI combines schedule visibility, terminal capacity, deterministic scenario calculations, and trained machine-learning inference in one supervisor workspace.

The dashboard aggregates the next 72 hours into six-hour windows. Arrival density, expected workload, berth compatibility, and crane capacity drive its transparent baseline calculation. Five seeded scenarios make disruptions reproducible.

A separate prediction page calls trained Gradient Boosting models for vessel waiting time and hourly congestion probability. These are actual runtime model outputs, trained on 180 synthetic rows across five scenarios. They are not validated real-port forecasts.

## Design decisions

- A modular FastAPI backend keeps services and validation together for a small prototype.
- Seeded synthetic data allows a judge to reproduce the demo without private data or a live database.
- The dashboard baseline is explicitly separate from ML inference, so users can identify the calculation method.
- Model artifacts and metadata support reproducibility; retraining matches the installed scikit-learn version.
- Resource and schedule views expose practical berth restrictions alongside forecasts.

## User journey

Open the dashboard, switch to Arrival Surge or Crane Outage, inspect the changed capacity-pressure view, then select a vessel on Congestion & Wait and request waiting-time and congestion predictions. This is the working end-to-end recording journey.

## Proposed planning workflow

Optimizer, operations-plan, map, and Copilot pages demonstrate the intended interface with static content. Runtime scheduling, alternate routing, persisted approvals, and live IBM Bob MCP explanations remain future work. The demonstration approval requires user confirmation but only changes local UI state.

## IBM Bob status

The team reports using IBM Bob, but exact tasks and genuine evidence are still awaiting confirmation. No Bob session exports or usage screenshots are present. Do not claim verified development contributions or a live MCP integration until evidence is added to bob_sessions/.

## Impact and limits

The intended benefit is earlier visibility of resource pressure and better informed supervisor decisions. No real operational savings have been measured. Production use would require real-port training data, calibration, solver implementation, access controls, and deployment testing.
