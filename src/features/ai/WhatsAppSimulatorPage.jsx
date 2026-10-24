import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { aiClient } from '../../services/ai/aiClient';
import { runWhatsAppEvalSuite, EVAL_SCENARIOS } from '../../services/whatsapp/evalSuite';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  Smartphone,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function WhatsAppSimulatorPage() {
  const [activeLang, setActiveLang] = useState('en'); // 'en', 'ta', 'tanglish'
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I am your Vennila Bike Showroom virtual assistant. How can I assist you with bikes or service today?',
      time: '10:00 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [humanTakeover, setHumanTakeover] = useState(false);
  const [toolLogs, setToolLogs] = useState([]);

  // Eval Suite State
  const [evalRunning, setEvalRunning] = useState(false);
  const [evalProgress, setEvalProgress] = useState({ current: 0, total: 20 });
  const [evalSummary, setEvalSummary] = useState(null);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newChatHistory = [...messages, userMsg];
    setMessages(newChatHistory);
    if (!customText) setInputText('');
    setIsTyping(true);

    try {
      const response = await aiClient.chat({
        messages: newChatHistory,
        language: activeLang,
        onToolCall: (log) => {
          setToolLogs((prev) => [log, ...prev]);
        },
      });

      if (response.needsHandoff) {
        setHumanTakeover(true);
        toast.error(`Automated Escalation: ${response.handoffReason}`);
      }

      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        needsHandoff: response.needsHandoff,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      toast.error('AI Simulator Error: ' + err.message);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRunEval = async () => {
    setEvalRunning(true);
    setEvalSummary(null);
    setEvalProgress({ current: 0, total: 20 });
    toast.info('Starting 20-Scenario WhatsApp AI Eval Suite...');

    try {
      const res = await runWhatsAppEvalSuite((current, total) => {
        setEvalProgress({ current, total });
      });
      setEvalSummary(res);
      if (res.passRatePercent === 100) {
        toast.success(`Eval Complete: ${res.passed}/20 Passed (100%)!`);
      } else {
        toast.warning(`Eval Complete: ${res.passed}/${res.total} Passed (${res.passRatePercent}%)`);
      }
    } catch (err) {
      toast.error('Eval error: ' + err.message);
    } finally {
      setEvalRunning(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content:
          activeLang === 'ta'
            ? 'வணக்கம்! வெண்ணிலா பைக் ஷோரூம் AI உதவியாளர். நான் உங்களுக்கு எவ்வாறு உதவலாம்?'
            : activeLang === 'tanglish'
            ? 'Vanakkam! Vennila Bike Showroom AI assistant here. Eppadi help pannalam?'
            : 'Hello! I am your Vennila Bike Showroom virtual assistant. How can I assist you with bikes or service today?',
        time: '10:00 AM',
      },
    ]);
    setToolLogs([]);
    setHumanTakeover(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-emerald-600" />
            WhatsApp AI Assistant Simulator & Eval Suite
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Simulate realistic customer interactions across English, Tamil, and Tanglish with deterministic store tools, guardrails, and automated eval benchmarks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={handleRunEval}
            disabled={evalRunning}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Play className={`w-4 h-4 mr-2 ${evalRunning ? 'animate-spin' : ''}`} />
            {evalRunning ? `Evaluating (${evalProgress.current}/${evalProgress.total})...` : 'Run 20-Scenario Eval Suite'}
          </Button>
          <Button variant="outline" onClick={handleResetChat}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Chat
          </Button>
        </div>
      </div>

      {/* Main Grid: Phone Simulator (Left) + Tools & Eval Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: WhatsApp Phone UI (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[420px] rounded-[38px] border-[8px] border-slate-800 shadow-2xl bg-slate-900 overflow-hidden flex flex-col h-[740px]">
            {/* Phone Top Speaker & Camera Notch */}
            <div className="bg-slate-800 h-6 flex items-center justify-center relative">
              <div className="w-16 h-3 bg-black rounded-full" />
            </div>

            {/* WhatsApp App Header */}
            <div className="bg-emerald-700 text-white p-3 flex items-center justify-between shadow">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-800 border-2 border-emerald-400 flex items-center justify-center font-bold text-white text-sm">
                  VB
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">Vennila Bike Assistant</h3>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Verified Showroom Bot
                  </p>
                </div>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-emerald-800/80 p-0.5 rounded-lg text-xs">
                {['en', 'ta', 'tanglish'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setActiveLang(l)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      activeLang === l ? 'bg-white text-emerald-900 font-bold' : 'text-emerald-200 hover:text-white'
                    }`}
                  >
                    {l === 'en' ? 'EN' : l === 'ta' ? 'தமிழ்' : 'Tanglish'}
                  </button>
                ))}
              </div>
            </div>

            {/* Human Takeover Alert Banner */}
            {humanTakeover && (
              <div className="bg-red-500 text-white px-3 py-1.5 text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 animate-bounce" />
                  Staff Takeover Active (AI Paused)
                </div>
                <button
                  onClick={() => setHumanTakeover(false)}
                  className="underline text-[10px] hover:text-red-100"
                >
                  Resume AI
                </button>
              </div>
            )}

            {/* WhatsApp Chat Messages Stream */}
            <div className="flex-1 bg-[#EFEAE2] dark:bg-slate-900 p-3 overflow-y-auto space-y-3 font-sans text-[13px]">
              <div className="text-center my-1">
                <span className="bg-white/70 dark:bg-slate-800/70 text-[10px] text-slate-500 px-2.5 py-0.5 rounded-full shadow-sm">
                  TODAY
                </span>
              </div>

              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-lg p-2.5 shadow-sm relative ${
                        isUser
                          ? 'bg-[#E7FFDB] text-slate-800 dark:bg-emerald-900 dark:text-white rounded-tr-none'
                          : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                        <span>{m.time}</span>
                        {isUser && <span className="text-blue-500 font-bold">✓✓</span>}
                      </div>

                      {m.sources && (
                        <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Grounded in: {m.sources.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1 text-xs text-slate-500 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full w-fit shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-75" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-150" />
                  <span className="ml-1 text-[11px]">Assistant typing...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-2 border-t border-slate-200 dark:border-slate-700 flex gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
              <button
                onClick={() => handleSendMessage('Check service slot for tomorrow 10 AM')}
                className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-2 py-1 rounded-full text-slate-700 dark:text-slate-200 hover:bg-emerald-50"
              >
                Service Slot
              </button>
              <button
                onClick={() => handleSendMessage('Bikes under 2 lakhs')}
                className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-2 py-1 rounded-full text-slate-700 dark:text-slate-200 hover:bg-emerald-50"
              >
                Bikes &lt; ₹2L
              </button>
              <button
                onClick={() => handleSendMessage('What is the status of my bike KA-01-MJ-4589?')}
                className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-2 py-1 rounded-full text-slate-700 dark:text-slate-200 hover:bg-emerald-50"
              >
                Check Job Status
              </button>
              <button
                onClick={() => handleSendMessage('I want to complain about delay, talk to human')}
                className="bg-white dark:bg-slate-700 border border-red-300 dark:border-red-600 px-2 py-1 rounded-full text-red-600 dark:text-red-300 hover:bg-red-50"
              >
                Test Handoff
              </button>
            </div>

            {/* Input Bar */}
            <div className="bg-white dark:bg-slate-800 p-2.5 flex items-center gap-2 border-t border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder={
                  activeLang === 'ta'
                    ? 'செய்தியைத் தட்டச்சு செய்யவும்...'
                    : activeLang === 'tanglish'
                    ? 'Message type pannunga...'
                    : 'Type a message...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Tool Inspector & 20-Scenario Eval Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tool Calls Inspector */}
          <Card className="p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Deterministic Tool Execution Inspector
                </h3>
              </div>
              <span className="text-xs text-slate-500">Live store executions</span>
            </div>

            <div className="mt-3 space-y-3 max-h-[260px] overflow-y-auto">
              {toolLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No tools invoked yet. Type a query like &quot;Bikes under 2 lakhs&quot; or &quot;Check slot tomorrow&quot;.
                </div>
              ) : (
                toolLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between mb-1.5 font-sans">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {log.toolName || log.name}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.durationMs}ms
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      <strong>Args:</strong> {JSON.stringify(log.args)}
                    </div>
                    <div className="mt-1 text-slate-700 dark:text-slate-200">
                      <strong>Output:</strong> {JSON.stringify(log.result)?.slice(0, 160)}...
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* 20-Scenario Automated Eval Panel */}
          <Card className="p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Bot className="w-5 h-5 text-emerald-600" />
                  20-Scenario Multi-turn Benchmark Eval Suite
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated test matrix verifying intent detection, tool calls, and guardrails across EN/TA/Tanglish.
                </p>
              </div>

              {evalSummary && (
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={evalSummary.passRatePercent === 100 ? 'Paid' : 'Pending'}
                    label={`${evalSummary.passed} / ${evalSummary.total} Passed (${evalSummary.passRatePercent}%)`}
                  />
                </div>
              )}
            </div>

            {/* Scenario Table */}
            <div className="mt-3 max-h-[340px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider sticky top-0">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Scenario Title</th>
                    <th className="p-2">Lang</th>
                    <th className="p-2">Expected Tool</th>
                    <th className="p-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {EVAL_SCENARIOS.map((sc) => {
                    const evalRes = evalSummary?.results?.find((r) => r.scenarioId === sc.id);
                    return (
                      <tr key={sc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2 font-mono text-slate-500">#{sc.id}</td>
                        <td className="p-2 text-slate-700 dark:text-slate-300 font-medium">{sc.category}</td>
                        <td className="p-2 text-slate-900 dark:text-white">{sc.title}</td>
                        <td className="p-2 uppercase font-mono text-[10px] text-slate-500">{sc.language}</td>
                        <td className="p-2 font-mono text-indigo-600 dark:text-indigo-400 text-[11px]">
                          {sc.expectedIntent}
                        </td>
                        <td className="p-2 text-right">
                          {evalRes ? (
                            evalRes.passed ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                                <XCircle className="w-3.5 h-3.5" /> Fail
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400">Ready</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
