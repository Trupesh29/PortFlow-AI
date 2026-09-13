import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from '../pages/DashboardPage';
import * as apiClient from '../api/client';
import {
  BerthsResponse,
  CongestionForecast,
  CranesResponse,
  DashboardSummary,
  SchedulesResponse,
  ScenariosResponse,
} from '../types/api';

const mockSummary: DashboardSummary = {
  port: {
    code: 'PFA',
    name: 'Bluehaven Container Terminal',
    country: 'Fictionland',
    latitude: 12.34,
    longitude: 78.90,
    timezone: 'UTC',
  },
  as_of_utc: '2026-01-01T00:00:00Z',
  horizon_hours: 72,
  active_upcoming_vessels: 14,
  arrivals_next_24h: 8,
  total_berths: 3,
  available_berths: 3,
  occupied_berths: 1,
  berth_occupancy_pct: 33.3,
  total_cranes: 7,
  available_cranes: 7,
  peak_congestion_risk: 0.75,
  peak_congestion_level: 'high',
  average_waiting_time_hours: 1.2,
  critical_vessel_count: 3,
  selected_scenario: 'baseline',
  is_synthetic: true,
  calculation_method: 'baseline_rule_v1',
};

const mockForecast: CongestionForecast = {
  port_code: 'PFA',
  horizon_hours: 72,
  bucket_hours: 6,
  selected_scenario: 'baseline',
  is_synthetic: true,
  calculation_method: 'baseline_rule_v1',
  as_of_utc: '2026-01-01T00:00:00Z',
  peak_risk_probability: 0.75,
  peak_risk_level: 'high',
  buckets: [
    {
      bucket_index: 0,
      window_start_utc: '2026-01-01T00:00:00Z',
      window_end_utc: '2026-01-01T06:00:00Z',
      risk_probability: 0.35,
      risk_level: 'low',
      estimated_queue: 0,
      scheduled_arrivals: 2,
      expected_container_moves: 450,
      available_berths: 3,
      available_cranes: 7,
      berth_occupancy_estimate_pct: 66.7,
      affected_schedule_ids: ['sched-01'],
      affected_vessels: ['Fictional Trader 01'],
      top_rule_drivers: ['Nominal arrival density within standard limits'],
    },
    {
      bucket_index: 1,
      window_start_utc: '2026-01-01T06:00:00Z',
      window_end_utc: '2026-01-01T12:00:00Z',
      risk_probability: 0.75,
      risk_level: 'high',
      estimated_queue: 2,
      scheduled_arrivals: 4,
      expected_container_moves: 1200,
      available_berths: 3,
      available_cranes: 7,
      berth_occupancy_estimate_pct: 100.0,
      affected_schedule_ids: ['sched-02', 'sched-03'],
      affected_vessels: ['Fictional Trader 02', 'Fictional Trader 03'],
      top_rule_drivers: ['4 scheduled arrivals exceed 3 available berths'],
    },
  ],
};

const mockSchedules: SchedulesResponse = {
  data: [
    {
      schedule_id: 'sched-01',
      vessel_imo: '9900001',
      vessel_name: 'Fictional Trader 01',
      vessel_type: 'container',
      length_m: 228,
      draft_m: 10.0,
      beam_m: 30,
      eta_utc: '2026-01-01T03:00:00Z',
      etd_utc: null,
      expected_containers: 450,
      priority: 3,
      priority_label: 'Medium',
      preferred_berth_code: 'B1',
      assigned_berth_code: 'B1',
      compatible_berth_count: 3,
      compatible_berth_codes: ['B1', 'B2', 'B3'],
      status: 'scheduled',
      baseline_estimated_waiting_hours: 0.3,
      baseline_estimated_impact: 'Normal berth window accommodation',
      congestion_risk_level: 'low',
      is_synthetic: true,
    },
  ],
  port_code: 'PFA',
  selected_scenario: 'baseline',
  total_items: 1,
  is_synthetic: true,
};

const mockBerths: BerthsResponse = {
  port_code: 'PFA',
  selected_scenario: 'baseline',
  is_synthetic: true,
  data: [
    {
      berth_id: 'berth-B1',
      code: 'B1',
      name: 'Bluehaven Quay 1',
      max_length_m: 330,
      max_draft_m: 15,
      max_cranes: 3,
      status: 'available',
      current_occupancy: 'occupied',
      assigned_vessel_name: 'Fictional Trader 01',
      allocated_cranes_count: 3,
    },
  ],
};

const mockCranes: CranesResponse = {
  port_code: 'PFA',
  selected_scenario: 'baseline',
  is_synthetic: true,
  data: [
    {
      crane_id: 'crane-QC01',
      code: 'QC01',
      berth_code: 'B1',
      moves_per_hour: 38,
      status: 'available',
    },
  ],
};

