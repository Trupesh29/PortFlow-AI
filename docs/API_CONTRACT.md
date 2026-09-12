# PortFlow AI — API Contract

> **Version:** 1.0
> **Date:** 2026-09-12
> **Status:** Authoritative — all backend and frontend implementations must conform to this document.
> **Base URL prefix:** `/api/v1`
> **Content-Type:** `application/json` for all endpoints except CSV import.
> **Timestamps:** All timestamps are ISO 8601 strings in UTC, e.g. `"2026-09-12T06:00:00Z"`.
> **Errors:** All error responses follow the standard error envelope defined in Section 16.

---

## Table of Contents

1. Vessels
2. Ports
3. Berths
4. Cranes
5. Vessel Schedules
6. Schedule CSV Import
7. Congestion Prediction
8. Waiting-Time Prediction
9. Joint Berth/Crane Optimisation
10. Alternate Routing Recommendation
11. 72-Hour Plan Generation
12. Dashboard Summary
13. AI Copilot Query
14. Health Check
15. Pagination Envelope
16. Standard Error Envelope

---

## 1. Vessels

### GET `/api/v1/vessels`

Returns a paginated list of vessels.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number, default 1 |
| `page_size` | integer | No | Results per page, default 20, max 100 |
| `port_id` | UUID | No | Filter by port |

**Response 200:**

```json
{
  "data": [
    {
      "vessel_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "imo_number": "IMO9876543",
      "name": "EVER GIVEN II",
      "vessel_type": "CONTAINER",
      "length_m": 399.9,
      "beam_m": 58.8,
      "draft_m": 14.5,
      "capacity_teu": 20388,
      "flag_state": "PA",
      "created_at": "2026-09-01T00:00:00Z",
      "updated_at": "2026-09-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 1,
    "total_pages": 1
  }
}
```

---

### POST `/api/v1/vessels`

Creates a new vessel record.

**Request Body:**

```json
{
  "imo_number": "IMO9876543",
  "name": "EVER GIVEN II",
  "vessel_type": "CONTAINER",
  "length_m": 399.9,
  "beam_m": 58.8,
  "draft_m": 14.5,
  "capacity_teu": 20388,
  "flag_state": "PA"
}
```

**Field Rules:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `imo_number` | string | Yes | Must match pattern `IMO\d{7}` |
| `name` | string | Yes | Max 120 chars |
| `vessel_type` | enum | Yes | `CONTAINER`, `BULK`, `TANKER`, `RORO`, `GENERAL` |
| `length_m` | float | Yes | 50–500 m |
| `beam_m` | float | Yes | 10–100 m |
| `draft_m` | float | Yes | 2–25 m |
| `capacity_teu` | integer | No | Nullable for non-container vessels |
| `flag_state` | string | No | ISO 3166-1 alpha-2 |

**Response 201:**

```json
{
  "vessel_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "imo_number": "IMO9876543",
  "name": "EVER GIVEN II",
  "vessel_type": "CONTAINER",
  "length_m": 399.9,
  "beam_m": 58.8,
  "draft_m": 14.5,
  "capacity_teu": 20388,
  "flag_state": "PA",
  "created_at": "2026-09-12T06:00:00Z",
  "updated_at": "2026-09-12T06:00:00Z"
}
```

**Response 422 — Validation Error:** See Section 16.

---

## 2. Ports

### GET `/api/v1/ports`

Returns all configured ports.

**Response 200:**

```json
{
  "data": [
    {
      "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
      "un_locode": "SGSIN",
      "name": "Port of Singapore",
      "country": "SG",
      "latitude": 1.2903,
      "longitude": 103.8521,
      "total_berths": 8,
      "total_cranes": 24,
      "created_at": "2026-09-01T00:00:00Z",
      "updated_at": "2026-09-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/api/v1/ports`

Creates a new port.

**Request Body:**

```json
{
  "un_locode": "SGSIN",
  "name": "Port of Singapore",
  "country": "SG",
  "latitude": 1.2903,
  "longitude": 103.8521
}
```

**Field Rules:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `un_locode` | string | Yes | 5-char UN/LOCODE, unique |
| `name` | string | Yes | Max 120 chars |
| `country` | string | Yes | ISO 3166-1 alpha-2 |
| `latitude` | float | Yes | -90 to 90 |
| `longitude` | float | Yes | -180 to 180 |

