# Solution Overview

## Concept

PortFlow AI is a decision-support workspace that turns terminal schedules and capacity constraints into an explainable, supervisor-approved operations plan.

```text
Vessel schedules + berth/crane capacity + historical operations
                              |
                              v
                  Feature and validation layer
                              |
                 +------------+-------------+
                 |                          |
                 v                          v
        Congestion/wait model       CP-SAT optimiser
                 |                          |
                 +------------+-------------+
                              v
              Ranked, explainable operations plan
                              |
                              v
                   Supervisor review/approval
```

## Core Mechanism

1. Validate vessel, schedule, berth, and crane data.
2. Aggregate the next 72 hours into operational features such as arrival density, compatible-berth pressure, and expected crane demand.
3. Predict congestion probability and vessel waiting time using a trained model rather than hard-coded demo values.
4. Run a constraint-programming solver that respects vessel dimensions, berth availability, time overlap, and crane capacity.
5. Compare the baseline and optimised plans using total waiting time, peak occupancy, and crane utilisation.
6. Present causes and trade-offs in plain language, while requiring a supervisor to confirm routing changes and approve the final plan.

## Differentiation

Many congestion dashboards stop at a red risk indicator. PortFlow AI connects three normally separate decisions: what is likely to happen, why it is likely, and what feasible schedule should be used instead. Every recommendation carries the inputs, model/solver version, and before/after metrics needed for an audit trail.

## IBM Bob Role

IBM Bob is used as a core development partner for repository understanding, implementation, refactoring, test generation, documentation, and code review. Relevant task exports and usage-summary screenshots are stored in `bob_sessions/` for judging. The planned MCP server also exposes safe, read-oriented PortFlow tools so Bob can explain risk and plan outputs using live application context; approval actions remain in the web application.

## User Experience

The supervisor begins on a compact operations dashboard, opens a high-risk congestion window, reviews the affected vessels and explanation, runs the optimiser, compares baseline and proposed assignments, and generates a 72-hour plan. The complete demo journey is designed to fit within three minutes.

## Guardrails

- No hard-coded prediction or optimiser outputs.
- No confidential, client, personal, or social-media data.
- No automatic rerouting or plan approval.
- Every synthetic scenario records its generation seed.
- If a model or solver is unavailable, the API reports the limitation instead of returning invented results.
