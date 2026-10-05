import React from 'react';
import { Clock, Eye, Wrench, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function StatusBadge({ status = 'SUBMITTED', size = 'md' }) {
  const configs = {
    SUBMITTED: {
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Clock,
      label: 'Submitted',
    },
    UNDER_REVIEW: {
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: Eye,
      label: 'Under Review',
    },
    MAINTENANCE_SCHEDULED: {
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Wrench,
      label: 'Maintenance Scheduled',
    },
    IN_PROGRESS: {
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: PlayCircle,
      label: 'In Progress',
    },
    RESOLVED: {
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      label: 'Resolved',
    },
  };

  const config = configs[status] || configs.SUBMITTED;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1' 
    : size === 'lg'
    ? 'text-sm px-3 py-1.5 gap-1.5 font-semibold'
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-sans whitespace-nowrap shrink-0 ${config.color} ${sizeClasses}`}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
