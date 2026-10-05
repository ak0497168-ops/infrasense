import React from 'react';
import { Check, Clock } from 'lucide-react';

export default function StatusTimeline({ currentStatus = 'SUBMITTED', updatedAt }) {
  const steps = [
    { key: 'SUBMITTED', title: 'Submitted & Received', desc: 'Logged into municipal civic repository' },
    { key: 'UNDER_REVIEW', title: 'Under Review', desc: 'Engineers validating severity and sensor correlations' },
    { key: 'MAINTENANCE_SCHEDULED', title: 'Maintenance Scheduled', desc: 'Work order and field resources assigned' },
    { key: 'IN_PROGRESS', title: 'In Progress', desc: 'Civic maintenance team executing on-site repairs' },
    { key: 'RESOLVED', title: 'Resolved', desc: 'Repairs completed and validated' },
  ];

  const statusOrder = ['SUBMITTED', 'UNDER_REVIEW', 'MAINTENANCE_SCHEDULED', 'IN_PROGRESS', 'RESOLVED'];
  const currentIndex = Math.max(0, statusOrder.indexOf(currentStatus));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Resolution Progress</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time status updates from civic public works</p>
        </div>
        {updatedAt && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {new Date(updatedAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:left-3 md:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;

          return (
            <div key={step.key} className="relative group">
              {/* Dot indicator */}
              <div
                className={`absolute -left-6 md:-left-8 top-0.5 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-sky-800 text-white ring-4 ring-sky-100'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[3]" />
                ) : (
                  <span className="text-[11px] md:text-xs">{idx + 1}</span>
                )}
              </div>

              <div className="ml-2">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? 'text-sky-900 font-bold'
                        : isDone
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      Current Stage
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${isCurrent ? 'text-slate-600' : 'text-slate-500'}`}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
