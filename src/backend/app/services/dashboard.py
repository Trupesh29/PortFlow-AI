"""Dashboard, schedules, and resource services for PortFlow AI."""
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from database.models import Berth, Crane, HistoricalOperation, Port, Vessel, VesselSchedule
from data.generate_synthetic import SCENARIOS, generate_dataset
from backend.app.core.errors import AppError
from backend.app.schemas.dashboard import (
    BerthResourceItem,
    BerthsResponse,
    CongestionForecastResponse,
    CraneResourceItem,
    CranesResponse,
    DashboardSummaryResponse,
    PortIdentity,
    ScheduleItemResponse,
    SchedulesListResponse,
    ScenarioItem,
    ScenariosListResponse,
)
from backend.app.services.congestion import calculate_baseline_congestion, classify_risk_level


SCENARIO_METADATA = [
    {
        "key": "baseline",
        "name": "Baseline Operations",
        "description": "Standard scheduled arrivals with nominal terminal capacity and all resources online.",
        "is_synthetic": True,
    },
    {
        "key": "arrival_surge",
        "name": "Arrival Surge",
        "description": "Clustered vessel arrivals within an early 8-hour window creating high berth and queue contention.",
        "is_synthetic": True,
    },
    {
        "key": "crane_outage",
        "name": "Crane Outage",
        "description": "Quay cranes QC06 and QC07 offline for unscheduled maintenance, reducing handling throughput.",
        "is_synthetic": True,
    },
    {
        "key": "berth_closure",
        "name": "Berth Closure",
        "description": "Berth B3 closed for emergency infrastructure repairs, restricting vessel accommodation.",
        "is_synthetic": True,
    },
    {
        "key": "handling_slowdown",
        "name": "Handling Slowdown",
        "description": "Terminal-wide 35% productivity reduction due to severe weather conditions or equipment slowdown.",
        "is_synthetic": True,
    },
]


