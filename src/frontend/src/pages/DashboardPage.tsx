import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ServerCrash } from 'lucide-react';
import {
  ApiClientError,
  fetchBerths,
  fetchCongestionForecast,
  fetchCranes,
  fetchDashboardSummary,
  fetchSchedules,
  fetchScenarios,
} from '../api/client';
import {
  BerthResource,
  CongestionForecast,
  CraneResource,
  DashboardSummary,
  ScheduleItem,
  ScenarioItem,
} from '../types/api';
import { OperationalHeader } from '../components/dashboard/OperationalHeader';
import { ScenarioSelector } from '../components/dashboard/ScenarioSelector';
import { KpiCards } from '../components/dashboard/KpiCards';
import { CongestionChart } from '../components/dashboard/CongestionChart';
import { AffectedVesselsTable } from '../components/dashboard/AffectedVesselsTable';
import { BerthCraneStatusPanel } from '../components/dashboard/BerthCraneStatusPanel';
import { HonestDisclaimers } from '../components/dashboard/HonestDisclaimers';

export const DashboardPage: React.FC = () => {
  const [portCode] = useState<string>('PFA');
  const [horizonHours] = useState<number>(72);
  const [activeScenario, setActiveScenario] = useState<string>('baseline');

  // Data state
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [forecast, setForecast] = useState<CongestionForecast | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [berths, setBerths] = useState<BerthResource[]>([]);
  const [cranes, setCranes] = useState<CraneResource[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  const loadData = useCallback(async (scenarioKey: string) => {
    setLoading(true);
    setError(null);
    setErrorDetails([]);

    try {
      // Parallel fetch of all dashboard data
      const [
        summaryRes,
        forecastRes,
        schedulesRes,
        berthsRes,
        cranesRes,
        scenariosRes,
      ] = await Promise.all([
        fetchDashboardSummary(portCode, horizonHours, scenarioKey),
        fetchCongestionForecast(portCode, horizonHours, scenarioKey),
        fetchSchedules(portCode, scenarioKey),
        fetchBerths(portCode, scenarioKey),
        fetchCranes(portCode, scenarioKey),
        fetchScenarios(),
      ]);

      setSummary(summaryRes);
      setForecast(forecastRes);
      setSchedules(schedulesRes.data);
      setBerths(berthsRes.data);
      setCranes(cranesRes.data);
      setScenarios(scenariosRes.data);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        setErrorDetails(err.details.map((d) => `${d.field ? d.field + ': ' : ''}${d.issue}`));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while loading dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  }, [portCode, horizonHours]);

  useEffect(() => {
    loadData(activeScenario);
  }, [loadData, activeScenario]);

  const handleScenarioChange = (scenarioKey: string) => {
    setActiveScenario(scenarioKey);
  };

  const handleRetry = () => {
    loadData(activeScenario);
  };

  // Error State Render
  if (error && !summary) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-navy-900/90 border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ServerCrash className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Backend Connection Required</h2>
            <p className="text-xs text-rose-300 mt-2 bg-rose-950/40 p-3 rounded-xl border border-rose-500/20 font-mono">
              {error}
            </p>
            {errorDetails.length > 0 && (
              <ul className="text-left text-xs text-slate-400 mt-2 space-y-1 bg-navy-950/80 p-3 rounded-xl border border-slate-800">
                {errorDetails.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-400">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Ensure the FastAPI server is running with <code className="font-mono text-teal-300">python -m uvicorn backend.app.main:app --port 8000</code>.
          </p>
          <button
            onClick={handleRetry}
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all shadow-lg cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Operational Header */}
      <OperationalHeader
        port={summary?.port}
        horizonHours={horizonHours}
        scenario={activeScenario}
        isSynthetic={summary?.is_synthetic ?? true}
        calculationMethod={summary?.calculation_method ?? 'baseline_rule_v1'}
        asOfUtc={summary?.as_of_utc}
        loading={loading}
        onRefresh={handleRetry}
      />

      {/* 2. Scenario Simulator Selector */}
      <ScenarioSelector
        scenarios={scenarios}
        activeScenario={activeScenario}
        onSelectScenario={handleScenarioChange}
        loading={loading}
      />

      {/* 3. Real KPI Cards */}
      <KpiCards summary={summary ?? undefined} />

      {/* 4. 72-Hour Congestion Timeline Chart */}
      <CongestionChart
        forecast={forecast ?? undefined}
        selectedScenario={activeScenario}
      />

      {/* 5. Berth & Crane Status Panels */}
      <BerthCraneStatusPanel
        berths={berths}
        cranes={cranes}
        loading={loading}
      />

      {/* 6. Affected-Vessels Queue Table */}
      <AffectedVesselsTable
        schedules={schedules}
        loading={loading}
      />

      {/* 7. Transparent Honest Disclaimers */}
      <HonestDisclaimers />
    </div>
  );
};