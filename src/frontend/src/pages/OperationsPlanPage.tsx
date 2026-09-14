import React, { useState } from 'react';
import { CalendarCheck2, CheckCircle2, XCircle, AlertTriangle, Clock, ArrowRight, ShieldCheck, HelpCircle, Ship } from 'lucide-react';

type PlanState = 'proposed' | 'approved' | 'rejected';

export const OperationsPlanPage: React.FC = () => {
  const [planState, setPlanState] = useState<PlanState>('proposed');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleApprove = () => {
    setPlanState('approved');
    setShowApproveDialog(false);
  };

  const handleReject = () => {
    setPlanState('rejected');
    setShowRejectDialog(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">72-Hour Port Operations Plan</h1>
        <p className="text-sm text-slate-500 mt-1">Supervisor shift plan, routing decisions, and handover notes</p>
      </div>

      {/* Workflow stepper */}
      <div className="flex items-center justify-between max-w-3xl mx-auto py-4">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold mb-1"><CheckCircle2 className="w-5 h-5" /></div>
          <span className="text-xs font-medium text-slate-700">1. Generate</span>
        </div>
        <div className="flex-1 h-0.5 bg-emerald-500 mx-2"></div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold mb-1"><CheckCircle2 className="w-5 h-5" /></div>
          <span className="text-xs font-medium text-slate-700">2. Review</span>
        </div>
        <div className={`flex-1 h-0.5 mx-2 ${planState !== 'proposed' ? (planState === 'approved' ? 'bg-emerald-500' : 'bg-red-500') : 'bg-amber-500'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 text-white ${
            planState === 'proposed' ? 'bg-amber-500' : planState === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
          }`}>
            {planState === 'proposed' ? '3' : planState === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          </div>
          <span className="text-xs font-medium text-slate-700">3. Decision</span>
        </div>
        <div className={`flex-1 h-0.5 mx-2 ${planState === 'approved' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 ${
            planState === 'approved' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
          }`}>4</div>
          <span className={`text-xs font-medium ${planState === 'approved' ? 'text-slate-700' : 'text-slate-400'}`}>4. Active</span>
        </div>
      </div>

      {/* Plan state block */}
      <div className={`rounded-xl border shadow-sm p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        planState === 'proposed' ? 'bg-white border-amber-200' : 
        planState === 'approved' ? 'bg-emerald-50 border-emerald-200' : 
        'bg-red-50 border-red-200'
      }`}>
        <div>
          <h2 className={`text-lg font-bold flex items-center gap-2 mb-2 ${
            planState === 'proposed' ? 'text-amber-800' : 
            planState === 'approved' ? 'text-emerald-800' : 
            'text-red-800'
          }`}>
            {planState === 'proposed' && <><AlertTriangle className="w-5 h-5" /> Proposed Plan</>}
            {planState === 'approved' && <><ShieldCheck className="w-5 h-5" /> Active Demo Plan</>}
            {planState === 'rejected' && <><XCircle className="w-5 h-5" /> Rejected Plan</>}
          </h2>
          
          {planState === 'proposed' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-sm text-slate-600">
              <div><span className="text-slate-400">Generated:</span> 10:42 UTC</div>
              <div><span className="text-slate-400">Horizon:</span> 72 hours</div>
              <div><span className="text-slate-400">Solver:</span> CP-SAT</div>
              <div><span className="text-slate-400">Plan ID:</span> PL-8924-X</div>
            </div>
          )}
          
          {planState === 'approved' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-emerald-700">
              <div><span className="opacity-75">Approved by:</span> DEMO-SUPERVISOR</div>
              <div><span className="opacity-75">Approved at:</span> 10:46 UTC</div>
            </div>
          )}

          {planState === 'rejected' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-red-700">
              <div><span className="opacity-75">Rejected by:</span> DEMO-SUPERVISOR</div>
              <div><span className="opacity-75">Rejected at:</span> 10:46 UTC</div>
            </div>
          )}
        </div>

        {planState === 'proposed' && (
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowRejectDialog(true)}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-sm font-medium transition-colors"
            >
              Reject Plan
            </button>
            <button 
              onClick={() => setShowApproveDialog(true)}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              Approve Plan
            </button>
          </div>
        )}
      </div>

      {/* Assignment table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Berth Assignments</h3>
          {planState === 'approved' && (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded uppercase tracking-wide">
              Active Plan
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-3 border-b border-slate-200">Vessel</th>
                <th className="px-4 py-3 border-b border-slate-200">Berth</th>
                <th className="px-4 py-3 border-b border-slate-200">Start</th>
                <th className="px-4 py-3 border-b border-slate-200">End</th>
                <th className="px-4 py-3 border-b border-slate-200">Cranes</th>
                <th className="px-4 py-3 border-b border-slate-200">Waiting Time</th>
                <th className="px-4 py-3 border-b border-slate-200">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Changed/Recommended Assignment */}
              <tr className="bg-amber-50/50 hover:bg-amber-50">
                <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                  <Ship className="w-4 h-4 text-amber-500" />
                  Vessel A
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-200 text-amber-700 ml-1" title="Changed from original schedule">
                    <HelpCircle className="w-3 h-3" />
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 font-mono">B01</td>
                <td className="px-4 py-3 text-slate-600">09:00</td>
                <td className="px-4 py-3 text-slate-600">12:00</td>
                <td className="px-4 py-3 text-slate-600">2</td>
                <td className="px-4 py-3 text-slate-600">0m</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">P1</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                  <Ship className="w-4 h-4 text-slate-400" />
                  Vessel B
                </td>
                <td className="px-4 py-3 text-slate-600 font-mono">B02</td>
                <td className="px-4 py-3 text-slate-600">09:15</td>
                <td className="px-4 py-3 text-slate-600">11:30</td>
                <td className="px-4 py-3 text-slate-600">2</td>
                <td className="px-4 py-3 text-slate-600">10m</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-semibold">P2</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                  <Ship className="w-4 h-4 text-slate-400" />
                  Vessel C
                </td>
                <td className="px-4 py-3 text-slate-600 font-mono">B03</td>
                <td className="px-4 py-3 text-slate-600">09:30</td>
                <td className="px-4 py-3 text-slate-600">13:15</td>
                <td className="px-4 py-3 text-slate-600">1</td>
                <td className="px-4 py-3 text-amber-600 font-medium">45m</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-semibold">P2</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Unscheduled Vessel Card */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
        <div className="mt-0.5 text-orange-500">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-orange-900">Unscheduled Vessel Warning</h4>
          <p className="text-sm text-orange-800 mt-1">
            <strong>Vessel Omega</strong> could not be scheduled within the 72-hour horizon due to draft restrictions at available berths.
            The optimizer recommends diverting to an alternate port or waiting for Berth B04 maintenance completion.
          </p>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      {showApproveDialog && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
            <div className="p-5">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Approve Operations Plan?</h3>
              <p className="text-sm text-slate-600 mb-4">
                This will commit the CP-SAT optimized schedule and notify all terminal operators. Are you sure you want to proceed?
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowApproveDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApprove}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                  Confirm Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectDialog && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
            <div className="p-5">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Reject Operations Plan?</h3>
              <p className="text-sm text-slate-600 mb-4">
                This will discard the current proposed schedule. You will need to adjust constraints or data and generate a new plan.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowRejectDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};