class DashboardService:
    """Service providing data access and baseline predictions for operational dashboards."""

    @staticmethod
    def get_scenarios() -> ScenariosListResponse:
        """Returns all configured synthetic operational scenarios."""
        items = [ScenarioItem(**m) for m in SCENARIO_METADATA]
        return ScenariosListResponse(
            data=items,
            default="baseline",
            calculation_method="baseline_rule_v1",
            is_synthetic=True,
        )

    @classmethod
    def load_operational_data(
        cls, port_code: str, scenario: str = "baseline", db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """Loads port, berths, cranes, vessels, and schedules for the requested scenario.
        
        Reads from PostgreSQL when available and scenario is 'baseline'.
        Generates deterministic scenario data dynamically when scenario != 'baseline'
        or database is unpopulated, without modifying persisted records.
        """
        if scenario not in SCENARIOS:
            raise AppError(
                message=f"Invalid scenario '{scenario}'. Must be one of {list(SCENARIOS)}",
                code="VALIDATION_ERROR",
                status_code=422,
                details=[{"field": "scenario", "issue": f"Supported values: {', '.join(SCENARIOS)}"}]
            )

        # Check DB first if baseline and db is available
        if scenario == "baseline" and db is not None:
            try:
                db_port = db.scalar(select(Port).where(Port.code == port_code.upper()))
                if db_port is not None:
                    db_berths = db.scalars(select(Berth).where(Berth.port_id == db_port.id)).all()
                    db_cranes = db.scalars(select(Crane).where(Crane.port_id == db_port.id)).all()
                    db_schedules = db.scalars(
                        select(VesselSchedule)
                        .where(VesselSchedule.port_id == db_port.id)
                        .order_by(VesselSchedule.eta)
                    ).all()

                    if db_berths and db_schedules:
                        port_dict = {
                            "code": db_port.code,
                            "name": db_port.name,
                            "country": db_port.country,
                            "latitude": float(db_port.latitude),
                            "longitude": float(db_port.longitude),
                            "timezone": db_port.timezone,
                            "max_yard_capacity_teu": db_port.max_yard_capacity_teu or 42000,
                            "is_synthetic": True,
                        }
                        berths_list = [
                            {
                                "id": str(b.id),
                                "code": b.code,
                                "name": b.name,
                                "max_length_m": float(b.max_length_m),
                                "max_draft_m": float(b.max_draft_m),
                                "max_cranes": b.max_cranes,
                                "status": b.status,
                                "is_synthetic": True,
                            }
                            for b in db_berths
                        ]
                        berth_id_map = {b.id: b.code for b in db_berths}
                        cranes_list = [
                            {
                                "id": str(c.id),
                                "code": c.code,
                                "moves_per_hour": c.moves_per_hour,
                                "status": c.status,
                                "berth_code": berth_id_map.get(c.berth_id, "B1"),
                                "is_synthetic": True,
                            }
                            for c in db_cranes
                        ]
                        schedules_list = []
                        for s in db_schedules:
                            v = s.vessel
                            v_name = v.name if v else f"Vessel {s.vessel_id}"
                            v_imo = v.imo_number if v else "9900000"
                            v_len = float(v.length_m) if v else 250.0
                            v_draft = float(v.draft_m) if v else 11.0
                            v_beam = float(v.beam_m) if v else 32.0
                            v_type = v.vessel_type if v else "container"

                            schedules_list.append({
                                "schedule_id": str(s.id),
                                "vessel_imo": v_imo,
                                "vessel_name": v_name,
                                "vessel_type": v_type,
                                "length_m": v_len,
                                "draft_m": v_draft,
                                "beam_m": v_beam,
                                "eta": s.eta.isoformat(),
                                "etd": s.etd.isoformat() if s.etd else None,
                                "expected_containers": s.expected_containers,
                                "cargo_type": s.cargo_type,
                                "priority": s.priority,
                                "preferred_berth_code": berth_id_map.get(s.preferred_berth_id, "B1"),
                                "status": s.status,
                                "source": s.source,
                                "is_synthetic": True,
                            })

                        return {
                            "port": port_dict,
                            "berths": berths_list,
                            "cranes": cranes_list,
                            "vessel_schedules": schedules_list,
                        }
            except Exception:
                pass  # Fall back to synthetic data generator

        # Fall back to synthetic generator for the given scenario
        raw = generate_dataset(seed=2026, scenario=scenario)
        port_dict = raw["ports"][0]
        if port_code and port_dict["code"].upper() != port_code.upper():
            raise AppError(
                message=f"Port with code '{port_code}' not found.",
                code="NOT_FOUND",
                status_code=404,
                details=[{"field": "port_code", "issue": f"Available port code: {port_dict['code']}"}]
            )

        # Enrich schedules with vessel details
        vessels_by_imo = {v["imo_number"]: v for v in raw["vessels"]}
        enriched_schedules = []
        for i, s in enumerate(raw["vessel_schedules"]):
            v = vessels_by_imo.get(s["vessel_imo"], {})
            enriched_schedules.append({
                "schedule_id": f"sched-syn-{scenario}-{i:03d}",
                "vessel_imo": s["vessel_imo"],
                "vessel_name": v.get("name", f"Trader {i:02d}"),
                "vessel_type": v.get("vessel_type", "container"),
                "length_m": float(v.get("length_m", 250.0)),
                "draft_m": float(v.get("draft_m", 11.0)),
                "beam_m": float(v.get("beam_m", 32.0)),
                "eta": s["eta"],
                "etd": None,
                "expected_containers": s["expected_containers"],
                "cargo_type": s["cargo_type"],
                "priority": s["priority"],
                "preferred_berth_code": s.get("preferred_berth_code", "B1"),
                "status": s["status"],
                "source": s["source"],
                "is_synthetic": True,
            })

        berths_with_id = [
            {
                "id": f"berth-{b['code']}",
                **b
            }
            for b in raw["berths"]
        ]
        cranes_with_id = [
            {
                "id": f"crane-{c['code']}",
                **c
            }
            for c in raw["cranes"]
        ]

        return {
            "port": port_dict,
            "berths": berths_with_id,
            "cranes": cranes_with_id,
            "vessel_schedules": enriched_schedules,
        }

    @classmethod
    def get_dashboard_summary(
        cls,
        port_code: str = "PFA",
        horizon_hours: int = 72,
        scenario: str = "baseline",
        db: Optional[Session] = None,
    ) -> DashboardSummaryResponse:
        """Returns the high-level operational summary KPIs for the dashboard."""
        data = cls.load_operational_data(port_code=port_code, scenario=scenario, db=db)
        port = data["port"]
        berths = data["berths"]
        cranes = data["cranes"]
        schedules = data["vessel_schedules"]

        # Run baseline congestion calculation
        congestion = calculate_baseline_congestion(
            port_code=port["code"],
            schedules=schedules,
            berths=berths,
            cranes=cranes,
            horizon_hours=horizon_hours,
            bucket_hours=6,
            scenario=scenario,
        )

        ref_time = datetime.fromisoformat(congestion.as_of_utc)
        horizon_end = ref_time + timedelta(hours=horizon_hours)
        h24_end = ref_time + timedelta(hours=24)

        # Count active/upcoming vessels in horizon and next 24h
        upcoming_count = 0
        arrivals_24h = 0
        critical_count = 0
        total_waiting_hours = 0.0

        for s in schedules:
            try:
                eta_dt = datetime.fromisoformat(s["eta"])
                if ref_time <= eta_dt <= horizon_end:
                    upcoming_count += 1
                    if s.get("priority", 1) >= 4:
                        critical_count += 1
                if ref_time <= eta_dt <= h24_end:
                    arrivals_24h += 1
            except Exception:
                continue

        # Compute average waiting time from baseline calculations
        if congestion.buckets:
            total_queue = sum(b.estimated_queue for b in congestion.buckets)
            # Estimate waiting time: approx 0.8 hours per queued vessel on average
            avg_wait = round(total_queue * 0.85 / max(1, len(congestion.buckets)), 1)
        else:
            avg_wait = 0.0

        total_berths = len(berths)
        available_berths = sum(1 for b in berths if b.get("status") == "available")
        occupied_berths = min(total_berths, max(1, upcoming_count // 5)) if upcoming_count > 0 else 0
        occupancy_pct = round((occupied_berths / max(1, total_berths)) * 100.0, 1)

        total_cranes = len(cranes)
        available_cranes = sum(1 for c in cranes if c.get("status") == "available")

        return DashboardSummaryResponse(
            port=PortIdentity(
                code=port["code"],
                name=port["name"],
                country=port["country"],
                latitude=float(port["latitude"]),
                longitude=float(port["longitude"]),
                timezone=port["timezone"],
            ),
            as_of_utc=congestion.as_of_utc,
            horizon_hours=horizon_hours,
            active_upcoming_vessels=upcoming_count,
            arrivals_next_24h=arrivals_24h,
            total_berths=total_berths,
            available_berths=available_berths,
            occupied_berths=occupied_berths,
            berth_occupancy_pct=occupancy_pct,
            total_cranes=total_cranes,
            available_cranes=available_cranes,
            peak_congestion_risk=congestion.peak_risk_probability,
            peak_congestion_level=congestion.peak_risk_level,
            average_waiting_time_hours=avg_wait,
            critical_vessel_count=critical_count,
            selected_scenario=scenario,
            is_synthetic=True,
            calculation_method="baseline_rule_v1",
        )

    @classmethod
    def get_congestion_forecast(
        cls,
        port_code: str = "PFA",
        horizon_hours: int = 72,
        scenario: str = "baseline",
        db: Optional[Session] = None,
    ) -> CongestionForecastResponse:
        """Returns the 6-hour interval congestion forecast for the requested horizon."""
        data = cls.load_operational_data(port_code=port_code, scenario=scenario, db=db)
        return calculate_baseline_congestion(
            port_code=data["port"]["code"],
            schedules=data["vessel_schedules"],
            berths=data["berths"],
            cranes=data["cranes"],
            horizon_hours=horizon_hours,
            bucket_hours=6,
            scenario=scenario,
        )

    @classmethod
    def get_schedules(
        cls,
        port_code: str = "PFA",
        scenario: str = "baseline",
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 50,
        db: Optional[Session] = None,
    ) -> SchedulesListResponse:
        """Returns filtered vessel schedules with compatibility and baseline impact analysis."""
        data = cls.load_operational_data(port_code=port_code, scenario=scenario, db=db)
        berths = data["berths"]
        all_schedules = data["vessel_schedules"]

        # Filter by date range if provided
        filtered = []
        for s in all_schedules:
            try:
                eta_dt = datetime.fromisoformat(s["eta"])
                if start_time and eta_dt < start_time:
                    continue
                if end_time and eta_dt > end_time:
                    continue
                filtered.append(s)
            except Exception:
                filtered.append(s)

        # Priority label mapper
        priority_labels = {1: "Low", 2: "Normal", 3: "Medium", 4: "High", 5: "Urgent"}

        items: List[ScheduleItemResponse] = []
        for s in filtered:
            v_len = s.get("length_m", 250.0)
            v_draft = s.get("draft_m", 11.0)
            p = s.get("priority", 2)
            
            # Compatible berths
            compatible_codes = [
                b["code"] for b in berths
                if v_len <= b.get("max_length_m", 300.0) and v_draft <= b.get("max_draft_m", 15.0) and b.get("status") == "available"
            ]
            
            # Baseline impact calculation
            if len(compatible_codes) == 0:
                impact = "Berth draft/length bottleneck — potential delay"
                wait_est = 2.8
                risk_lvl = "critical"
            elif len(compatible_codes) == 1:
                impact = f"Restricted to {compatible_codes[0]} quay only"
                wait_est = 1.4
                risk_lvl = "high" if scenario in ("berth_closure", "arrival_surge") else "medium"
            else:
                impact = "Normal berth window accommodation"
                wait_est = 0.3
                risk_lvl = "low"

            items.append(
                ScheduleItemResponse(
                    schedule_id=s["schedule_id"],
                    vessel_imo=s["vessel_imo"],
                    vessel_name=s["vessel_name"],
                    vessel_type=s["vessel_type"],
                    length_m=v_len,
                    draft_m=v_draft,
                    beam_m=s.get("beam_m", 32.0),
                    eta_utc=s["eta"],
                    etd_utc=s.get("etd"),
                    expected_containers=s["expected_containers"],
                    priority=p,
                    priority_label=priority_labels.get(p, "Normal"),
                    preferred_berth_code=s.get("preferred_berth_code"),
                    assigned_berth_code=compatible_codes[0] if compatible_codes else None,
                    compatible_berth_count=len(compatible_codes),
                    compatible_berth_codes=compatible_codes,
                    status=s.get("status", "scheduled"),
                    baseline_estimated_waiting_hours=wait_est,
                    baseline_estimated_impact=impact,
                    congestion_risk_level=risk_lvl,
                    is_synthetic=True,
                )
            )

        # Pagination slice
        total = len(items)
        start_idx = (page - 1) * page_size
        paged_items = items[start_idx : start_idx + page_size]

        return SchedulesListResponse(
            data=paged_items,
            port_code=data["port"]["code"],
            selected_scenario=scenario,
            total_items=total,
            is_synthetic=True,
        )

    @classmethod
    def get_berths(
        cls, port_code: str = "PFA", scenario: str = "baseline", db: Optional[Session] = None
    ) -> BerthsResponse:
        """Returns berth capacity and current operational status."""
        data = cls.load_operational_data(port_code=port_code, scenario=scenario, db=db)
        berths = data["berths"]
        cranes = data["cranes"]

        # Count cranes allocated to each berth
        crane_counts: Dict[str, int] = {}
        for c in cranes:
            b_code = c.get("berth_code", "B1")
            if c.get("status") == "available":
                crane_counts[b_code] = crane_counts.get(b_code, 0) + 1

        items = [
            BerthResourceItem(
                berth_id=str(b.get("id", f"berth-{b['code']}")),
                code=b["code"],
                name=b["name"],
                max_length_m=float(b["max_length_m"]),
                max_draft_m=float(b["max_draft_m"]),
                max_cranes=int(b["max_cranes"]),
                status=b.get("status", "available"),
                current_occupancy="occupied" if b["code"] == "B1" and b.get("status") == "available" else "available",
                assigned_vessel_name="Fictional Trader 01" if b["code"] == "B1" and b.get("status") == "available" else None,
                allocated_cranes_count=crane_counts.get(b["code"], 2),
            )
            for b in berths
        ]

        return BerthsResponse(
            port_code=data["port"]["code"],
            selected_scenario=scenario,
            is_synthetic=True,
            data=items,
        )

    @classmethod
    def get_cranes(
        cls, port_code: str = "PFA", scenario: str = "baseline", db: Optional[Session] = None
    ) -> CranesResponse:
        """Returns crane resources and operational throughput status."""
        data = cls.load_operational_data(port_code=port_code, scenario=scenario, db=db)
        cranes = data["cranes"]

        items = [
            CraneResourceItem(
                crane_id=str(c.get("id", f"crane-{c['code']}")),
                code=c["code"],
                berth_code=c.get("berth_code"),
                moves_per_hour=int(c["moves_per_hour"]),
                status=c.get("status", "available"),
            )
            for c in cranes
        ]

        return CranesResponse(
            port_code=data["port"]["code"],
            selected_scenario=scenario,
            is_synthetic=True,
            data=items,
        )
