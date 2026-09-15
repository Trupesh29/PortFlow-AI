> Implementation scope (15 September 2026): this document includes target design/contracts. Runtime baseline dashboard, scenario/resource/schedule APIs, and ML prediction endpoints are implemented. Solver, alternate routing, persisted planning, and Bob MCP are not implemented; their UI pages are static demos. See architecture.md and submission-readiness.md for verified current behavior.

﻿# PortFlow AI — Data Dictionary

> **Version:** 1.0
> **Date:** 2026-09-12
> **Status:** Authoritative — all field names, types, and units must match this document.
> **Timestamp policy:** All timestamps are stored and transmitted in UTC as ISO 8601 strings, e.g. `"2026-09-12T06:00:00Z"`. No local time offsets are stored in the database.

---

## Table of Contents

1. Vessel Fields
2. Port Fields
3. Berth Fields
4. Crane Fields
5. Vessel Schedule Fields
6. Congestion Prediction Fields
7. Waiting-Time Prediction Fields
8. Optimiser Assignment Fields
9. Alternate Routing Fields
10. 72-Hour Operations Plan Fields

---

## 1. Vessel Fields

Database table: `vessels`

| Field Name | Meaning | Data Type | Unit | Required | Valid Range | Example | Source | Available at Prediction |
|------------|---------|-----------|------|----------|-------------|---------|--------|------------------------|
| `vessel_id` | Unique system identifier for the vessel | UUID | — | Yes | UUID v4 | `3fa85f64-5717-4562-b3fc-2c963f66afa6` | System generated | Yes |
| `imo_number` | International Maritime Organization vessel number | string | — | Yes | Pattern `IMO\d{7}`, globally unique | `IMO9876543` | Manual entry / CSV import | Yes |
| `name` | Vessel commercial name | string | — | Yes | 1–120 chars | `EVER GIVEN II` | Manual entry / CSV import | Yes |
| `vessel_type` | Classification of vessel | enum | — | Yes | `CONTAINER`, `BULK`, `TANKER`, `RORO`, `GENERAL` | `CONTAINER` | Manual entry / CSV import | Yes |
| `length_m` | Overall vessel length | float | metres | Yes | 50–500 | `399.9` | Manual entry / CSV import | Yes |
| `beam_m` | Maximum vessel width | float | metres | Yes | 10–100 | `58.8` | Manual entry / CSV import | Yes |
| `draft_m` | Vessel draught (depth below waterline when laden) | float | metres | Yes | 2–25 | `14.5` | Manual entry / CSV import | Yes |
| `capacity_teu` | Maximum carrying capacity in twenty-foot equivalent units | integer | TEU | No (nullable for non-container) | 0–25000 | `20388` | Manual entry / CSV import | Yes |
| `flag_state` | Country of vessel registration | string | ISO 3166-1 alpha-2 | No | 2-char code | `PA` (Panama) | Manual entry / CSV import | Yes |
| `created_at` | Record creation timestamp | datetime | UTC | Yes (auto) | — | `2026-09-01T00:00:00Z` | System | No |
| `updated_at` | Record last-update timestamp | datetime | UTC | Yes (auto) | — | `2026-09-01T00:00:00Z` | System | No |

**Notes:**
- `draft_m` is the single most important field for berth eligibility. A vessel whose draft exceeds a berth's `max_vessel_draft_m` cannot be assigned to that berth.
- `capacity_teu` is used as a proxy for vessel size in feature engineering when `expected_container_moves` is not available.

---

## 2. Port Fields

Database table: `ports`

