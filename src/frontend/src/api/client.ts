/**
 * Centralized, typed API client for PortFlow AI backend services.
 */
import {
  ApiErrorResponse,
  BerthsResponse,
  CongestionForecast,
  CranesResponse,
  DashboardSummary,
  SchedulesResponse,
  ScenariosResponse,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export class ApiClientError extends Error {
  public code: string;
  public status: number;
  public details: Array<{ field?: string; issue: string }>;

  constructor(message: string, code: string = 'CLIENT_ERROR', status: number = 500, details: Array<{ field?: string; issue: string }> = []) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!res.ok) {
      let errorData: ApiErrorResponse | null = null;
      try {
        errorData = await res.json();
      } catch {
        // Response was not JSON
      }

      if (errorData?.error) {
        throw new ApiClientError(
          errorData.error.message || `API request failed with status ${res.status}`,
          errorData.error.code || 'API_ERROR',
          res.status,
          errorData.error.details || []
        );
      }

      throw new ApiClientError(
        `API server returned ${res.status}: ${res.statusText}`,
        'HTTP_ERROR',
        res.status
      );
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new ApiClientError(
        'Unable to connect to PortFlow FastAPI backend. Please check that the server is running on port 8000.',
        'CONNECTION_ERROR',
        503
      );
    }
    throw new ApiClientError(
      err instanceof Error ? err.message : 'Unknown network error occurred.',
      'NETWORK_ERROR',
      500
    );
  }
}

export async function fetchHealth() {
  return request<{ status: string; service: string; version: string }>('/health');
}

export async function fetchDashboardSummary(
  portCode: string = 'PFA',
  horizonHours: number = 72,
  scenario: string = 'baseline'
): Promise<DashboardSummary> {
  const params = new URLSearchParams({
    port_code: portCode,
    horizon_hours: horizonHours.toString(),
    scenario,
  });
  return request<DashboardSummary>(`/dashboard/summary?${params.toString()}`);
}

export async function fetchCongestionForecast(
  portCode: string = 'PFA',
  horizonHours: number = 72,
  scenario: string = 'baseline'
): Promise<CongestionForecast> {
  const params = new URLSearchParams({
    port_code: portCode,
    horizon_hours: horizonHours.toString(),
    scenario,
  });
  return request<CongestionForecast>(`/dashboard/congestion?${params.toString()}`);
}

export async function fetchSchedules(
  portCode: string = 'PFA',
  scenario: string = 'baseline',
  startTime?: string,
  endTime?: string,
  page: number = 1,
  pageSize: number = 50
): Promise<SchedulesResponse> {
  const params = new URLSearchParams({
    port_code: portCode,
    scenario,
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (startTime) params.append('start_time', startTime);
  if (endTime) params.append('end_time', endTime);
  return request<SchedulesResponse>(`/schedules?${params.toString()}`);
}

export async function fetchBerths(
  portCode: string = 'PFA',
  scenario: string = 'baseline'
): Promise<BerthsResponse> {
  const params = new URLSearchParams({
    port_code: portCode,
    scenario,
  });
  return request<BerthsResponse>(`/resources/berths?${params.toString()}`);
}

export async function fetchCranes(
  portCode: string = 'PFA',
  scenario: string = 'baseline'
): Promise<CranesResponse> {
  const params = new URLSearchParams({
    port_code: portCode,
    scenario,
  });
  return request<CranesResponse>(`/resources/cranes?${params.toString()}`);
}

export async function fetchScenarios(): Promise<ScenariosResponse> {
  return request<ScenariosResponse>('/scenarios');
}