const mockScenarios: ScenariosResponse = {
  data: [
    {
      key: 'baseline',
      name: 'Baseline Operations',
      description: 'Standard scheduled arrivals with nominal terminal capacity.',
      is_synthetic: true,
    },
    {
      key: 'arrival_surge',
      name: 'Arrival Surge',
      description: 'Clustered vessel arrivals within an early window.',
      is_synthetic: true,
    },
  ],
  default: 'baseline',
  calculation_method: 'baseline_rule_v1',
  is_synthetic: true,
};

describe('DashboardPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renders synthetic-data label and baseline rule label', async () => {
    vi.spyOn(apiClient, 'fetchDashboardSummary').mockResolvedValue(mockSummary);
    vi.spyOn(apiClient, 'fetchCongestionForecast').mockResolvedValue(mockForecast);
    vi.spyOn(apiClient, 'fetchSchedules').mockResolvedValue(mockSchedules);
    vi.spyOn(apiClient, 'fetchBerths').mockResolvedValue(mockBerths);
    vi.spyOn(apiClient, 'fetchCranes').mockResolvedValue(mockCranes);
    vi.spyOn(apiClient, 'fetchScenarios').mockResolvedValue(mockScenarios);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Bluehaven Container Terminal')).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Synthetic Demo Data/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/baseline_rule_v1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ML/i).length).toBeGreaterThan(0);
  });

  it('2. Renders backend API KPI values accurately', async () => {
    vi.spyOn(apiClient, 'fetchDashboardSummary').mockResolvedValue(mockSummary);
    vi.spyOn(apiClient, 'fetchCongestionForecast').mockResolvedValue(mockForecast);
    vi.spyOn(apiClient, 'fetchSchedules').mockResolvedValue(mockSchedules);
    vi.spyOn(apiClient, 'fetchBerths').mockResolvedValue(mockBerths);
    vi.spyOn(apiClient, 'fetchCranes').mockResolvedValue(mockCranes);
    vi.spyOn(apiClient, 'fetchScenarios').mockResolvedValue(mockScenarios);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Upcoming Vessels')).toBeInTheDocument();
    });

    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('33.3%')).toBeInTheDocument();
    expect(screen.getAllByText('75%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/1\.2/)).toBeInTheDocument();
  });

  it('3. Renders backend error state when API fails', async () => {
    vi.spyOn(apiClient, 'fetchDashboardSummary').mockRejectedValue(
      new apiClient.ApiClientError('Unable to connect to PortFlow FastAPI backend.', 'CONNECTION_ERROR', 503)
    );
    vi.spyOn(apiClient, 'fetchCongestionForecast').mockResolvedValue(mockForecast);
    vi.spyOn(apiClient, 'fetchSchedules').mockResolvedValue(mockSchedules);
    vi.spyOn(apiClient, 'fetchBerths').mockResolvedValue(mockBerths);
    vi.spyOn(apiClient, 'fetchCranes').mockResolvedValue(mockCranes);
    vi.spyOn(apiClient, 'fetchScenarios').mockResolvedValue(mockScenarios);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Backend Connection Required/i)).toBeInTheDocument();
      expect(screen.getByText(/Unable to connect to PortFlow FastAPI backend/i)).toBeInTheDocument();
      expect(screen.getByText(/Retry Connection/i)).toBeInTheDocument();
    });
  });

  it('4. Scenario selection triggers new API queries with selected scenario key', async () => {
    const summarySpy = vi.spyOn(apiClient, 'fetchDashboardSummary').mockResolvedValue(mockSummary);
    vi.spyOn(apiClient, 'fetchCongestionForecast').mockResolvedValue(mockForecast);
    vi.spyOn(apiClient, 'fetchSchedules').mockResolvedValue(mockSchedules);
    vi.spyOn(apiClient, 'fetchBerths').mockResolvedValue(mockBerths);
    vi.spyOn(apiClient, 'fetchCranes').mockResolvedValue(mockCranes);
    vi.spyOn(apiClient, 'fetchScenarios').mockResolvedValue(mockScenarios);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Arrival Surge')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Arrival Surge'));

    await waitFor(() => {
      expect(summarySpy).toHaveBeenCalledWith('PFA', 72, 'arrival_surge');
    });
  });

  it('5. Congestion chart receives real series data and renders bucket details', async () => {
    vi.spyOn(apiClient, 'fetchDashboardSummary').mockResolvedValue(mockSummary);
    vi.spyOn(apiClient, 'fetchCongestionForecast').mockResolvedValue(mockForecast);
    vi.spyOn(apiClient, 'fetchSchedules').mockResolvedValue(mockSchedules);
    vi.spyOn(apiClient, 'fetchBerths').mockResolvedValue(mockBerths);
    vi.spyOn(apiClient, 'fetchCranes').mockResolvedValue(mockCranes);
    vi.spyOn(apiClient, 'fetchScenarios').mockResolvedValue(mockScenarios);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('72-Hour Congestion Forecast Timeline')).toBeInTheDocument();
      expect(screen.getByText(/Bucket Window #1/i)).toBeInTheDocument();
      expect(screen.getByText(/Nominal arrival density within standard limits/i)).toBeInTheDocument();
    });
  });
});