| Field Name | Meaning | Data Type | Unit | Required | Valid Range | Example | Source | Available at Prediction |
|------------|---------|-----------|------|----------|-------------|---------|--------|------------------------|
| `port_id` | Unique system identifier for the port | UUID | — | Yes | UUID v4 | `a1b2c3d4-0000-0000-0000-000000000001` | System generated | Yes |
| `un_locode` | United Nations location code for the port | string | — | Yes | 5-char UN/LOCODE, unique | `SGSIN` | Manual entry | Yes |
| `name` | Port full name | string | — | Yes | 1–120 chars | `Port of Singapore` | Manual entry | Yes |
| `country` | Country where the port is located | string | ISO 3166-1 alpha-2 | Yes | 2-char code | `SG` | Manual entry | Yes |
| `latitude` | Port geographic latitude | float | decimal degrees | Yes | -90 to 90 | `1.2903` | Manual entry | Yes |
| `longitude` | Port geographic longitude | float | decimal degrees | Yes | -180 to 180 | `103.8521` | Manual entry | Yes |
| `total_berths` | Total number of berths at this port (derived) | integer | — | Computed | >=0 | `8` | Derived from berths table | Yes |
| `total_cranes` | Total number of cranes at this port (derived) | integer | — | Computed | >=0 | `24` | Derived from cranes table | Yes |
| `created_at` | Record creation timestamp | datetime | UTC | Yes (auto) | — | `2026-09-01T00:00:00Z` | System | No |
| `updated_at` | Record last-update timestamp | datetime | UTC | Yes (auto) | — | `2026-09-01T00:00:00Z` | System | No |

---

## 3. Berth Fields

Database table: `berths`

| Field Name | Meaning | Data Type | Unit | Required | Valid Range | Example | Source | Available at Prediction |
|------------|---------|-----------|------|----------|-------------|---------|--------|------------------------|
| `berth_id` | Unique system identifier for the berth | UUID | — | Yes | UUID v4 | `b0000001-0000-0000-0000-000000000001` | System generated | Yes |
| `port_id` | Foreign key to the owning port | UUID | — | Yes | Must exist in `ports` | `a1b2c3d4-…` | Manual entry | Yes |
| `berth_code` | Human-readable berth identifier | string | — | Yes | Unique per port, 1–20 chars | `BERTH-03` | Manual entry | Yes |
| `length_m` | Physical length of the berth face | float | metres | Yes | >0 | `420.0` | Manual entry | Yes |
| `depth_m` | Water depth at the berth (chart datum) | float | metres | Yes | >0 | `16.0` | Manual entry | Yes |
| `max_vessel_length_m` | Maximum vessel length that can safely berth | float | metres | Yes | <= `length_m` | `400.0` | Manual entry | Yes |
| `max_vessel_draft_m` | Maximum vessel draft that can safely berth | float | metres | Yes | <= `depth_m` | `15.0` | Manual entry | Yes |
| `max_vessel_beam_m` | Maximum vessel beam that can safely berth | float | metres | Yes | >0 | `60.0` | Manual entry | Yes |
| `crane_count` | Number of quay cranes assigned to this berth | integer | count | Yes | 0–20 | `4` | Manual entry | Yes |
| `status` | Operational status of the berth | enum | — | Yes | `OPERATIONAL`, `MAINTENANCE`, `CLOSED` | `OPERATIONAL` | Manual entry | Yes |
| `created_at` | Record creation timestamp | datetime | UTC | Yes (auto) | — | `2026-09-01T00:00:00Z` | System | No |
| `updated_at` | Record last-update timestamp | datetime | UTC | Yes (auto) | — | `2026-09-01T00:00:00Z` | System | No |

**Notes:**
- Only berths with `status = OPERATIONAL` are considered by the congestion predictor and optimiser.
- `max_vessel_draft_m` is the primary constraint for berth eligibility. The optimiser enforces: `vessel.draft_m <= berth.max_vessel_draft_m`.
- `max_vessel_length_m` is a secondary constraint: `vessel.length_m <= berth.max_vessel_length_m`.

---

## 4. Crane Fields

Database table: `cranes`

