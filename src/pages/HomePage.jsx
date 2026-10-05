import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Compass,
  FileText,
  Activity,
  Droplets,
  Construction,
  Landmark,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { insightsAPI, reportsAPI } from '../services/api.js';
import RiskBadge from '../components/RiskBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Citizen';

  useEffect(() => {
    async function loadData() {
      try {
        const [overviewRes, reportsRes] = await Promise.all([
          insightsAPI.getOverview().catch(() => null),
          reportsAPI.getMy({ limit: 3 }).catch(() => null),
        ]);

        if (overviewRes?.data?.data) {
          setOverview(overviewRes.data.data);
        }
        if (reportsRes?.data?.data?.reports) {
          setRecentReports(reportsRes.data.data.reports.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching home dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    {
      id: 'Roads',
      name: 'Roads',
      icon: Compass,
      description: 'Problems with potholes, cracks, damaged surfaces, asphalt erosion, flooding, etc.',
      recentIssues: 18,
      riskLevel: 'High',
      score: 74,
      color: 'border-l-sky-600',
    },
    {
      id: 'Bridges',
      name: 'Bridges',
      icon: Construction,
      description: 'Structural concerns, visible cracks, expansion joint damage, safety barriers, lighting.',
      recentIssues: 6,
      riskLevel: 'Moderate',
      score: 52,
      color: 'border-l-amber-600',
    },
    {
      id: 'Streetlights',
      name: 'Streetlights',
      icon: Lightbulb,
      description: 'Non-functional lights, dark corridors, flickering, damaged poles, exposed electrical wiring.',
      recentIssues: 11,
      riskLevel: 'Low',
      score: 29,
      color: 'border-l-emerald-600',
    },
    {
      id: 'Water Pipelines',
      name: 'Water Pipelines',
      icon: Droplets,
      description: 'Pressurized water leaks, main trunk bursts, low supply pressure, contamination concerns.',
      recentIssues: 14,
      riskLevel: 'High',
      score: 68,
      color: 'border-l-blue-600',
    },
    {
      id: 'Public Buildings',
      name: 'Public Buildings',
      icon: Landmark,
      description: 'Structural foundation damage, electrical hazards, plumbing failures, access and safety.',
      recentIssues: 5,
      riskLevel: 'Low',
      score: 26,
      color: 'border-l-indigo-600',
    },
    {
      id: 'Drainage',
      name: 'Drainage Systems',
      icon: Activity,
      description: 'Blocked stormwater drains, road waterlogging, overflow, damaged culverts, severe flooding.',
      recentIssues: 22,
      riskLevel: 'Critical',
      score: 86,
      color: 'border-l-rose-600',
    },
  ];

  const isAdmin = user?.role === 'ADMIN';

  const handleCategorySelect = (categoryId) => {
    if (isAdmin) {
      navigate('/admin/reports');
    } else {
      navigate('/report', { state: { selectedCategory: categoryId } });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Citizen Greeting & Main Action */}
      <section className="bg-gradient-to-br from-sky-950 via-slate-900 to-sky-900 rounded-2xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-sky-300 text-xs font-semibold tracking-wider uppercase mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Civic Infrastructure Maintenance Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            {getGreeting()}, {displayName}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
            {isAdmin
              ? 'Welcome to the municipal administration center. Review citizen infrastructure complaints, manage priority risk queues, and track field maintenance.'
              : 'Help keep your community safe by reporting infrastructure issues. InfraSense correlates citizen reports with environmental sensors and maintenance logs to ensure rapid municipal action.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin ? (
              <>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-sky-950 bg-white hover:bg-sky-50 rounded-xl shadow-sm transition-all transform active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 text-sky-800" />
                  Dashboard
                </button>

                <button
                  onClick={() => navigate('/admin/reports')}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Citizen Reports
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/report')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-sky-950 bg-white hover:bg-sky-50 rounded-xl shadow-sm transition-all transform active:scale-95"
                >
                  <PlusCircle className="w-4 h-4 text-sky-800" />
                  Report an Issue
                </button>

                <button
                  onClick={() => navigate('/reports')}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  My Reports
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Civic Metric Strip */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-400">Community Health</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5 tabular-nums">
              {overview?.overallHealth || 72}/100
            </div>
          </div>
          <div>
            <div className="text-slate-400">Active Sensors</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5 tabular-nums">
              14 Monitored
            </div>
          </div>
          <div>
            <div className="text-slate-400">Average Resolution</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5 tabular-nums">
              4.2 Days
            </div>
          </div>
          <div>
            <div className="text-slate-400">Monitored Zones</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5 tabular-nums">
              6 Sectors
            </div>
          </div>
        </div>
      </section>

      {/* Six Infrastructure Categories */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Infrastructure Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select any category to report an issue or review ongoing sector telemetry
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
            Click any category card to initiate a report
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, catIdx) => {
            const Icon = cat.icon;
            return (
              <div
                key={`cat-${cat.id || catIdx}-${catIdx}`}
                onClick={() => handleCategorySelect(cat.id)}
                className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between group border-l-4 ${cat.color}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-sky-50 text-slate-700 group-hover:text-sky-800 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <RiskBadge level={cat.riskLevel} score={cat.score} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-900 transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    <strong className="font-semibold text-slate-800 font-mono tabular-nums">
                      {cat.recentIssues}
                    </strong>{' '}
                    recent reports
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-sky-800 group-hover:translate-x-0.5 transition-transform">
                    {isAdmin ? 'View Category' : 'Report Issue'} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Citizen Activity Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Your Active Reports */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Recent Reports</h3>
              <p className="text-xs text-slate-500">Track issues you have submitted to municipal authorities</p>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="text-xs font-semibold text-sky-800 hover:text-sky-900 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentReports.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentReports.map((report, idx) => {
                const uniqueKey = `home-recent-${report._id || report.id || 'id'}-${report.reportId || 'rep'}-${idx}`;
                return (
                  <div
                    key={uniqueKey}
                    onClick={() => navigate(`/reports/${report.reportId || report._id || report.id}`)}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-900">
                          {report.reportId || 'INF-REF'}
                        </span>
                        <span className="text-xs font-medium text-slate-700">·</span>
                        <span className="text-xs font-semibold text-slate-800">
                          {report.infrastructureType}
                        </span>
                        <span className="text-xs text-slate-500">({report.problemType})</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {report.location?.area}, {report.location?.city}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      {report.riskAssessment && (
                        <RiskBadge
                          level={report.riskAssessment.riskLevel}
                          score={report.riskAssessment.riskScore}
                          size="sm"
                        />
                      )}
                      <StatusBadge status={report.status} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              No recent reports submitted yet.{' '}
              <button
                onClick={() => navigate('/report')}
                className="text-sky-800 font-semibold underline ml-1"
              >
                Submit your first report
              </button>
            </div>
          )}
        </div>

        {/* Civic Alert & Environmental Brief */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Monsoon Alert: High Scouring Risk</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              Elevated Rainfall & Waterlogging
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Monsoon runoff has elevated road subgrade saturation to 82% across low-lying sectors. Drainage culverts in Rajendra Nagar and Kankarbagh are at critical thresholds.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => navigate(isAdmin ? '/admin/analytics' : '/help')}
              className="w-full py-2.5 px-4 text-xs font-bold text-center text-white bg-sky-800 hover:bg-sky-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {isAdmin ? 'Explore Operational Analytics' : 'Emergency & Civic Help Resources'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
