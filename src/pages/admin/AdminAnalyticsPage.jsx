import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  Clock,
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { adminAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAnalytics();
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating predictive analytics and resolution SLAs..." />;
  }

  const { reportsOverTime, reportsByCategory, commonProblems, statusBreakdown, metrics } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Municipal Performance & SLA Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Public Infrastructure Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Longitudinal analysis of failure points, resolution velocity, and predictive maintenance performance
        </p>
      </div>

      {/* 4 SLA KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Average Repair Turnaround</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-900 mt-1 tabular-nums">
            {metrics?.averageResolutionDays || 3.8} Days
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">
            ↓ 14% improvement vs Q2 baseline
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">SLA Compliance Rate</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 mt-1 tabular-nums">
            {metrics?.slaCompliancePercent || 88.5}%
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Target benchmark: 85%
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Municipal Health Index</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
            {metrics?.overallHealthScore || 74}/100
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Weighted across 6 categories
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">First Dispatch Response</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-700 mt-1 tabular-nums">
            {metrics?.firstResponseTimeHours || 4.2} Hours
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            From citizen intake to triage
          </span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reports Over Time */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Incident Volume Over Time</h3>
            <p className="text-xs text-slate-500">Total complaints logged vs issues resolved per month</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportsOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Reported"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Repairs Executed"
                  stroke="#10b981"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="highRisk"
                  name="High/Critical Risk"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports by Infrastructure */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Reports by Asset Classification</h3>
            <p className="text-xs text-slate-500">Defect concentration across municipal sectors</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportsByCategory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Logged Issues" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row: Common Problems & Resolution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Most Common Defect Types */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Highest-Frequency Defect Patterns</h3>
            <p className="text-xs text-slate-500">Recurring maintenance failure signatures identified by the system</p>
          </div>

          <div className="divide-y divide-slate-100">
            {commonProblems?.map((item, idx) => (
              <div key={`problem-${item.problem}-${idx}`} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{item.problem}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Rank #{idx + 1} across municipal districts</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 tabular-nums">
                    {item.count} Incidents
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Queue Disposition</h3>
            <p className="text-xs text-slate-500">Current workflow breakdown</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                >
                  {statusBreakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {statusBreakdown?.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