| Field Name | Meaning | Data Type | Unit | Required | Valid Range | Example | Source | Available at Prediction |
|------------|---------|-----------|------|----------|-------------|---------|--------|------------------------|
| `crane_id` | Unique system identifier for the crane | UUID | — | Yes | UUID v4 | `c0000001-0000-0000-0000-000000000001` | System generated | Yes |
| `port_id` | Foreign key to the owning port | UUID | — | Yes | Must exist in `ports` | `a1b2c3d4-…` | Manual entry | Yes |
| `berth_id` | Foreign key to the berth where crane is stationed | UUID | — | Yes | Must exist in `berths` and belong to same port | `b0000001-…` | Manual entry | Yes |
| `crane_code` | Human-readable crane identifier | string | — | Yes | Unique per port, 1–20 chars | `CRANE-04` | Manual entry | Yes |
| `crane_type` | Crane classification | enum | — | Yes | `STS` (Ship-to-Shore), `RTG` (Rubber-Tyred Gantry), `MOBILE`, `REACH_STACKER` | `STS` | Manual entry | Yes |
| `productivity_moves_per_hour` | Crane throughput under normal operating conditions | integer | container moves / hour | Yes | 1–60 | `28` | Manual entry / industry data | Yes |
| `status` | Operational status of the crane | enum | — | Yes | `AVAILABLE`, `MAINTENANCE`, `OFFLINE` | `AVAILABLE` | Manual entry | Yes |
| `created_at` | Record creation timestamp | datetime | UTC | Yes (auto) | — | `2026-09-01T00:00:00Z` | System | No |
| `updated_at` | Record last-update timestamp | datetime | UTC | Yes (auto) | — | `2026-09-01T00:00:00Z` | System | No |

**Notes:**
- Only cranes with `status = AVAILABLE` are eligible for optimiser assignment.
- `productivity_moves_per_hour` is used to compute service time: `service_time_hours = expected_container_moves / sum(crane.productivity_moves_per_hour for assigned cranes)`.
- Industry benchmarks: STS cranes 20–35 moves/hour; RTG cranes 15–25 moves/hour.

---

## 5. Vessel Schedule Fields

Database table: `vessel_schedules`

| Field Name | Meaning | Data Type | Unit | Required | Valid Range | Example | Source | Available at Prediction |
|------------|---------|-----------|------|----------|-------------|---------|--------|------------------------|
| `schedule_id` | Unique system identifier for the schedule entry | UUID | — | Yes | UUID v4 | `d0000001-0000-0000-0000-000000000001` | System generated | Yes |
| `vessel_id` | Foreign key to the vessel | UUID | — | Yes | Must exist in `vessels` | `3fa85f64-…` | Manual entry / CSV import | Yes |
| `port_id` | Foreign key to the destination port | UUID | — | Yes | Must exist in `ports` | `a1b2c3d4-…` | Manual entry / CSV import | Yes |
| `berth_id` | Foreign key to assigned berth (null until optimised) | UUID | No (nullable) | — | Must exist in `berths` | `b0000001-…` | Optimiser / manual | At berth assignment time |
| `eta_utc` | Estimated time of arrival at port, UTC | datetime | UTC | Yes | Must be >= now at creation | `2026-09-12T13:30:00Z` | Manual entry / CSV import | Yes — this is an input feature |
| `etd_utc` | Estimated time of departure from port, UTC | datetime | UTC | Yes | Must be > `eta_utc` | `2026-09-12T20:00:00Z` | Manual entry / CSV import | Yes — used to compute planned service window |
| `actual_arrival_utc` | Actual vessel arrival time, UTC | datetime | UTC | No (nullable) | Must be after port commissioning date | `2026-09-12T13:45:00Z` | Recorded post-event | No — not available at prediction time |
| `actual_departure_utc` | Actual vessel departure time, UTC | datetime | UTC | No (nullable) | Must be after `actual_arrival_utc` | `2026-09-12T21:10:00Z` | Recorded post-event | No — not available at prediction time |
| `expected_container_moves` | Number of container lifts expected for this call | integer | TEU moves | Yes | 1–30000 | `1200` | Manual entry / CSV import | Yes — key input feature |
| `priority` | Scheduling priority of the vessel call | enum | — | No | `NORMAL`, `HIGH`, `URGENT`; default `NORMAL` | `NORMAL` | Manual entry | Yes |
| `status` | Current status of the vessel call | enum | — | Yes (auto) | `EXPECTED`, `ARRIVED`, `BERTHED`, `DEPARTED`, `CANCELLED` | `EXPECTED` | System / manual | Yes |
| `data_source` | Whether data is real or synthetic | enum | — | Yes | `real`, `synthetic` | `synthetic` | System | Yes — included in all API responses |
| `created_at` | Record creation timestamp | datetime | UTC | Yes (auto) | — | `2026-09-10T00:00:00Z` | System | No |
| `updated_at` | Record last-update timestamp | datetime | UTC | Yes (auto) | — | `2026-09-10T00:00:00Z` | System | No |

