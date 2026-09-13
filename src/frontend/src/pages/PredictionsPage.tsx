import React, { useCallback, useEffect, useState } from 'react';
import {
  Brain,
  Clock,
  RefreshCw,
  ServerCrash,
  ChevronDown,
  Gauge,
  BarChart3,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  ApiClientError,
  fetchSchedules,
  postCongestionPrediction,
  postWaitingTimePrediction,
} from '../api/client';
import {
  CongestionMLPrediction,
  CongestionSlot,
  ExplanationFactor,
  ScheduleItem,
  WaitingTimePrediction,
} from '../types/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function riskColor(level: string): string {
  switch (level?.toUpperCase()) {
    case 'CRITICAL': return 'text-rose-400 bg-rose-950/60 border-rose-500/40';
    case 'HIGH':     return 'text-orange-400 bg-orange-950/60 border-orange-500/40';
    case 'MEDIUM':   return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
    default:         return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
  }
}

function riskDot(level: string): string {
  switch (level?.toUpperCase()) {
    case 'CRITICAL': return 'bg-rose-400';
    case 'HIGH':     return 'bg-orange-400';
    case 'MEDIUM':   return 'bg-amber-400';
    default:         return 'bg-emerald-400';
  }
}

function fmt2(n: number): string {
  return n.toFixed(2);
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  } catch { return iso; }
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  } catch { return iso; }
}

// ── Sub-components ────────────────────────────────────────────────────────────

const ModelUnavailableBanner: React.FC<{ model: string }> = ({ model }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-sm">
    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
    <div>
      <p className="font-semibold text-amber-300">Model artifacts not found — {model}</p>
      <p className="text-slate-400 mt-1 text-xs">
        Run <code className="font-mono text-teal-300 bg-slate-900/60 px-1 rounded">python -m ml.train</code> from the{' '}
        <code className="font-mono text-teal-300 bg-slate-900/60 px-1 rounded">src/</code> directory to train and
        persist the scikit-learn models, then retry.
      </p>
    </div>
  </div>
);

