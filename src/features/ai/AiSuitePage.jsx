import React, { useState } from 'react';
import WhatsAppSimulatorPage from './WhatsAppSimulatorPage';
import AiCopilotPage from './AiCopilotPage';
import OcrStudioPage from './OcrStudioPage';
import NlqReportsPage from './NlqReportsPage';
import AiToolkitPage from './pages/AiToolkitPage';
import {
  Smartphone,
  Sparkles,
  ScanLine,
  FileSpreadsheet,
  Wrench,
  Bot
} from 'lucide-react';

export default function AiSuitePage() {
  const [activeTab, setActiveTab] = useState('toolkit'); // 'toolkit', 'whatsapp', 'copilot', 'ocr', 'nlq'

  return (
    <div className="space-y-6">
      {/* Top Tab Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('toolkit')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-t-lg font-medium text-sm transition-all border-b-2 ${
            activeTab === 'toolkit'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Bot className="w-4 h-4 text-blue-600" />
          <span>AI Dealership Toolkit (E1-E8)</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-t-lg font-medium text-sm transition-all border-b-2 ${
            activeTab === 'whatsapp'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>WhatsApp Simulator &amp; Eval</span>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-t-lg font-medium text-sm transition-all border-b-2 ${
            activeTab === 'copilot'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Dealership AI Copilot</span>
        </button>

        <button
          onClick={() => setActiveTab('ocr')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-t-lg font-medium text-sm transition-all border-b-2 ${
            activeTab === 'ocr'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <ScanLine className="w-4 h-4 text-indigo-600" />
          <span>OCR Studio (RC / DL / GST)</span>
        </button>

        <button
          onClick={() => setActiveTab('nlq')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-t-lg font-medium text-sm transition-all border-b-2 ${
            activeTab === 'nlq'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Natural-Language Reports</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'toolkit' && <AiToolkitPage />}
        {activeTab === 'whatsapp' && <WhatsAppSimulatorPage />}
        {activeTab === 'copilot' && <AiCopilotPage />}
        {activeTab === 'ocr' && <OcrStudioPage />}
        {activeTab === 'nlq' && <NlqReportsPage />}
      </div>
    </div>
  );
}