**Derived fields (computed, not stored):**

| Derived Field | Formula | Unit |
|---------------|---------|------|
| `planned_service_window_hours` | `(etd_utc - eta_utc).total_seconds() / 3600` | hours |
| `arrival_hour_of_day` | `eta_utc.hour` in UTC | integer 0–23 |
| `arrival_day_of_week` | `eta_utc.weekday()` | integer 0 (Mon) – 6 (Sun) |

---

## 6. Congestion Prediction Fields

Not stored as a dedicated table; returned by the prediction service and optionally cached.

| Field Name | Meaning | Data Type | Unit | Required | Valid Range | Example | Source | Available at Prediction |
|------------|---------|-----------|------|----------|-------------|---------|--------|------------------------|
| `slot_start_utc` | Start of the prediction time slot, UTC | datetime | UTC | Yes | — | `2026-09-12T13:00:00Z` | Computed | Input |
| `slot_end_utc` | End of the prediction time slot, UTC | datetime | UTC | Yes | — | `2026-09-12T14:00:00Z` | Computed | Input |
| `congestion_probability` | Model output: probability that the port is congested during this slot | float | probability [0,1] | Yes | 0.0–1.0 | `0.87` | ML model (scikit-learn / XGBoost) | Output |
| `congestion_level` | Categorical label derived from `congestion_probability` | enum | — | Yes | `LOW` (<0.40), `MEDIUM` (0.40–0.70), `HIGH` (0.70–0.90), `CRITICAL` (>0.90) | `HIGH` | Derived from probability | Output |
| `predicted_berth_occupancy_pct` | Fraction of berths predicted to be occupied during this slot | float | percentage [0,100] | Yes | 0–100 | `91.5` | ML model or rule-based estimate | Output |
| `vessel_count_expected` | Number of vessels expected to be in port or waiting during this slot | integer | count | Yes | >=0 | `6` | Derived from schedule | Output |
| `contributing_vessel_ids` | Schedule IDs of vessels that contribute to congestion in this slot | array[UUID] | — | Yes | — | `["d0000001-…"]` | Derived from schedule | Output |
| `model_version` | Version string of the ML model that produced this output | string | — | Yes | — | `congestion_v1.2.0` | Model metadata | Output |
| `data_source` | Whether training data is real or synthetic | enum | — | Yes | `real`, `synthetic` | `synthetic` | Model metadata | Output |
| `generated_at_utc` | When this prediction was generated, UTC | datetime | UTC | Yes | — | `2026-09-12T06:01:00Z` | System | Output |

**Congestion model input features (selected):**

| Feature | Derivation |
|---------|------------|
| `vessels_in_window` | Count of schedules with ETA in slot |
| `berth_occupancy_at_slot_start` | Current berths occupied / total berths |
| `avg_draft_in_window` | Average `draft_m` of vessels in window |
| `total_moves_in_window` | Sum of `expected_container_moves` for vessels in window |
| `arrival_hour_of_day` | Hour component of slot start |
| `arrival_day_of_week` | Day component of slot start |

---

## 7. Waiting-Time Prediction Fields

Not stored; returned by the prediction service.

