import React, { useState } from 'react';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Plus, 
  Filter, 
  Compass, 
  Truck, 
  Wrench, 
  PhoneCall,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { toast } from 'sonner';

const SAMPLE_TASKS = [
  {
    id: 'tsk-01',
    module: 'DELIVERY',
    title: 'Pre-Delivery Inspection (PDI) for Arjun Das (Hunter 350)',
    dueDate: '2026-10-24',
    time: '11:30 AM',
    priority: 'HIGH',
    assignee: 'Vikram Sethi',
    isMyTask: true,
    completed: false,
    entityLink: '/delivery',
  },
  {
    id: 'tsk-02',
    module: 'CRM_FOLLOWUP',
    title: 'Follow-up telecall with Kishore Gowda on exchange valuation',
    dueDate: '2026-10-24',
    time: '02:00 PM',
    priority: 'MEDIUM',
    assignee: 'Deepak Rao',
    isMyTask: false,
    completed: false,
    entityLink: '/leads/telecall',
  },
  {
    id: 'tsk-03',
    module: 'TEST_RIDE',
    title: 'Off-road Test Ride slot: Priya Singh (Himalayan 450)',
    dueDate: '2026-10-24',
    time: '04:30 PM',
    priority: 'HIGH',
    assignee: 'Deepak Rao',
    isMyTask: false,
    completed: false,
    entityLink: '/test-rides',
  },
  {
    id: 'tsk-04',
    module: 'RECEIVABLES',
    title: 'Collect overdue balance ₹39,000 from Rohit Chandran',
    dueDate: '2026-10-25',
    time: '10:00 AM',
    priority: 'HIGH',
    assignee: 'Suresh Iyer',
    isMyTask: false,
    completed: false,
    entityLink: '/finance/collections',
  },
  {
    id: 'tsk-05',
    module: 'COMPLAINT',
    title: 'Resolve engine oil leakage complaint for Vinay Bhaskar',
    dueDate: '2026-10-25',
    time: '12:00 PM',
    priority: 'URGENT',
    assignee: 'Karthik Raja',
    isMyTask: false,
    completed: false,
    entityLink: '/care/complaints',
  }
];

export function TasksCalendarPage() {
  const [tasks, setTasks] = useState(SAMPLE_TASKS);
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST' or 'CALENDAR'
  const [filterScope, setFilterScope] = useState('ALL'); // 'ALL' or 'MY_TASKS'
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const toggleTaskCompleted = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = !t.completed;
      toast.success(`Task "${t.title}" marked as ${next ? 'Completed' : 'Pending'}`);
      return { ...t, completed: next };
    }));
  };

  const filtered = tasks.filter(t => {
    const matchesScope = filterScope === 'ALL' || t.isMyTask;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesScope && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            Unified Tasks &amp; Operational Calendar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aggregated action items across Deliveries, Test Rides, Service Check-ins, Overdue Collections &amp; CRM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('LIST')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
              viewMode === 'LIST'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Task List ({filtered.filter(t => !t.completed).length})
          </button>
          <button
            onClick={() => setViewMode('CALENDAR')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
              viewMode === 'CALENDAR'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {viewMode === 'LIST' ? (
        /* Task List View with Filters */
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterScope('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                  filterScope === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                All Team Tasks
              </button>
              <button
                onClick={() => setFilterScope('MY_TASKS')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                  filterScope === 'MY_TASKS'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Assigned to Me
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Priority:</span>
              {['ALL', 'URGENT', 'HIGH', 'MEDIUM'].map(p => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                    priorityFilter === p ? 'bg-slate-200 dark:bg-slate-700 font-bold' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map(t => (
              <div 
                key={t.id} 
                className={`p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition ${
                  t.completed ? 'opacity-60 bg-slate-50/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTaskCompleted(t.id)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <div>
                    <h3 className={`text-xs font-bold ${t.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {t.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono">{t.dueDate} at {t.time}</span>
                      <span>•</span>
                      <span>Assigned to: {t.assignee}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                    t.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {t.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Calendar Schedule Grid */
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              October 2026 — Showroom Appointment Schedule
            </h2>
            <div className="text-xs font-bold text-blue-600">Today: 24 Oct 2026</div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="font-bold text-slate-400 uppercase py-1 text-[10px]">{d}</div>
            ))}

            {Array.from({ length: 31 }).map((_, idx) => {
              const day = idx + 1;
              const isToday = day === 24;
              return (
                <div 
                  key={day}
                  className={`p-2 rounded-xl border min-h-[70px] flex flex-col justify-between text-left text-xs ${
                    isToday 
                      ? 'bg-blue-50 border-blue-500 font-bold dark:bg-blue-950/40' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className={`text-[10px] ${isToday ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                    {day}
                  </span>
                  {day === 24 && (
                    <span className="p-1 rounded bg-blue-600 text-white text-[9px] font-bold truncate">
                      3 Deliveries Today
                    </span>
                  )}
                  {day === 26 && (
                    <span className="p-1 rounded bg-purple-600 text-white text-[9px] font-bold truncate">
                      2 VIP Test Rides
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksCalendarPage;