**Response 201:** Port object with generated `port_id` and timestamps.

---

## 3. Berths

### GET `/api/v1/ports/{port_id}/berths`

Returns all berths for a given port.

**Response 200:**

```json
{
  "data": [
    {
      "berth_id": "b0000001-0000-0000-0000-000000000001",
      "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
      "berth_code": "BERTH-03",
      "length_m": 420.0,
      "depth_m": 16.0,
      "max_vessel_length_m": 400.0,
      "max_vessel_draft_m": 15.0,
      "max_vessel_beam_m": 60.0,
      "crane_count": 4,
      "status": "OPERATIONAL",
      "created_at": "2026-09-01T00:00:00Z",
      "updated_at": "2026-09-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/api/v1/ports/{port_id}/berths`

Creates a berth within a port.

**Request Body:**

```json
{
  "berth_code": "BERTH-03",
  "length_m": 420.0,
  "depth_m": 16.0,
  "max_vessel_length_m": 400.0,
  "max_vessel_draft_m": 15.0,
  "max_vessel_beam_m": 60.0,
  "crane_count": 4,
  "status": "OPERATIONAL"
}
```

**Field Rules:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `berth_code` | string | Yes | Unique per port, max 20 chars |
| `length_m` | float | Yes | > 0 |
| `depth_m` | float | Yes | > 0 |
| `max_vessel_length_m` | float | Yes | <= `length_m` |
| `max_vessel_draft_m` | float | Yes | <= `depth_m` |
| `max_vessel_beam_m` | float | Yes | > 0 |
| `crane_count` | integer | Yes | 0–20 |
| `status` | enum | Yes | `OPERATIONAL`, `MAINTENANCE`, `CLOSED` |

**Response 201:** Berth object with generated `berth_id`.

---

## 4. Cranes

### GET `/api/v1/ports/{port_id}/cranes`

Returns all cranes for a given port.

**Response 200:**

```json
{
  "data": [
    {
      "crane_id": "c0000001-0000-0000-0000-000000000001",
      "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
      "berth_id": "b0000001-0000-0000-0000-000000000001",
      "crane_code": "CRANE-04",
      "crane_type": "STS",
      "productivity_moves_per_hour": 28,
      "status": "AVAILABLE",
      "created_at": "2026-09-01T00:00:00Z",
      "updated_at": "2026-09-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/api/v1/ports/{port_id}/cranes`

Creates a crane record.

**Request Body:**

```json
{
  "berth_id": "b0000001-0000-0000-0000-000000000001",
  "crane_code": "CRANE-04",
  "crane_type": "STS",
  "productivity_moves_per_hour": 28,
  "status": "AVAILABLE"
}
```

**Field Rules:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `berth_id` | UUID | Yes | Must belong to same port |
| `crane_code` | string | Yes | Unique per port, max 20 chars |
| `crane_type` | enum | Yes | `STS`, `RTG`, `MOBILE`, `REACH_STACKER` |
| `productivity_moves_per_hour` | integer | Yes | 1–60 |
| `status` | enum | Yes | `AVAILABLE`, `MAINTENANCE`, `OFFLINE` |

**Response 201:** Crane object with generated `crane_id`.

---

## 5. Vessel Schedules

### GET `/api/v1/schedules`

Returns a paginated list of vessel schedules.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `port_id` | UUID | No | Filter by port |
| `status` | enum | No | `EXPECTED`, `ARRIVED`, `BERTHED`, `DEPARTED`, `CANCELLED` |
| `eta_from` | datetime | No | ISO 8601 UTC, inclusive |
| `eta_to` | datetime | No | ISO 8601 UTC, inclusive |
| `page` | integer | No | Default 1 |
| `page_size` | integer | No | Default 20, max 100 |

**Response 200:**

```json
{
  "data": [
    {
      "schedule_id": "d0000001-0000-0000-0000-000000000001",
      "vessel_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
      "berth_id": null,
      "eta_utc": "2026-09-12T13:30:00Z",
      "etd_utc": "2026-09-12T20:00:00Z",
      "actual_arrival_utc": null,
      "actual_departure_utc": null,
      "expected_container_moves": 1200,
      "priority": "NORMAL",
      "status": "EXPECTED",
      "data_source": "synthetic",
      "created_at": "2026-09-10T00:00:00Z",
      "updated_at": "2026-09-10T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 1,
    "total_pages": 1
  }
}
```