| Field Name | Meaning | Data Type | Unit | Required | Valid Range | Example | Source | Available at Prediction |
|------------|---------|-----------|------|----------|-------------|---------|--------|------------------------|
| `schedule_id` | The vessel schedule for which waiting time is predicted | UUID | — | Yes | Must exist | `d0000001-…` | Input | Yes |
| `predicted_waiting_time_hours` | Estimated time the vessel waits at anchor before berth assignment | float | hours | Yes | >=0 | `2.1` | ML model | Output |
| `prediction_lower_bound_hours` | Lower bound of 90% prediction interval | float | hours | Yes | >=0 | `1.4` | ML model | Output |
| `prediction_upper_bound_hours` | Upper bound of 90% prediction interval | float | hours | Yes | >=`predicted_waiting_time_hours` | `3.2` | ML model | Output |
| `confidence` | Model confidence in this prediction (1.0 = very high) | float | — | Yes | 0.0–1.0 | `0.78` | ML model | Output |
| `model_version` | Version string of the waiting-time ML model | string | — | Yes | — | `waiting_time_v1.1.0` | Model metadata | Output |
| `data_source` | Whether training data is real or synthetic | enum | — | Yes | `real`, `synthetic` | `synthetic` | Model metadata | Output |
| `generated_at_utc` | When this prediction was generated, UTC | datetime | UTC | Yes | — | `2026-09-12T06:01:00Z` | System | Output |
| `explanation_factors` | Top contributing factors from SHAP or feature importance | array[object] | — | Yes | Max 5 items | see below | Model explainability | Output |

**Explanation factor object:**

| Field | Type | Notes |
|-------|------|-------|
| `factor` | string | Machine-readable factor name, e.g. `berth_draft_mismatch` |
| `contribution` | float | Relative importance, 0–1, sums to approximately 1 |
| `description` | string | Human-readable explanation, max 200 chars |

**Waiting-time model input features (selected):**

| Feature | Derivation |
|---------|------------|
| `vessel_draft_m` | From `vessels.draft_m` |
| `vessel_length_m` | From `vessels.length_m` |
| `expected_container_moves` | From `vessel_schedules.expected_container_moves` |
| `compatible_berth_count` | Count of berths where `max_vessel_draft_m >= vessel.draft_m` and status = OPERATIONAL |
| `arrival_cluster_size` | Count of vessels with ETA within +/- 2 hours |
| `berth_occupancy_at_eta` | Fraction of compatible berths occupied at ETA |
| `arrival_hour_of_day` | UTC hour of ETA |
| `arrival_day_of_week` | UTC weekday of ETA |

---

## 8. Optimiser Assignment Fields

Database table: `optimiser_assignments` (stores latest optimiser run per schedule)

| Field Name | Meaning | Data Type | Unit | Required | Valid Range | Example | Source | Available at Prediction |
|------------|---------|-----------|------|----------|-------------|---------|--------|------------------------|
| `optimisation_id` | Unique identifier for this optimisation run | string | — | Yes | — | `opt-0001` | System generated | N/A |
| `schedule_id` | The vessel schedule assigned | UUID | — | Yes | Must exist | `d0000001-…` | Optimiser | Yes |
| `berth_id` | Berth assigned to this vessel by the optimiser | UUID | — | Yes | Must exist | `b0000001-…` | OR-Tools CP-SAT | Output |
| `berth_code` | Human-readable berth identifier (denormalised) | string | — | Yes | — | `BERTH-03` | Derived | Output |
| `berth_start_utc` | Start time of the assigned berth window, UTC | datetime | UTC | Yes | — | `2026-09-12T15:00:00Z` | OR-Tools CP-SAT | Output |
| `berth_end_utc` | End time of the assigned berth window, UTC | datetime | UTC | Yes | After `berth_start_utc` | `2026-09-12T21:30:00Z` | OR-Tools CP-SAT | Output |
| `assigned_crane_ids` | UUIDs of cranes assigned to this vessel during berth window | array[UUID] | — | Yes | At least 1 | `["c0000001-…"]` | OR-Tools CP-SAT | Output |
| `assigned_crane_codes` | Human-readable crane identifiers (denormalised) | array[string] | — | Yes | — | `["CRANE-04"]` | Derived | Output |
| `predicted_waiting_time_hours` | Waiting time from optimised ETA to `berth_start_utc` | float | hours | Yes | >=0 | `0.3` | Computed | Output |
| `predicted_service_time_hours` | Time to complete container moves with assigned cranes | float | hours | Yes | >0 | `6.5` | Computed | Output |
| `previous_waiting_time_hours` | Waiting time before optimisation (baseline) | float | hours | No (nullable) | >=0 | `2.1` | Prior prediction | Output |
| `solver_status` | CP-SAT solver outcome | enum | — | Yes | `OPTIMAL`, `FEASIBLE`, `INFEASIBLE`, `TIMEOUT_FEASIBLE`, `TIMEOUT_INFEASIBLE` | `OPTIMAL` | OR-Tools | Output |
| `solve_time_seconds` | Wall-clock time the solver ran | float | seconds | Yes | >0 | `3.7` | OR-Tools | Output |
| `objective_value` | Solver objective value (sum of waiting times in hours) | float | hours | Yes | >=0 | `5.4` | OR-Tools | Output |

