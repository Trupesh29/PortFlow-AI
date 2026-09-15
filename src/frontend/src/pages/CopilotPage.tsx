import React, { useState } from 'react';
import { Bot, Sparkles, Database, Code2, MessageSquare, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string | React.ReactNode;
}

const suggestedQuestions = [
  "Why is congestion high tomorrow?",
  "Which vessel has the highest predicted wait?",
  "What does the optimizer recommend?",
  "Explain the active plan."
];

export const CopilotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleAsk = (question: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', content: question }]);
    
    // Simulate delay then answer
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: <CopilotAnswer />
      }]);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleAsk(inputValue);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto">
      <div className="border-b border-port-lavender pb-4 shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2 text-port-lavenderDark">
          <Bot className="w-6 h-6" />
          AI Copilot — IBM Bob
        </h1>
        <p className="text-sm text-slate-500 mt-1">Conversational explainability for congestion risks, routing benefits, and shift handover</p>
      </div>

      {messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto py-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="w-16 h-16 bg-port-lavender rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-200 shadow-sm">
              <Sparkles className="w-8 h-8 text-port-lavenderDark" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">How can I help you manage terminal operations?</h2>
            <p className="text-slate-500">Ask questions about predicted congestion, optimization plans, or specific vessel schedules.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto px-4">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleAsk(q)}
                className="bg-port-lavender border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all rounded-xl p-4 text-left flex flex-col gap-2 group"
              >
                <MessageSquare className="w-5 h-5 text-port-lavenderDark opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm font-semibold text-port-lavenderDark">{q}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-6 space-y-6 px-2 sm:px-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'user' ? (
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-2xl rounded-tr-sm py-3 px-4 max-w-[80%] shadow-sm">
                  {msg.content}
                </div>
              ) : (
                <div className="flex gap-4 w-full">
                  <div className="w-8 h-8 bg-port-lavender rounded-full flex items-center justify-center shrink-0 border border-purple-200 mt-1">
                    <Bot className="w-4 h-4 text-port-lavenderDark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="shrink-0 pt-4 bg-port-warmWhite sticky bottom-0 border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask IBM Bob about terminal operations..."
            className="w-full bg-white border border-slate-300 rounded-full py-3.5 pl-6 pr-14 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-port-lavenderDark focus:border-port-lavenderDark transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-port-lavender hover:bg-purple-200 disabled:opacity-50 text-port-lavenderDark rounded-full flex items-center justify-center transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-3 text-xs text-slate-400">
          IBM Bob uses PortFlow API data to explain operational context and decisions.
        </div>
      </div>
    </div>
  );
};

// Structured Answer Component
const CopilotAnswer: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {/* Answer Content */}
      <div className="p-5 space-y-4 border-l-4 border-l-port-lavenderDark">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Situation</h4>
            <p className="text-sm text-slate-800 font-medium">Congestion peaks tomorrow at 14:00 UTC with 3 vessels queued.</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evidence</h4>
            <p className="text-sm text-slate-600">Berth B03 maintenance limits capacity, causing a backlog for arriving Panamax vessels.</p>
          </div>
        </div>
        
        <div className="pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Recommendation</h4>
          <p className="text-sm text-slate-800 bg-port-lavender/50 p-3 rounded-lg border border-purple-100 inline-block">
            <strong>Run Joint Optimizer</strong> with 72-hour horizon to reallocate cranes to Berth B01/B02 and speed up service times.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Limitation</h4>
          <p className="text-sm text-slate-500 italic">This recommendation relies on scheduled arrival times (ETA). Weather delays could invalidate this plan.</p>
        </div>
      </div>
      
      {/* Required Answer Metadata */}
      <div className="bg-slate-50 border-t border-slate-100 p-3 px-5 flex flex-wrap gap-4 text-[10px] uppercase font-mono tracking-wider text-slate-500">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span>Source: <span className="font-bold text-slate-700">PortFlow API</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Method: <span className="font-bold text-slate-700">IBM Bob Provider</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          <span>Data: <span className="font-bold text-slate-700">Synthetic Demo Data</span></span>
        </div>
      </div>
    </div>
  );
};