---

### POST `/api/v1/schedules`

Creates a single vessel schedule entry.

**Request Body:**

```json
{
  "vessel_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
  "eta_utc": "2026-09-12T13:30:00Z",
  "etd_utc": "2026-09-12T20:00:00Z",
  "expected_container_moves": 1200,
  "priority": "NORMAL"
}
```

**Field Rules:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `vessel_id` | UUID | Yes | Must exist |
| `port_id` | UUID | Yes | Must exist |
| `eta_utc` | datetime | Yes | Must be in the future |
| `etd_utc` | datetime | Yes | Must be after `eta_utc` |
| `expected_container_moves` | integer | Yes | 1–30000 |
| `priority` | enum | No | `NORMAL`, `HIGH`, `URGENT`; default `NORMAL` |

**Response 201:** Full schedule object.

---

## 6. Schedule CSV Import

### POST `/api/v1/schedules/import`

Bulk-imports vessel schedules from a CSV file.

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `file` | file | Yes | CSV file, max 5 MB |
| `port_id` | UUID | Yes | Applied to all rows unless the CSV includes a `port_id` column |
| `overwrite_existing` | boolean | No | Default false. If true, updates schedules with matching `imo_number + eta_utc` |

**CSV Required Columns:**

`imo_number, vessel_name, eta_utc, etd_utc, expected_container_moves`

**CSV Optional Columns:**

`priority, berth_code, data_source`

**Response 200:**

```json
{
  "imported": 12,
  "updated": 2,
  "skipped": 0,
  "errors": [],
  "schedule_ids": [
    "d0000001-0000-0000-0000-000000000001"
  ]
}
```

**Response 207 (partial success):**

```json
{
  "imported": 10,
  "updated": 0,
  "skipped": 0,
  "errors": [
    {
      "row": 5,
      "field": "eta_utc",
      "message": "Invalid datetime format. Expected ISO 8601 UTC."
    }
  ],
  "schedule_ids": []
}
```

---

## 7. Congestion Prediction

### POST `/api/v1/predictions/congestion`

Predicts port congestion probability and level for a given time window.

**Request Body:**

```json
{
  "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
  "window_start_utc": "2026-09-12T06:00:00Z",
  "window_end_utc": "2026-09-15T06:00:00Z",
  "slot_duration_minutes": 60
}
```

**Field Rules:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `port_id` | UUID | Yes | Must exist |
| `window_start_utc` | datetime | Yes | ISO 8601 UTC |
| `window_end_utc` | datetime | Yes | Must be within 72 hours of `window_start_utc` |
| `slot_duration_minutes` | integer | No | 30 or 60; default 60 |

**Response 200:**

```json
{
  "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
  "generated_at_utc": "2026-09-12T06:01:00Z",
  "model_version": "congestion_v1.2.0",
  "data_source": "synthetic",
  "slots": [
    {
      "slot_start_utc": "2026-09-12T13:00:00Z",
      "slot_end_utc": "2026-09-12T14:00:00Z",
      "congestion_probability": 0.87,
      "congestion_level": "HIGH",
      "predicted_berth_occupancy_pct": 91.5,
      "vessel_count_expected": 6,
      "contributing_vessel_ids": [
        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    }
  ]
}
```

**`congestion_level` Values:** `LOW` (0–0.40), `MEDIUM` (0.40–0.70), `HIGH` (0.70–0.90), `CRITICAL` (>0.90).

**Response 422:** Missing or invalid port_id; window exceeds 72 hours.

**Response 503:** ML model not loaded. Body includes `"error": "model_unavailable"`.

---

## 8. Waiting-Time Prediction

### POST `/api/v1/predictions/waiting-time`

Predicts waiting time for a specific vessel schedule entry before a berth is assigned.

**Request Body:**

```json
{
  "schedule_id": "d0000001-0000-0000-0000-000000000001"
}
```

**Response 200:**