**Service time formula:**
`predicted_service_time_hours = ceil(expected_container_moves / sum(crane.productivity_moves_per_hour)) / 1.0`

**Waiting time formula (post-optimisation):**
`predicted_waiting_time_hours = max(0, (berth_start_utc - eta_utc).total_seconds() / 3600)`

---

## 9. Alternate Routing Fields

Database table: `routing_recommendations`

| Field Name | Meaning | Data Type | Unit | Required | Valid Range | Example | Source | Available at Prediction |
|------------|---------|-----------|------|----------|-------------|---------|--------|------------------------|
| `recommendation_id` | Unique identifier for this recommendation | string | — | Yes | — | `rec-0001` | System generated | N/A |
| `schedule_id` | The vessel schedule under consideration | UUID | — | Yes | Must exist | `d0000001-…` | Input | Yes |
| `vessel_id` | Vessel being considered for diversion | UUID | — | Yes | Must exist | `3fa85f64-…` | Derived | Yes |
| `original_port_id` | The originally planned port | UUID | — | Yes | Must exist | `a1b2c3d4-…` | Derived | Yes |
| `alternate_port_id` | The proposed alternate port | UUID | — | Yes | Must exist | `a1b2c3d4-…` (different) | Input | Yes |
| `recommend_diversion` | Whether diversion produces a positive net benefit | boolean | — | Yes | — | `true` | Computed | Output |
| `net_benefit_usd` | Dollar value of net saving from diversion (positive = benefit) | float | USD | Yes | Any | `14200.0` | Computed | Output |
| `original_port_waiting_cost_usd` | Cost of waiting at original port (rate × hours) | float | USD | Yes | >=0 | `25200.0` | Computed | Output |
| `alternate_port_waiting_cost_usd` | Cost of waiting at alternate port (rate × hours) | float | USD | Yes | >=0 | `3000.0` | Computed | Output |
| `additional_sailing_cost_usd` | Cost of extra sailing distance to alternate port | float | USD | Yes | >=0 | `5800.0` | Computed | Output |
| `handling_penalty_usd` | Additional handling cost at alternate port | float | USD | Yes | >=0 | `2200.0` | Configured | Output |
| `original_port_predicted_waiting_hours` | Predicted waiting at original port | float | hours | Yes | >=0 | `4.2` | ML model | Output |
| `alternate_port_predicted_waiting_hours` | Predicted waiting at alternate port | float | hours | Yes | >=0 | `0.5` | ML model | Output |
| `additional_sailing_hours` | Extra hours sailing to alternate port vs. original | float | hours | Yes | >=0 | `6.2` | Configured | Output |
| `status` | Current status of the recommendation | enum | — | Yes | `PENDING_APPROVAL`, `ROUTING_CONFIRMED`, `ROUTING_REJECTED`, `EXPIRED` | `PENDING_APPROVAL` | System | Output |
| `explanation` | Plain-language summary of the routing recommendation | string | — | Yes | Max 500 chars | See example | LLM / template | Output |
| `data_source` | Whether underlying predictions use real or synthetic data | enum | — | Yes | `real`, `synthetic` | `synthetic` | Derived | Output |
| `generated_at_utc` | When this recommendation was generated, UTC | datetime | UTC | Yes | — | `2026-09-12T06:03:00Z` | System | Output |
| `confirmed_at_utc` | When supervisor approved or rejected the recommendation, UTC | datetime | UTC | No (nullable) | — | `2026-09-12T06:10:00Z` | System | N/A |
| `supervisor_note` | Free-text note added by the supervisor at confirmation | string | — | No (nullable) | Max 500 chars | `Approved by shift supervisor Smith.` | Supervisor | N/A |

