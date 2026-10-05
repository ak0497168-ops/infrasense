import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ level = 'Low', score, size = 'md' }) {
  const normalizedLevel = String(level).toUpperCase();

  const configs = {
    LOW: {
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: CheckCircle,
      label: 'Low Risk',
    },
    MODERATE: {
      color: 'text-amber-800 bg-amber-50 border-amber-200',
      icon: AlertTriangle,
      label: 'Moderate Risk',
    },
    HIGH: {
      color: 'text-orange-800 bg-orange-50 border-orange-200',
      icon: AlertCircle,
      label: 'High Risk',
    },
    CRITICAL: {
      color: 'text-rose-800 bg-rose-50 border-rose-200',
      icon: ShieldAlert,
      label: 'Critical Risk',
    },
  };

  const config = configs[normalizedLevel] || configs.LOW;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1' 
    : size === 'lg' 
    ? 'text-sm px-3 py-1 gap-1.5 font-semibold' 
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-sans whitespace-nowrap shrink-0 ${config.color} ${sizeClasses}`}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="font-mono tabular-nums opacity-85 ml-0.5">({score}/100)</span>
      )}
    </span>
  );
}