```json
{
  "schedule_id": "d0000001-0000-0000-0000-000000000001",
  "vessel_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
  "eta_utc": "2026-09-12T13:30:00Z",
  "predicted_waiting_time_hours": 2.1,
  "prediction_lower_bound_hours": 1.4,
  "prediction_upper_bound_hours": 3.2,
  "confidence": 0.78,
  "model_version": "waiting_time_v1.1.0",
  "data_source": "synthetic",
  "generated_at_utc": "2026-09-12T06:01:00Z",
  "explanation_factors": [
    {
      "factor": "berth_draft_mismatch",
      "contribution": 0.45,
      "description": "Only 1 of 5 berths can accommodate vessel draft of 14.5 m."
    },
    {
      "factor": "arrival_cluster",
      "contribution": 0.32,
      "description": "3 vessels expected within 2-hour window around ETA."
    }
  ]
}
```

**Response 404:** `schedule_id` not found.

**Response 503:** ML model not loaded.

---

## 9. Joint Berth/Crane Optimisation

### POST `/api/v1/optimise/assignments`

Runs the joint berth and crane assignment optimiser (OR-Tools CP-SAT) for a given port and time window.

**Request Body:**

```json
{
  "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
  "window_start_utc": "2026-09-12T08:00:00Z",
  "window_end_utc": "2026-09-13T08:00:00Z",
  "schedule_ids": [
    "d0000001-0000-0000-0000-000000000001",
    "d0000002-0000-0000-0000-000000000002"
  ],
  "objective": "MINIMISE_WAITING_TIME",
  "solver_time_limit_seconds": 10
}
```

**Field Rules:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `port_id` | UUID | Yes | Must exist |
| `window_start_utc` | datetime | Yes | |
| `window_end_utc` | datetime | Yes | Max 24 hours from start |
| `schedule_ids` | array[UUID] | No | If empty, all EXPECTED schedules in window are used |
| `objective` | enum | No | `MINIMISE_WAITING_TIME`, `MAXIMISE_THROUGHPUT`; default `MINIMISE_WAITING_TIME` |
| `solver_time_limit_seconds` | integer | No | 5–60; default 10 |

**Response 200:**

```json
{
  "optimisation_id": "opt-0001",
  "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
  "generated_at_utc": "2026-09-12T06:02:00Z",
  "solver_status": "OPTIMAL",
  "solve_time_seconds": 3.7,
  "objective_value": 5.4,
  "assignments": [
    {
      "schedule_id": "d0000001-0000-0000-0000-000000000001",
      "vessel_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "vessel_name": "EVER GIVEN II",
      "berth_id": "b0000001-0000-0000-0000-000000000001",
      "berth_code": "BERTH-03",
      "berth_start_utc": "2026-09-12T15:00:00Z",
      "berth_end_utc": "2026-09-12T21:30:00Z",
      "assigned_crane_ids": [
        "c0000001-0000-0000-0000-000000000001",
        "c0000002-0000-0000-0000-000000000002"
      ],
      "assigned_crane_codes": ["CRANE-04", "CRANE-05"],
      "predicted_waiting_time_hours": 0.3,
      "predicted_service_time_hours": 6.5,
      "previous_waiting_time_hours": 2.1
    }
  ],
  "unassigned_schedule_ids": [],
  "summary": {
    "total_vessels": 2,
    "assigned": 2,
    "unassigned": 0,
    "total_waiting_time_hours": 0.6,
    "previous_total_waiting_time_hours": 4.2,
    "waiting_time_reduction_pct": 85.7,
    "average_crane_utilisation_pct": 76.3
  }
}
```

**`solver_status` Values:** `OPTIMAL`, `FEASIBLE`, `INFEASIBLE`, `TIMEOUT_FEASIBLE`, `TIMEOUT_INFEASIBLE`.

**Response 422:** Window exceeds 24 hours; no berths configured.

**Response 503:** Solver error.

---

## 10. Alternate Routing Recommendation

### POST `/api/v1/recommendations/routing`

Evaluates whether diverting a vessel to an alternate port produces a net cost benefit.

**Request Body:**

```json
{
  "schedule_id": "d0000001-0000-0000-0000-000000000001",
  "alternate_port_id": "a1b2c3d4-0000-0000-0000-000000000002"
}
```

**Response 200:**