**Net benefit formula:**
```
net_benefit_usd = original_port_waiting_cost_usd
                - alternate_port_waiting_cost_usd
                - additional_sailing_cost_usd
                - handling_penalty_usd
```

A positive `net_benefit_usd` means diversion saves money. `recommend_diversion = true` when `net_benefit_usd > 0`.

**Cost rate parameters (administrator-configured, not stored per vessel):**

| Parameter | Default | Unit |
|-----------|---------|------|
| `vessel_waiting_cost_rate_usd_per_hour` | 6000 | USD/hour |
| `sailing_cost_rate_usd_per_hour` | 935 | USD/hour |

---

## 10. 72-Hour Operations Plan Fields

Database table: `operations_plans`

| Field Name | Meaning | Data Type | Unit | Required | Valid Range | Example | Source | Available at Prediction |
|------------|---------|-----------|------|----------|-------------|---------|--------|------------------------|
| `plan_id` | Unique identifier for this operations plan | string | — | Yes | — | `plan-0001` | System generated | N/A |
| `port_id` | Port this plan covers | UUID | — | Yes | Must exist | `a1b2c3d4-…` | Input | N/A |
| `plan_start_utc` | Plan window start, UTC | datetime | UTC | Yes | — | `2026-09-12T06:00:00Z` | Input | N/A |
| `plan_end_utc` | Plan window end, UTC (always plan_start + 72 h) | datetime | UTC | Yes | `plan_start + 72h` | `2026-09-15T06:00:00Z` | Computed | N/A |
| `status` | Lifecycle status of the plan | enum | — | Yes | `DRAFT`, `ACTIVE`, `SUPERSEDED` | `DRAFT` | System | N/A |
| `generated_at_utc` | When the plan was generated, UTC | datetime | UTC | Yes (auto) | — | `2026-09-12T06:05:00Z` | System | N/A |
| `approved_at_utc` | When the supervisor approved the plan, UTC | datetime | UTC | No (nullable) | After `generated_at_utc` | `2026-09-12T06:12:00Z` | System | N/A |
| `supervisor_note` | Supervisor note added at approval | string | — | No (nullable) | Max 500 chars | `Approved at shift start.` | Supervisor | N/A |

**Plan vessel entry fields (nested in `vessel_entries` array):**

| Field Name | Meaning | Data Type | Unit | Notes |
|------------|---------|-----------|------|-------|
| `schedule_id` | Reference to vessel schedule | UUID | — | Must exist |
| `vessel_name` | Vessel name (denormalised for readability) | string | — | — |
| `eta_utc` | Estimated arrival, UTC | datetime | UTC | From schedule |
| `berth_code` | Assigned berth code | string | — | From optimiser or manual |
| `berth_start_utc` | Berth window start, UTC | datetime | UTC | From optimiser |
| `berth_end_utc` | Berth window end, UTC | datetime | UTC | From optimiser |
| `crane_codes` | Assigned crane codes | array[string] | — | From optimiser |
| `container_moves` | Expected container moves | integer | TEU moves | From schedule |
| `congestion_risk` | Risk level at ETA | enum | — | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `routing_status` | Whether vessel stays or is diverted | enum | — | `ORIGINAL_PORT`, `ROUTING_CONFIRMED`, `ROUTING_REJECTED` |

**Plan summary fields (nested in `summary` object):**

| Field Name | Meaning | Data Type | Unit |
|------------|---------|-----------|------|
| `total_vessels` | Total vessels in the plan window | integer | count |
| `routed_to_alternate` | Vessels with confirmed alternate routing | integer | count |
| `peak_congestion_level` | Worst congestion level in the window | enum | `LOW`/`MEDIUM`/`HIGH`/`CRITICAL` |
| `peak_berth_occupancy_pct` | Maximum predicted berth occupancy during window | float | percentage |
| `total_container_moves` | Sum of all container moves in window | integer | TEU moves |
| `average_waiting_time_hours` | Mean waiting time across all vessels | float | hours |

| Field Name | Meaning | Data Type | Unit | Notes |
|------------|---------|-----------|------|-------|
| `handover_notes` | AI-generated or supervisor-edited shift handover text | string | — | Max 2000 chars; generated by LLM or template |
