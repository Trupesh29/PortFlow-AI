# PortFlow AI — Project Context

> **Version:** 1.0
> **Date:** 2026-09-12
> **Status:** Authoritative — do not modify without team agreement

---

## 1. Business Problem

Global container ports face chronic congestion. Vessels arrive in clusters, berths fill up, cranes sit idle, and shift supervisors have no single tool that combines schedule visibility, congestion forecasting, and assignment optimisation. The result is long vessel waiting times, missed berth windows, unplanned overtime, and revenue loss for port operators and shipping lines alike.

**PortFlow AI** addresses this by:

1. Ingesting vessel schedule data (ETAs, vessel dimensions, container move counts).
2. Predicting the probability and severity of congestion over the next 72 hours.
3. Predicting individual vessel waiting times before a berth becomes available.
4. Solving a joint berth-and-crane assignment problem to minimise total port time.
5. Recommending alternate port routing when diverting a vessel produces a net cost benefit.
6. Generating a ready-to-approve 72-hour port operations plan.
7. Providing an AI Copilot (IBM Bob) that explains every prediction and recommendation in plain language.

---

## 2. Primary User

**Role:** Port Shift Supervisor
**Context:** Controls day-to-day berth scheduling and crane allocation for a single container terminal during an 8–12 hour shift.
**Goals:**
- Know which vessels will cause congestion before they arrive.
- Assign each vessel to the best available berth and crane set in seconds rather than minutes.
- Identify vessels that should be re-routed to an alternate port before their ETA passes.
- Produce a written shift handover plan that the next supervisor can action immediately.

**Pain Points (current state):**
- Scheduling is done in spreadsheets.
- Congestion is noticed after it starts, not before.
- Re-routing decisions are made by intuition with no cost comparison.
- Shift plans are written manually and often out of date.

---

## 3. Main User Journey

```
[Supervisor logs in]
        │
        ▼
[Dashboard loads — sees 72-hour congestion heatmap, vessel queue, berth occupancy]
        │
        ▼
[Reviews incoming vessels flagged as HIGH congestion risk]
        │
        ├──► [Asks IBM Bob: "Why is VESSEL-042 flagged?"]
        │           IBM Bob explains: draft, ETA cluster, berth mismatch
        │
        ▼
[Triggers joint berth/crane optimiser for the next 24-hour window]
        │
        ▼
[Reviews optimised assignments — sees waiting time reduction vs. current plan]
        │
        ├──► [One vessel shows positive routing benefit — clicks "Recommend Alternate Route"]
        │           IBM Bob explains cost comparison
        │           Supervisor CONFIRMS or REJECTS routing change
        │
        ▼
[Generates 72-hour operations plan — reviews plan document]
        │
        ▼
[Approves plan — plan is saved and marked as active]
        │
        ▼
[Supervisor hands over shift — successor opens same plan]
```

> **Key constraint:** Routing changes and plan approvals always require explicit human confirmation. The system never auto-executes either action.

---

## 4. Minimum Viable Product (MVP)

The MVP is defined as the smallest set of features that supports the primary demo journey end-to-end.

| # | Feature | Priority |
|---|---------|----------|
| 1 | Vessel, Port, Berth, Crane CRUD (create / read / update / delete) | P0 |
| 2 | Vessel schedule import (CSV upload + manual entry) | P0 |
| 3 | Congestion probability prediction (72-hour rolling window) | P0 |
| 4 | Vessel waiting-time prediction | P0 |
| 5 | Joint berth + crane assignment optimisation (OR-Tools CP-SAT) | P0 |
| 6 | Alternate routing recommendation with cost comparison | P1 |
| 7 | 72-hour operations plan generation and approval | P1 |
| 8 | IBM Bob AI Copilot (explain predictions, summarise plans) | P1 |
| 9 | Dashboard summary (occupancy, congestion heatmap, vessel queue) | P0 |
| 10 | Health-check endpoint | P0 |

---

## 5. Excluded Functionality

The following items are **out of scope** for this hackathon build and must not be implemented:

| Excluded Item | Reason |
|---------------|--------|
| Real-time IoT sensor feeds | No hardware available; synthetic data used instead |
| AIS (Automatic Identification System) live feed | Requires paid subscription and real-time infrastructure |
| Financial billing or port-fee calculation | Out of scope for shift supervisor persona |
| Multi-port network optimisation | Too complex for MVP; single terminal only |
| Mobile / native application | Web browser is sufficient |
| Role-based access control beyond a single supervisor | Out of scope |
| Kafka, Kubernetes, Spark, Hadoop, blockchain | Explicitly excluded by architecture constraints |
| Microservices or event-driven architecture | Modular monolith only |
| Automated plan execution (auto-berth, auto-crane dispatch) | Human approval is mandatory |
| Historical analytics beyond 90 days | No value in MVP |
| Vessel tracking map beyond static position markers | Out of scope |