```json
{
  "recommendation_id": "rec-0001",
  "schedule_id": "d0000001-0000-0000-0000-000000000001",
  "vessel_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "original_port_id": "a1b2c3d4-0000-0000-0000-000000000001",
  "alternate_port_id": "a1b2c3d4-0000-0000-0000-000000000002",
  "recommend_diversion": true,
  "net_benefit_usd": 14200.0,
  "cost_breakdown": {
    "original_port_waiting_cost_usd": 25200.0,
    "alternate_port_waiting_cost_usd": 3000.0,
    "additional_sailing_cost_usd": 5800.0,
    "handling_penalty_usd": 2200.0,
    "net_benefit_usd": 14200.0
  },
  "original_port_predicted_waiting_hours": 4.2,
  "alternate_port_predicted_waiting_hours": 0.5,
  "additional_sailing_hours": 6.2,
  "status": "PENDING_APPROVAL",
  "data_source": "synthetic",
  "generated_at_utc": "2026-09-12T06:03:00Z",
  "explanation": "Diverting EVER GIVEN II to Port of Johor saves an estimated $14,200. Waiting cost reduction of $22,200 outweighs additional sailing cost ($5,800) and handling penalty ($2,200)."
}
```

**Response 404:** `schedule_id` or `alternate_port_id` not found.

**Response 422:** Vessel already berthed; diversion not meaningful.

### POST `/api/v1/recommendations/routing/{recommendation_id}/confirm`

Supervisor confirms or rejects a routing recommendation. **Human confirmation required.**

**Request Body:**

```json
{
  "action": "CONFIRM",
  "supervisor_note": "Approved by shift supervisor Smith."
}
```

**Field Rules:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | enum | Yes | `CONFIRM` or `REJECT` |
| `supervisor_note` | string | No | Max 500 chars |

**Response 200:**

```json
{
  "recommendation_id": "rec-0001",
  "status": "ROUTING_CONFIRMED",
  "confirmed_at_utc": "2026-09-12T06:10:00Z"
}
```

---

## 11. 72-Hour Plan Generation

### POST `/api/v1/plans/generate`

Generates a 72-hour port operations plan for a given port.

**Request Body:**

```json
{
  "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
  "plan_start_utc": "2026-09-12T06:00:00Z"
}
```

**Response 201:**

```json
{
  "plan_id": "plan-0001",
  "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
  "plan_start_utc": "2026-09-12T06:00:00Z",
  "plan_end_utc": "2026-09-15T06:00:00Z",
  "status": "DRAFT",
  "generated_at_utc": "2026-09-12T06:05:00Z",
  "vessel_entries": [
    {
      "schedule_id": "d0000001-0000-0000-0000-000000000001",
      "vessel_name": "EVER GIVEN II",
      "eta_utc": "2026-09-12T13:30:00Z",
      "berth_code": "BERTH-03",
      "berth_start_utc": "2026-09-12T15:00:00Z",
      "berth_end_utc": "2026-09-12T21:30:00Z",
      "crane_codes": ["CRANE-04", "CRANE-05"],
      "container_moves": 1200,
      "congestion_risk": "HIGH",
      "routing_status": "ORIGINAL_PORT"
    }
  ],
  "congestion_windows": [
    {
      "window_start_utc": "2026-09-12T14:00:00Z",
      "window_end_utc": "2026-09-12T18:00:00Z",
      "congestion_level": "HIGH",
      "congestion_probability": 0.87
    }
  ],
  "summary": {
    "total_vessels": 14,
    "routed_to_alternate": 1,
    "peak_congestion_level": "HIGH",
    "peak_berth_occupancy_pct": 61.0,
    "total_container_moves": 16800,
    "average_waiting_time_hours": 0.4
  },
  "handover_notes": "Peak risk window 14:00-18:00. VESSEL-051 diverted to HARBOR-B. Monitor Berth 3 closely."
}
```

### POST `/api/v1/plans/{plan_id}/approve`

Supervisor approves a plan. **Human confirmation required.**

**Request Body:**

```json
{
  "supervisor_note": "Approved by supervisor Smith at shift start."
}
```

**Response 200:**

```json
{
  "plan_id": "plan-0001",
  "status": "ACTIVE",
  "approved_at_utc": "2026-09-12T06:12:00Z"
}
```

### GET `/api/v1/plans/{plan_id}`

Returns full plan detail.

**Response 200:** Full plan object as defined in POST response above.

### GET `/api/v1/plans`

Returns a paginated list of plans.

**Query Parameters:** `port_id`, `status` (`DRAFT`, `ACTIVE`, `SUPERSEDED`), `page`, `page_size`.

---

## 12. Dashboard Summary

### GET `/api/v1/dashboard/summary`

