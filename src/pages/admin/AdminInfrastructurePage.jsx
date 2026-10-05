import React, { useState, useEffect } from 'react';
import {
  Compass,
  Construction,
  Lightbulb,
  Droplets,
  Landmark,
  Activity,
  Cpu,
  ShieldCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { adminAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function AdminInfrastructurePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryIcons = {
    Roads: Compass,
    Bridges: Construction,
    Streetlights: Lightbulb,
    'Water Pipelines': Droplets,
    'Public Buildings': Landmark,
    Drainage: Activity,
  };

  useEffect(() => {
    fetchInfrastructure();
  }, []);

  const fetchInfrastructure = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getInfrastructure();
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load infrastructure data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Querying municipal asset registers and sensor gateways..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4" />
          <span>Municipal Asset Health & Sensor Network</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Infrastructure Category Overview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Sector-wide condition ratings, open complaint backlogs, and real-time sensor monitoring telemetry
        </p>
      </div>

      {/* Grid of 6 Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => {
          const Icon = categoryIcons[cat.category] || Activity;
          const isStable = cat.healthScore >= 75;
          const isModerate = cat.healthScore >= 60 && cat.healthScore < 75;

          const badgeClass = isStable
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : isModerate
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-rose-50 text-rose-800 border-rose-200';

          return (
            <div
              key={`admin-cat-${cat.category || idx}-${idx}`}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-sky-900 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{cat.category}</h3>
                      <span className="text-[11px] text-slate-400 font-medium">Public Sector Asset</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeClass}`}>
                    {cat.status}
                  </span>
                </div>

                {/* Health Score Meter */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-500 font-medium">Health Rating</span>
                    <span className="font-mono font-extrabold text-slate-900 text-base tabular-nums">
                      {cat.healthScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isStable ? 'bg-emerald-500' : isModerate ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${cat.healthScore}%` }}
                    />
                  </div>
                </div>

                {/* Detailed Metrics List */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <span className="text-slate-500 block text-[11px]">Total Logged</span>
                    <strong className="text-slate-900 font-mono text-sm tabular-nums">
                      {cat.totalReports}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <span className="text-slate-500 block text-[11px]">Active / Open</span>
                    <strong className="text-amber-700 font-mono text-sm tabular-nums">
                      {cat.openReports}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <span className="text-slate-500 block text-[11px]">High/Critical Risk</span>
                    <strong className="text-rose-700 font-mono text-sm tabular-nums">
                      {cat.highRiskReports}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <span className="text-slate-500 block text-[11px]">Repaired / Resolved</span>
                    <strong className="text-emerald-700 font-mono text-sm tabular-nums">
                      {cat.resolvedReports}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Bottom Sensor Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-sky-700" />
                  <span>
                    <strong className="text-slate-800 font-mono">{cat.activeSensors}</strong> active telemetry stations
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  Avg Risk: {cat.averageRiskScore}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