const ExplanationCard: React.FC<{ factor: ExplanationFactor }> = ({ factor }) => {
  const pct = Math.round(factor.contribution * 100);
  return (
    <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-700/40 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-200 font-mono">{factor.factor}</span>
        <span className="text-xs font-bold text-teal-400">{pct}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all"
          style={{ width: `${Math.min(100, pct * 2)}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{factor.description}</p>
    </div>
  );
};

const WaitingTimResult: React.FC<{ result: WaitingTimePrediction }> = ({ result }) => (
  <div className="space-y-4">
    {/* Main metric */}
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-3 sm:col-span-1 p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-center">
        <p className="text-xs text-teal-300 font-semibold uppercase tracking-wider mb-1">Predicted Wait</p>
        <p className="text-3xl font-black text-teal-300">{fmt2(result.predicted_waiting_time_hours)}<span className="text-base font-normal ml-1">h</span></p>
        <p className="text-xs text-slate-400 mt-1">
          [{fmt2(result.prediction_lower_bound_hours)}h – {fmt2(result.prediction_upper_bound_hours)}h]
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-navy-900/60 border border-slate-700/40 text-center">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Confidence</p>
        <p className="text-2xl font-bold text-slate-100">{fmtPct(result.confidence)}</p>
        <p className="text-xs text-slate-500 mt-1">model confidence</p>
      </div>
      <div className="p-4 rounded-2xl bg-navy-900/60 border border-slate-700/40 text-center">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Model</p>
        <p className="text-sm font-bold text-slate-200 font-mono">{result.model_version}</p>
        <p className="text-xs text-slate-500 mt-1">{result.data_source}</p>
      </div>
    </div>

    {/* Explanation factors */}
    {result.explanation_factors.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contributing Factors</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {result.explanation_factors.map((f, i) => (
            <ExplanationCard key={i} factor={f} />
          ))}
        </div>
      </div>
    )}
  </div>
);

const CongestionSlotRow: React.FC<{ slot: CongestionSlot; isFirst: boolean }> = ({ slot, isFirst }) => {
  const barPct = Math.round(slot.congestion_probability * 100);
  return (
    <div className={`flex items-center gap-3 py-2.5 px-3 rounded-xl ${isFirst ? 'bg-navy-900/80' : 'bg-navy-900/30'} border border-slate-800/60`}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${riskDot(slot.congestion_level)}`} />
      <div className="flex-shrink-0 w-28 text-xs text-slate-400">
        <span className="font-medium text-slate-300">{fmtDate(slot.slot_start_utc)}</span>
        <span className="mx-1">·</span>
        {fmtTime(slot.slot_start_utc)}–{fmtTime(slot.slot_end_utc)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${
                slot.congestion_level === 'CRITICAL' ? 'bg-rose-500' :
                slot.congestion_level === 'HIGH' ? 'bg-orange-500' :
                slot.congestion_level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${barPct}%` }}
            />
          </div>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${riskColor(slot.congestion_level)}`}>
            {fmtPct(slot.congestion_probability)}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 text-xs text-slate-500 w-16 text-right">
        {slot.vessel_count_expected} vessel{slot.vessel_count_expected !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const PredictionsPage: React.FC = () => {
  // Schedule selector state
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  // Waiting-time prediction state
  const [waitResult, setWaitResult] = useState<WaitingTimePrediction | null>(null);
  const [waitLoading, setWaitLoading] = useState(false);
  const [waitError, setWaitError] = useState<string | null>(null);
  const [waitModelMissing, setWaitModelMissing] = useState(false);

  // Congestion prediction state
  const [congResult, setCongResult] = useState<CongestionMLPrediction | null>(null);
  const [congLoading, setCongLoading] = useState(false);
  const [congError, setCongError] = useState<string | null>(null);
  const [congModelMissing, setCongModelMissing] = useState(false);
  const [windowHours, setWindowHours] = useState(48);

  // Load schedules on mount
  useEffect(() => {
    setSchedulesLoading(true);
    fetchSchedules('PFA', 'baseline', undefined, undefined, 1, 36)
      .then((res) => {
        setSchedules(res.data);
        if (res.data.length > 0) setSelectedScheduleId(res.data[0].schedule_id);
      })
      .catch(() => setSchedules([]))
      .finally(() => setSchedulesLoading(false));
  }, []);

  const runWaitingTimePrediction = useCallback(async () => {
    if (!selectedScheduleId) return;
    setWaitLoading(true);
    setWaitError(null);
    setWaitModelMissing(false);
    setWaitResult(null);
    try {
      const result = await postWaitingTimePrediction(selectedScheduleId);
      setWaitResult(result);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 503) {
        setWaitModelMissing(true);
      } else {
        setWaitError(err instanceof Error ? err.message : 'Prediction failed');
      }
    } finally {
      setWaitLoading(false);
    }
  }, [selectedScheduleId]);

  const runCongestionPrediction = useCallback(async () => {
    setCongLoading(true);
    setCongError(null);
    setCongModelMissing(false);
    setCongResult(null);
    // Use a fixed representative window: Jan 1–Jan 3 2026 (matches synthetic data)
    const start = '2026-01-01T00:00:00Z';
    const end = new Date(new Date(start).getTime() + windowHours * 3600 * 1000).toISOString();
    try {
      const result = await postCongestionPrediction(
        'a1b2c3d4-0000-0000-0000-000000000001',
        start,
        end,
        60
      );
      setCongResult(result);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 503) {
        setCongModelMissing(true);
      } else {
        setCongError(err instanceof Error ? err.message : 'Prediction failed');
      }
    } finally {
      setCongLoading(false);
    }
  }, [windowHours]);

  const selectedSchedule = schedules.find((s) => s.schedule_id === selectedScheduleId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">ML Predictions</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              GradientBoosting models trained on synthetic port operations data
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full border border-amber-500/40 bg-amber-950/40 text-amber-300 font-semibold">
          synthetic data
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Panel 1: Waiting-Time Prediction ── */}
        <div className="rounded-3xl border border-slate-700/50 bg-navy-950/80 backdrop-blur-sm p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold text-slate-100">Vessel Waiting-Time Prediction</h2>
          </div>
          <p className="text-xs text-slate-400">
            Predicts time (hours) a vessel will wait before berth assignment using
            the <code className="font-mono text-teal-300">GradientBoostingRegressor</code> (
            <code className="font-mono text-teal-300">waiting_time_v1</code>).
          </p>

          {/* Schedule selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Select Vessel Schedule
            </label>
            {schedulesLoading ? (
              <div className="h-9 rounded-xl bg-slate-800/60 animate-pulse" />
            ) : (
              <div className="relative">
                <select
                  id="schedule-selector"
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                  className="w-full appearance-none bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 pr-8 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 cursor-pointer"
                >
                  {schedules.map((s) => (
                    <option key={s.schedule_id} value={s.schedule_id}>
                      {s.vessel_name} — ETA {s.eta_utc?.substring(0, 16).replace('T', ' ')} UTC
                      {` (${s.expected_containers} moves)`}
                    </option>
                  ))}
                  {schedules.length === 0 && (
                    <option value="">No schedules loaded — start backend</option>
                  )}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              </div>
            )}
            {selectedSchedule && (
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-400">
                  Draft: <strong className="text-slate-300">{selectedSchedule.draft_m}m</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-400">
                  Length: <strong className="text-slate-300">{selectedSchedule.length_m}m</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-400">
                  Containers: <strong className="text-slate-300">{selectedSchedule.expected_containers}</strong>
                </span>
              </div>
            )}
          </div>

          <button
            id="run-waiting-time-prediction"
            onClick={runWaitingTimePrediction}
            disabled={waitLoading || !selectedScheduleId}
            className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {waitLoading ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Running Inference…</span></>
            ) : (
              <><Brain className="w-3.5 h-3.5" /><span>Predict Waiting Time</span></>
            )}
          </button>

          {waitModelMissing && <ModelUnavailableBanner model="waiting_time_v1" />}
          {waitError && (
            <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl p-3">
              <ServerCrash className="w-4 h-4 flex-shrink-0" />
              <span>{waitError}</span>
            </div>
          )}
          {waitResult && <WaitingTimResult result={waitResult} />}
        </div>

        {/* ── Panel 2: Congestion Prediction ── */}
        <div className="rounded-3xl border border-slate-700/50 bg-navy-950/80 backdrop-blur-sm p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Port Congestion Prediction</h2>
          </div>
          <p className="text-xs text-slate-400">
            Predicts congestion probability per hour using the{' '}
            <code className="font-mono text-teal-300">GradientBoostingClassifier</code> (
            <code className="font-mono text-teal-300">congestion_v1</code>,
            ROC-AUC 0.79, trained on 180 synthetic operations).
          </p>

          {/* Window selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Prediction Window
            </label>
            <div className="flex gap-2">
              {[12, 24, 48, 72].map((h) => (
                <button
                  key={h}
                  onClick={() => setWindowHours(h)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    windowHours === h
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <button
            id="run-congestion-prediction"
            onClick={runCongestionPrediction}
            disabled={congLoading}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {congLoading ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Running Inference…</span></>
            ) : (
              <><Gauge className="w-3.5 h-3.5" /><span>Predict Congestion ({windowHours}h)</span></>
            )}
          </button>

          {congModelMissing && <ModelUnavailableBanner model="congestion_v1" />}
          {congError && (
            <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl p-3">
              <ServerCrash className="w-4 h-4 flex-shrink-0" />
              <span>{congError}</span>
            </div>
          )}

          {congResult && (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {congResult.slots.length} slots · {congResult.model_version}
                </p>
                <span className="text-xs text-slate-500">{congResult.data_source}</span>
              </div>
              {congResult.slots.map((slot, idx) => (
                <CongestionSlotRow key={idx} slot={slot} isFirst={idx === 0} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex items-start gap-3 p-4 rounded-2xl border border-slate-700/40 bg-slate-900/30 text-xs text-slate-500">
        <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            <strong className="text-slate-400">Models trained on 180 synthetic rows</strong> from 5
            fictional scenarios. Waiting-time MAE: 23.5 min, 5-fold CV MAE: 23.8 min.
            Congestion classifier ROC-AUC: 0.79, F1: 0.79. These figures are for demonstration only.
          </p>
          <p>
            Predictions are labeled <code className="text-teal-400">data_source: synthetic</code> and
            use the <code className="text-teal-400">scikit-learn GradientBoosting</code> algorithms.
            No real port data is used.
          </p>
        </div>
      </div>
    </div>
  );
};