Returns all data required to render the dashboard in a single request.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `port_id` | UUID | Yes | |
| `window_hours` | integer | No | Hours ahead to summarise; default 72, max 72 |

**Response 200:**

```json
{
  "port_id": "a1b2c3d4-0000-0000-0000-000000000001",
  "as_of_utc": "2026-09-12T06:00:00Z",
  "berth_occupancy": {
    "total_berths": 8,
    "occupied": 3,
    "available": 5,
    "occupancy_pct": 37.5
  },
  "vessel_queue": {
    "total_expected": 14,
    "high_risk": 3,
    "medium_risk": 4,
    "low_risk": 7
  },
  "congestion_forecast": [
    {
      "slot_start_utc": "2026-09-12T14:00:00Z",
      "slot_end_utc": "2026-09-12T15:00:00Z",
      "congestion_level": "HIGH",
      "congestion_probability": 0.87
    }
  ],
  "vessels_at_risk": [
    {
      "schedule_id": "d0000001-0000-0000-0000-000000000001",
      "vessel_name": "EVER GIVEN II",
      "eta_utc": "2026-09-12T13:30:00Z",
      "congestion_risk": "HIGH",
      "predicted_waiting_time_hours": 2.1,
      "routing_recommendation_available": false
    }
  ],
  "active_plan_id": "plan-0001",
  "data_source": "synthetic"
}
```

---

## 13. AI Copilot Query

### POST `/api/v1/ai/query`

Sends a natural-language query to IBM Bob (AI Copilot). IBM Bob calls structured MCP tools backed by application services; it does not perform scheduling calculations directly.

**Request Body:**

```json
{
  "query": "Why is VESSEL-042 flagged as high risk?",
  "context": {
    "schedule_id": "d0000001-0000-0000-0000-000000000001",
    "port_id": "a1b2c3d4-0000-0000-0000-000000000001"
  },
  "conversation_id": "conv-abc123"
}
```

**Field Rules:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `query` | string | Yes | Max 1000 chars |
| `context` | object | No | Any IDs relevant to the query |
| `conversation_id` | string | No | Client-generated; used to maintain conversation history |

**Response 200:**

```json
{
  "conversation_id": "conv-abc123",
  "response": "VESSEL-042 is flagged HIGH risk for the following reasons: (1) Its draft of 13.4 m restricts it to Berth 3, which is occupied until 15:00. (2) Two other vessels share the same 13:00-15:00 arrival window. Expected waiting time is 2.1 hours.",
  "tool_calls_made": [
    "get_vessel_schedule",
    "get_waiting_time_prediction",
    "get_congestion_forecast"
  ],
  "sources": [
    {
      "type": "prediction",
      "id": "d0000001-0000-0000-0000-000000000001",
      "description": "Waiting-time prediction for VESSEL-042"
    }
  ],
  "generated_at_utc": "2026-09-12T06:01:05Z"
}
```

**Response 503:** AI Copilot service unavailable.

---

## 14. Health Check

### GET `/api/v1/health`

Returns service health status. Used by deployment platform for liveness checks.

**Response 200:**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp_utc": "2026-09-12T06:00:00Z",
  "components": {
    "database": "healthy",
    "congestion_model": "loaded",
    "waiting_time_model": "loaded",
    "solver": "available",
    "ai_copilot": "connected"
  }
}
```

**Response 503 (degraded):**

```json
{
  "status": "degraded",
  "version": "1.0.0",
  "timestamp_utc": "2026-09-12T06:00:00Z",
  "components": {
    "database": "healthy",
    "congestion_model": "error",
    "waiting_time_model": "loaded",
    "solver": "available",
    "ai_copilot": "disconnected"
  }
}
```

---

## 15. Pagination Envelope

All list endpoints return this wrapper:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 0,
    "total_pages": 0
  }
}
```

---

## 16. Standard Error Envelope

All error responses use this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description.",
    "details": [
      {
        "field": "draft_m",
        "issue": "Value 26.0 exceeds maximum of 25.0."
      }
    ],
    "request_id": "req-xyz-001",
    "timestamp_utc": "2026-09-12T06:00:00Z"
  }
}
```

**Standard Error Codes:**

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | `BAD_REQUEST` | Malformed request body |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate unique field |
| 422 | `VALIDATION_ERROR` | Business rule violation |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 503 | `SERVICE_UNAVAILABLE` | ML model or solver not ready |
