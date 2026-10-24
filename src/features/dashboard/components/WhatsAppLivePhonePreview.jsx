import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { MessageSquareText, ChevronDown, ChevronUp, Send, Smartphone } from 'lucide-react';
import { formatTimeOnly } from '../../../lib/format';

export function WhatsAppLivePhonePreview({ conversations = [] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [replyText, setReplyText] = useState('');
  const activeConv = conversations[0] || null;

  return (
    <Card className="flex flex-col">
      <CardHeader className="cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div>
            <CardTitle className="text-xs">WhatsApp Customer Live Simulator</CardTitle>
            <p className="text-[10px] text-text-muted">Realtime customer message stream</p>
          </div>
        </div>
        <button className="text-text-muted hover:text-text-main p-1">
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </CardHeader>

      {!collapsed && (
        <CardContent className="p-3 bg-slate-50 dark:bg-navy-950/40">
          {activeConv ? (
            <div className="flex flex-col h-64 bg-[#E5DDD5] dark:bg-slate-900 rounded-lg p-2.5 overflow-hidden border border-border">
              {/* WhatsApp Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-black/10 dark:border-white/10 shrink-0">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {activeConv.customerName.slice(0, 1)}
                </div>
                <div className="flex-1 truncate">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {activeConv.customerName}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Online</div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-2 py-2">
                {activeConv.messages.map((msg) => {
                  const isOutbound = msg.direction === 'OUTBOUND';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-2 text-xs shadow-xs ${
                          isOutbound
                            ? 'bg-[#DCF8C6] text-slate-800'
                            : 'bg-white text-slate-800'
                        }`}
                      >
                        <p className="leading-snug">{msg.text}</p>
                        <div className="text-[9px] text-slate-400 text-right mt-1">
                          {formatTimeOnly(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Box */}
              <div className="pt-2 flex items-center gap-1.5 shrink-0">
                <input
                  type="text"
                  placeholder="Type a simulated customer message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-white text-xs text-slate-900 rounded-full px-3 py-1.5 border border-slate-300 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (replyText.trim()) setReplyText('');
                  }}
                  className="p-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-text-muted">No active chats</div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
