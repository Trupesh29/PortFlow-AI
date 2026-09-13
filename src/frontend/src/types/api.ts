/**
 * TypeScript API definitions for PortFlow AI.
 * Strictly aligned with backend FastAPI schemas and docs/API_CONTRACT.md.
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PortIdentity {
  code: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface DashboardSummary {
  port: PortIdentity;
  as_of_utc: string;
  horizon_hours: number;
  active_upcoming_vessels: number;
  arrivals_next_24h: number;
  total_berths: number;
  available_berths: number;
  occupied_berths: number;
  berth_occupancy_pct: number;
  total_cranes: number;
  available_cranes: number;
  peak_congestion_risk: number;
  peak_congestion_level: RiskLevel;
  average_waiting_time_hours: number;
  critical_vessel_count: number;
  selected_scenario: string;
  is_synthetic: boolean;
  calculation_method: string;
}

export interface CongestionBucket {
  bucket_index: number;
  window_start_utc: string;
  window_end_utc: string;
  risk_probability: number;
  risk_level: RiskLevel;
  estimated_queue: number;
  scheduled_arrivals: number;
  expected_container_moves: number;
  available_berths: number;
  available_cranes: number;
  berth_occupancy_estimate_pct: number;
  affected_schedule_ids: string[];
  affected_vessels: string[];
  top_rule_drivers: string[];
}

export interface CongestionForecast {
  port_code: string;
  horizon_hours: number;
  bucket_hours: number;
  selected_scenario: string;
  is_synthetic: boolean;
  calculation_method: string;
  as_of_utc: string;
  peak_risk_probability: number;
  peak_risk_level: RiskLevel;
  buckets: CongestionBucket[];
}

export interface ScheduleItem {
  schedule_id: string;
  vessel_imo: string;
  vessel_name: string;
  vessel_type: string;
  length_m: number;
  draft_m: number;
  beam_m: number;
  eta_utc: string;
  etd_utc: string | null;
  expected_containers: number;
  priority: number;
  priority_label: string;
  preferred_berth_code: string | null;
  assigned_berth_code: string | null;
  compatible_berth_count: number;
  compatible_berth_codes: string[];
  status: string;
  baseline_estimated_waiting_hours: number;
  baseline_estimated_impact: string;
  congestion_risk_level: RiskLevel;
  is_synthetic: boolean;
}

export interface SchedulesResponse {
  data: ScheduleItem[];
  port_code: string;
  selected_scenario: string;
  total_items: number;
  is_synthetic: boolean;
}

export interface BerthResource {
  berth_id: string;
  code: string;
  name: string;
  max_length_m: number;
  max_draft_m: number;
  max_cranes: number;
  status: string;
  current_occupancy: string;
  assigned_vessel_name: string | null;
  allocated_cranes_count: number;
}

export interface BerthsResponse {
  port_code: string;
  selected_scenario: string;
  is_synthetic: boolean;
  data: BerthResource[];
}

export interface CraneResource {
  crane_id: string;
  code: string;
  berth_code: string | null;
  moves_per_hour: number;
  status: string;
}

export interface CranesResponse {
  port_code: string;
  selected_scenario: string;
  is_synthetic: boolean;
  data: CraneResource[];
}

export interface ScenarioItem {
  key: string;
  name: string;
  description: string;
  is_synthetic: boolean;
}

export interface ScenariosResponse {
  data: ScenarioItem[];
  default: string;
  calculation_method: string;
  is_synthetic: boolean;
}

export interface ApiErrorDetail {
  field?: string;
  issue: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details: ApiErrorDetail[];
  request_id?: string;
  timestamp_utc: string;
}

export interface ApiErrorResponse {
  error: ApiErrorPayload;
}
