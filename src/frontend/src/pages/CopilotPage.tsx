import React from 'react';
import { EmptyState } from '../components/common/EmptyState';

export const CopilotPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100">AI Copilot — IBM Bob</h1>
        <p className="text-xs text-slate-400 mt-0.5">Conversational explainability for congestion risks, routing benefits, and shift handover</p>
      </div>
      <EmptyState
        title="AI Copilot MCP Server Standby"
        description="IBM Bob connects via MCP tools to explain waiting-time predictions, draft bottlenecks, and alternate port cost trade-offs."
      />
    </div>
  );
};