---

## 6. Assumptions and Limitations

### Data
- **Synthetic data is used when real operational data is unavailable.** All vessel schedules, berth capacities, and crane productivities used in the demo are generated programmatically to be realistic but are not sourced from a live port system.
- Vessel ETAs are assumed accurate to +/- 30 minutes for prediction purposes.
- Container move counts per vessel are assumed to be known at the time of scheduling.

### ML Models
- Congestion and waiting-time models are trained on synthetic historical data generated to reflect realistic port patterns (vessel clustering, seasonal demand, tide windows).
- Models are retrained offline; there is no online/incremental learning in the MVP.
- Prediction accuracy is indicative and appropriate for a demo; production models would require months of real operational data.

### Optimisation
- The OR-Tools CP-SAT solver operates on a discrete time grid (slot size: 30 minutes).
- Solve time is bounded at 10 seconds per run; best feasible solution is returned if the time limit is reached.
- Tidal constraints and weather are not modelled in the MVP.

### Architecture
- A single PostgreSQL instance is the source of truth for all operational records.
- The system supports one terminal (port) per deployment in the MVP.
- All timestamps are stored and transmitted in UTC.

### Alternate Routing
- Alternate port candidates are pre-configured in the database; the system does not discover them dynamically.
- Routing benefit is computed from configurable cost parameters (sailing cost per hour, handling penalty, waiting time savings). These parameters are set by the administrator, not the supervisor.

---

## 7. Demo Storyline (2-3 Minutes)

**Setting:** It is 06:00 UTC. The port shift supervisor has just logged in. Fourteen vessels are expected in the next 72 hours.

**Minute 0:00 - 0:45 — Dashboard and Congestion Forecast**
- The supervisor opens the dashboard.
- The 72-hour congestion heatmap shows a HIGH-risk window at 14:00-18:00 today (berth occupancy predicted at 92%).
- Three vessels are flagged in the vessel queue with RED risk badges.
- The supervisor clicks on VESSEL-042 (a large container ship due at 13:30).
- IBM Bob explains: "VESSEL-042's arrival clusters with two other vessels in the same 2-hour window. Its draft of 13.4 m limits it to Berth 3, which is already occupied until 15:00. Expected waiting time: 2.1 hours."

**Minute 0:45 - 1:30 — Joint Optimisation**
- The supervisor clicks "Run Optimiser" for the 08:00-20:00 window.
- The optimiser assigns VESSEL-042 to Berth 3 (15:00 slot) with Cranes 4 and 5, reducing waiting time from 2.1 h to 0.3 h by resequencing VESSEL-039.
- The assignments panel shows before/after waiting times and crane utilisation.

**Minute 1:30 - 2:15 — Alternate Routing**
- VESSEL-051 (arriving 18:00) shows a routing flag: alternate port HARBOR-B reduces total cost by $14,200.
- IBM Bob explains the cost breakdown: sailing penalty $8,000, handling penalty $2,000, waiting time saving $24,200.
- The supervisor clicks "Confirm Routing Recommendation". A confirmation dialog appears. Supervisor approves. Status changes to ROUTING CONFIRMED.

**Minute 2:15 - 3:00 — 72-Hour Plan**
- The supervisor clicks "Generate 72-Hour Plan".
- The plan document appears: vessel list, berth assignments, crane allocations, congestion risk windows, routing decisions, and shift handover notes.
- The supervisor clicks "Approve Plan". The plan is marked ACTIVE.
- IBM Bob: "The plan is optimised. Peak congestion risk is reduced from 92% to 61%. Four vessels are assigned cranes. One vessel is routed to HARBOR-B."

---

## 8. Synthetic Data Policy

> **This application uses synthetic data for all machine learning training and for demonstration purposes.**

When real port operational data is not available:
- Vessel schedules are generated using configurable arrival rate distributions (Poisson process, mean = 3 vessels per 8-hour shift).
- Berth occupancy history is synthesised from vessel schedules plus randomised service time distributions.
- Congestion events are labelled programmatically from occupancy thresholds.
- Crane productivity figures are drawn from published industry ranges (15-35 moves per crane-hour) with added noise.

Synthetic data seed values are recorded in the codebase and reproducible. All synthetic data is clearly labelled `data_source: "synthetic"` in API responses.
