import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  Droplets,
  Thermometer,
  CloudRain,
  Compass,
  Construction,
  Lightbulb,
  Landmark,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Users
} from 'lucide-react';
import { insightsAPI } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function InsightsPage() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [environment, setEnvironment] = useState(null);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllInsights() {
      try {
        const [overviewRes, trendsRes, envRes, commRes] = await Promise.all([
          insightsAPI.getOverview().catch(() => null),
          insightsAPI.getTrends().catch(() => null),
          insightsAPI.getEnvironment().catch(() => null),
          insightsAPI.getCommunity().catch(() => null),
        ]);

        if (overviewRes?.data?.data) setOverview(overviewRes.data.data);
        if (trendsRes?.data?.data) setTrends(trendsRes.data.data);
        if (envRes?.data?.data) setEnvironment(envRes.data.data);
        if (commRes?.data?.data) setCommunity(commRes.data.data);
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllInsights();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating civic risk telemetry and health models..." />;
  }

  const categoryIcons = {
    Roads: Compass,
    Bridges: Construction,
    Streetlights: Lightbulb,
    'Water Pipelines': Droplets,
    'Public Buildings': Landmark,
    Drainage: Activity,
  };

  const PIE_COLORS = ['#10b981', '#f59e0b', '#6366f1', '#38bdf8'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4" />
          <span>Municipal Analytics & Predictive Monitoring</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Infrastructure Insights & Community Health
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Citizen telemetry, environmental risk variables, and predictive asset degradation across sectors
        </p>
      </div>

      {/* Overall Health Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs uppercase font-bold tracking-wider text-sky-400">
            Overall Infrastructure Health Index
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Civic Health Score: {overview?.overallHealth || 72}/100
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Synthesized across 6 municipal infrastructure categories in real time. Indicates stable operational resilience with heightened environmental strain in stormwater culverts.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-6 text-center">
          <div className="p-4 rounded-xl bg-white/10 border border-white/10">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tabular-nums">
              {overview?.overallHealth || 72}%
            </div>
            <div className="text-[11px] text-slate-300 mt-1 uppercase font-semibold tracking-wider">
              {overview?.healthRating || 'Stable'}
            </div>
          </div>
        </div>
      </section>

      {/* Category Health 6 Cards */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Category Asset Health Ratings
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time condition ratings synthesized from sensor thresholds and citizen reports
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {overview?.categoryHealth?.map((cat) => {
            const Icon = categoryIcons[cat.category] || Activity;
            const isGood = cat.healthScore >= 75;
            const isFair = cat.healthScore >= 60 && cat.healthScore < 75;

            return (
              <div
                key={cat.category}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-800 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{cat.category}</h4>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        isGood
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isFair
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {cat.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">Health Rating</span>
                    <span className="text-xl font-extrabold font-mono text-slate-900 tabular-nums">
                      {cat.healthScore}/100
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${
                        isGood ? 'bg-emerald-500' : isFair ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${cat.healthScore}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    <strong className="text-slate-800 font-semibold">{cat.activeIssues}</strong> active issues
                  </span>
                  <span>{cat.totalReports} total logged</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recharts Analytics Grids */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Trend Over Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Risk Score Trends Over Time
            </h3>
            <p className="text-xs text-slate-500">
              6-month historical average risk score and complaint resolution rate
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends?.monthlyRiskTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="avgRiskScore"
                  name="Avg Risk Score"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved Issues"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports by Category BarChart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Reports by Infrastructure Category
            </h3>
            <p className="text-xs text-slate-500">
              Volume distribution of citizen reports recorded across sectors
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends?.categoryDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Reports Count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Common Problems & Resolution Status */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Common Problems Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Most Common Infrastructure Defects
            </h3>
            <p className="text-xs text-slate-500">
              High-frequency failure types reported across localities
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {trends?.commonProblems?.map((prob, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{prob.problem}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{prob.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-800 tabular-nums">
                    {prob.count} reports
                  </div>
                  <div className="text-[11px] text-rose-600 font-medium">
                    Severity Index: {prob.severityIndex}/100
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Breakdown Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Resolution Status
            </h3>
            <p className="text-xs text-slate-500">
              Workflow disposition across municipal teams
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trends?.resolutionStatus || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                >
                  {trends?.resolutionStatus?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {trends?.resolutionStatus?.map((item, index) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-700">{item.status}</span>
                </div>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Environmental Conditions & Community Metrics */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Environmental Telemetry */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sky-800">
            <CloudRain className="w-5 h-5 text-sky-700" />
            <h3 className="text-base font-bold text-slate-900">
              Environmental & Climate Conditions
            </h3>
          </div>

          <p className="text-xs text-slate-500">
            Civic micro-climate stations measuring environmental stress factors
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span>Ambient Temp</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                {environment?.temperature || 29.4} {environment?.unitTemp || '°C'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                <span>Precipitation (24h)</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                {environment?.rainfallMm || 68.2} mm
              </div>
              <div className="text-[10px] text-sky-700 font-medium mt-0.5">
                {environment?.rainfallStatus}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>Relative Humidity</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                {environment?.humidity || 78}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Flood Risk Index</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-rose-700 tabular-nums">
                {environment?.floodRiskIndex || 72}/100
              </div>
              <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                {environment?.floodRiskLevel} Risk Zone
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 text-xs text-sky-900 leading-relaxed">
            <strong>Impact Note:</strong> {environment?.atmosphericNotes}
          </div>
        </div>

        {/* Community Reports Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sky-800">
            <Users className="w-5 h-5 text-sky-700" />
            <h3 className="text-base font-bold text-slate-900">
              Community Civic Participation
            </h3>
          </div>

          <p className="text-xs text-slate-500">
            Citizen involvement statistics and local municipal dispatch response
          </p>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Total Complaints Handled</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {community?.totalComplaints || 278}
              </span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Recent Reports (Last 30 Days)</span>
              <span className="font-mono font-bold text-sky-900 tabular-nums">
                {community?.recentComplaints30Days || 48}
              </span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Active Community Reporters</span>
              <span className="font-mono font-bold text-emerald-700 tabular-nums">
                {community?.activeVolunteers || 1240}
              </span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Average Repair Turnaround</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {community?.averageResolutionDays || 4.2} Days
              </span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Most Reported Category</span>
              <span className="font-bold text-slate-900">
                {community?.mostReportedCategory}
              </span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Highest-Risk Sector</span>
              <span className="font-bold text-rose-700">
                {community?.highestRiskCategory}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
