import React from 'react';
import { History, MessageSquare, CloudRain, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function RiskFactorCard({ factorKey, title, factor }) {
  const icons = {
    historicalMaintenance: History,
    publicComplaints: MessageSquare,
    climate: CloudRain,
    sensorData: Cpu,
    currentSeverity: AlertTriangle,
    infrastructureCondition: ShieldCheck,
  };

  const Icon = icons[factorKey] || AlertTriangle;

  const isHigh = factor?.impact?.includes('High') || (factor?.score && factor.score >= 70);
  const isModerate = factor?.impact?.includes('Moderate') || (factor?.score && factor.score >= 40 && factor.score < 70);

  const badgeColor = isHigh 
    ? 'text-rose-700 bg-rose-50 border-rose-200' 
    : isModerate 
    ? 'text-amber-800 bg-amber-50 border-amber-200' 
    : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  const barColor = isHigh 
    ? 'bg-rose-500' 
    : isModerate 
    ? 'bg-amber-500' 
    : 'bg-emerald-500';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-sky-800" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 leading-tight">
              {title}
            </h4>
          </div>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded border whitespace-nowrap ${badgeColor}`}>
            {factor?.impact || 'Standard'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mt-1">
          {factor?.description || 'Municipal baseline telemetry is stable.'}
        </p>
      </div>

      {factor?.score !== undefined && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
            <span>Factor Influence</span>
            <span className="font-mono tabular-nums font-semibold text-slate-700">
              {factor.score}/100
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${Math.min(100, Math.max(5, factor.score))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
