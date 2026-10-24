import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { aiClient } from '../../services/ai/aiClient';
import {
  Sparkles,
  Send,
  Terminal,
  Database,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  Boxes,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function AiCopilotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'system',
      content:
        'Vennila Dealership AI Copilot initialized. Connected to live Bangalore Flagship store state (Vehicle Stock, Job Cards, Parts, Accounting Ledger). All responses are strictly grounded in store selectors.',
    },
    {
      id: 2,
      role: 'assistant',
      content:
        'Hello Rajesh Varma (Super Admin). How can I assist you with dealership operations, inventory, or financial analytics today?',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (queryText = null) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: q,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const response = await aiClient.chat({
        messages: newHistory,
        language: 'en',
      });

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.reply,
        toolCalls: response.toolCalls,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      toast.error('Copilot Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getSourceLink = (source) => {
    if (source.includes('Stock') || source.includes('Vehicle')) return '/stock/vehicles';
    if (source.includes('Part') || source.includes('Inventory')) return '/stock/parts';
    if (source.includes('Workshop') || source.includes('Job') || source.includes('Calendar')) return '/service/jobs';
    if (source.includes('Insurance')) return '/insurance-rto';
    return '/reports';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
            Dealership AI Copilot Terminal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Natural language assistant grounded in showroom sales, inventory, service bays, and statutory tax engines.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Zero Hallucination: Grounded in Zustand Store</span>
        </div>
      </div>

      {/* Main Terminal View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Stream (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[650px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Terminal Banner */}
          <div className="bg-slate-900 text-slate-300 px-4 py-2.5 flex items-center justify-between text-xs font-mono border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>ai-copilot@vennila-erp:~$ session_active (v2.4)</span>
            </div>
            <span className="text-[11px] text-slate-400">Model: Gemini 2.5 Flash / Store Engine</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              const isSys = m.role === 'system';

              if (isSys) {
                return (
                  <div
                    key={m.id}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-500 font-mono border border-slate-200/80 dark:border-slate-700/60"
                  >
                    {m.content}
                  </div>
                );
              }

              return (
                <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl p-3.5 shadow-sm text-sm ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed font-sans">{m.content}</div>

                    {/* Tool Calls Execution Metadata */}
                    {m.toolCalls && m.toolCalls.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/70 space-y-1.5">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Executed Store Tools:
                        </div>
                        {m.toolCalls.map((tc, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 text-xs font-mono flex items-center justify-between"
                          >
                            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {tc.toolName}
                            </span>
                            <span className="text-[10px] text-slate-400">{tc.durationMs}ms</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Grounding Source Chips */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Sources:</span>
                        {m.sources.map((src, i) => (
                          <Link
                            key={i}
                            to={getSourceLink(src)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:underline"
                          >
                            <Database className="w-2.5 h-2.5" />
                            {src}
                            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg w-fit">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                Querying store selectors and running calculations...
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Copilot: e.g. 'Show available service slots tomorrow' or 'Explain Service Absorption ratio'..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <Button
              variant="primary"
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Suggested Queries & Shortcut Hub (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Dealership Prompts
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleSend('Show me all bikes in stock under 2 Lakhs')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
              >
                <Boxes className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Show bikes in stock under ₹2,00,000</span>
              </button>

              <button
                onClick={() => handleSend('Check available workshop service slots for tomorrow')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
              >
                <Calendar className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Check open workshop bay slots for tomorrow</span>
              </button>

              <button
                onClick={() => handleSend('List all spare parts running below safety reorder level')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
              >
                <Layers className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <span>List spare parts below safety reorder level</span>
              </button>

              <button
                onClick={() => handleSend('Which customer insurance policies are expiring soon?')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
              >
                <TrendingUp className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <span>Pending insurance renewals for CRM outreach</span>
              </button>

              <button
                onClick={() => handleSend('Explain the formula for Service Absorption Ratio and Showroom Gross Margin')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
              >
                <HelpCircle className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                <span>Explain Service Absorption Ratio & Gross Margin</span>
              </button>
            </div>
          </Card>

          {/* Capabilities Card */}
          <Card className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800 dark:to-slate-800/60">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Statutory Guarantees
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
              <li>GST rates applied dynamically from effective-dated catalog.</li>
              <li>Calculates all currency in integer paise with zero floating roundoff.</li>
              <li>Chassis double-allocation prevented across all store workflows.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
