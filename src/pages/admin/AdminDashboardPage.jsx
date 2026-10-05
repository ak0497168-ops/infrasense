import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Flame,
  Calendar,
  MapPin,
  Search,
  User,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { adminAPI } from '../../services/api.js';
import RiskBadge from '../../components/RiskBadge.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('ALL');
  const [reportCategoryFilter, setReportCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDashboard();
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating municipal incident metrics and priority queue..." />;
  }

  const stats = data?.stats || {};
  const riskDistribution = data?.riskDistribution || [];
  const reportsByInfrastructure = data?.reportsByInfrastructure || [];
  const highestPriorityReports = data?.highestPriorityReports || [];
  const allReports = data?.citizenReports || data?.recentReports || [];

  const filteredCitizenReports = allReports.filter((r) => {
    if (reportStatusFilter !== 'ALL' && r.status !== reportStatusFilter) return false;
    if (reportCategoryFilter !== 'ALL' && r.infrastructureType !== reportCategoryFilter) return false;
    if (reportSearch.trim()) {
      const q = reportSearch.toLowerCase();
      const matchId = r.reportId?.toLowerCase().includes(q);
      const matchCitizen = r.citizen?.name?.toLowerCase().includes(q) || r.citizen?.email?.toLowerCase().includes(q);
      const matchLoc = r.location?.area?.toLowerCase().includes(q) || r.location?.city?.toLowerCase().includes(q) || r.location?.street?.toLowerCase().includes(q);
      const matchProblem = r.problemType?.toLowerCase().includes(q);
      const matchType = r.infrastructureType?.toLowerCase().includes(q);
      return matchId || matchCitizen || matchLoc || matchProblem || matchType;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time municipal operations, predictive risk analysis, and live citizen reports triage
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-sm transition-all"
          >
            Manage All Complaints
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Reports */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Complaints</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
              {stats.totalReports || 0}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Reports */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Pending Triage</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-800 mt-1 tabular-nums">
              {stats.pendingReports || 0}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-800">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* High / Critical Risk */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">High / Critical Risk</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-700 mt-1 tabular-nums">
              {stats.highCriticalReports || 0}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">In Maintenance</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-700 mt-1 tabular-nums">
              {stats.inProgressReports || 0}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <span className="text-xs text-slate-500 font-medium">Resolved & Verified</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 mt-1 tabular-nums">
              {stats.resolvedReports || 0}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Highest Priority Reports Banner */}
      <section className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-700">
            <Flame className="w-5 h-5 fill-rose-600 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">
              Highest-Priority Incidents for Immediate Municipal Action
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Prioritized by: Risk Score (40%) + Severity (25%) + Similar Complaints (20%) + Age (15%)
          </span>
        </div>

        {highestPriorityReports.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {highestPriorityReports.map((report, idx) => (
              <div
                key={`priority-rep-${report._id || report.id || report.reportId || 'idx'}-${idx}`}
                onClick={() => navigate(`/admin/reports/${report.reportId}`)}
                className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      {report.reportId}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {report.infrastructureType} · {report.problemType}
                    </span>
                    <span className="text-[11px] px-2 py-0.2 rounded font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                      Priority Score: {report.priorityScore}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 max-w-2xl">
                    {report.description}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{report.location?.area}, {report.location?.city}</span>
                    <span aria-hidden="true">·</span>
                    <span>Logged {report.ageDays}d ago</span>
                    {report.riskAssessment?.similarComplaintsSummary?.count > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-700 font-semibold">
                          {report.riskAssessment.similarComplaintsSummary.count} similar in area
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {report.riskAssessment && (
                    <RiskBadge
                      level={report.riskAssessment.riskLevel}
                      score={report.riskAssessment.riskScore}
                      size="sm"
                    />
                  )}
                  <StatusBadge status={report.status} size="sm" />
                  <span className="text-xs font-bold text-sky-800 hover:underline flex items-center gap-1">
                    Review <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">No outstanding high-priority complaints pending.</p>
        )}
      </section>

      {/* Visual Analytics Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reports by Category BarChart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reports by Infrastructure Asset
              </h3>
              <p className="text-xs text-slate-500">
                Complaint volume across all six supported categories
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-sky-800" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportsByInfrastructure}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Total Reports" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="open" name="Active/Open" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Distribution PieChart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Risk Level Classification
            </h3>
            <p className="text-xs text-slate-500">
              Synthesized empirical risk score distribution
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-2 border-t border-slate-100">
            {riskDistribution.map((item) => (
              <div key={item.name} className="p-2 rounded-lg bg-slate-50">
                <span className="text-[11px] text-slate-500 font-medium block">{item.name}</span>
                <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Citizen Reports - Reflected in one unified field on Dashboard */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Citizen Reports Dashboard
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live citizen complaints reflected in one unified management field with direct action triage
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-900 rounded-md border border-sky-100 font-mono">
              {filteredCitizenReports.length} {filteredCitizenReports.length === 1 ? 'Report' : 'Reports'}
            </span>
            <Link
              to="/admin/reports"
              className="text-xs font-bold text-sky-800 hover:text-sky-950 flex items-center gap-1 ml-2"
            >
              Full Register <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Dashboard Unified Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
              placeholder="Search citizen complaints by ID, citizen name, locality, or problem..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-800 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={reportCategoryFilter}
              onChange={(e) => setReportCategoryFilter(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Roads">Roads</option>
              <option value="Bridges">Bridges</option>
              <option value="Streetlights">Streetlights</option>
              <option value="Water Pipelines">Water Pipelines</option>
              <option value="Public Buildings">Public Buildings</option>
              <option value="Drainage">Drainage</option>
            </select>

            <select
              value={reportStatusFilter}
              onChange={(e) => setReportStatusFilter(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="MAINTENANCE_SCHEDULED">Maintenance Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Table of Citizen Reports */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Citizen</th>
                <th className="py-3 px-4">Infrastructure</th>
                <th className="py-3 px-4">Problem</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCitizenReports.map((report, idx) => (
                <tr
                  key={`dash-citizen-rep-${report._id || report.id || report.reportId || idx}-${idx}`}
                  onClick={() => navigate(`/admin/reports/${report.reportId}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-sky-900 whitespace-nowrap">
                    {report.reportId}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 truncate max-w-[120px]">
                      {report.citizen?.name || 'Citizen'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {report.citizen?.email || 'citizen@domain.in'}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {report.infrastructureType}
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-[140px] truncate">
                    {report.problemType}
                  </td>
                  <td className="py-3 px-4 max-w-[150px] truncate text-slate-600">
                    {report.location?.area}, {report.location?.city}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        report.severity === 'Critical'
                          ? 'text-rose-600'
                          : report.severity === 'High'
                          ? 'text-orange-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {report.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {report.riskAssessment ? (
                      <RiskBadge
                        level={report.riskAssessment.riskLevel}
                        score={report.riskAssessment.riskScore}
                        size="sm"
                      />
                    ) : (
                      'Pending'
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={report.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-400">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/reports/${report.reportId}`);
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-sky-800 hover:text-sky-950 hover:bg-sky-50 rounded transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCitizenReports.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No citizen reports match the current search or filters.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
