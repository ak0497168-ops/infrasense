import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Calendar
} from 'lucide-react';
import { reportsAPI } from '../services/api.js';
import RiskBadge from '../components/RiskBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function MyReportsPage() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [infraFilter, setInfraFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReports();
  }, [statusFilter, infraFilter, riskFilter]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportsAPI.getMy({
        status: statusFilter,
        infrastructureType: infraFilter,
        riskLevel: riskFilter,
        search,
      });
      if (res.data?.data) {
        setReports(res.data.data.reports || []);
        if (res.data.data.stats) {
          setStats(res.data.data.stats);
        }
      }
    } catch (err) {
      setError('Unable to load reports. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Submitted Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review status updates, risk analysis, and maintenance progress for your logged issues
          </p>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-sm transition-all shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-sky-200" />
          Report New Issue
        </Link>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Reports</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
              {stats.totalReports}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Under Review</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-800 mt-1 tabular-nums">
              {stats.underReview}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-800">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">In Progress</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-700 mt-1 tabular-nums">
              {stats.inProgress}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Resolved</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 mt-1 tabular-nums">
              {stats.resolved}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Report ID, locality, or problem..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-800 focus:bg-white text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="MAINTENANCE_SCHEDULED">Maintenance Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Infrastructure Category Filter */}
          <select
            value={infraFilter}
            onChange={(e) => setInfraFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Roads">Roads</option>
            <option value="Bridges">Bridges</option>
            <option value="Streetlights">Streetlights</option>
            <option value="Water Pipelines">Water Pipelines</option>
            <option value="Public Buildings">Public Buildings</option>
            <option value="Drainage">Drainage</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
          </select>

          {(statusFilter !== 'ALL' || infraFilter !== 'ALL' || riskFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setInfraFilter('ALL');
                setRiskFilter('ALL');
                setSearch('');
              }}
              className="text-xs font-semibold text-rose-600 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <LoadingSpinner message="Retrieving your submitted reports..." />
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report, idx) => {
            const uniqueKey = report.reportId || report._id || report.id || `my-report-${idx}`;
            return (
              <div
                key={uniqueKey}
                onClick={() => navigate(`/reports/${report.reportId || report._id || report.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
              <div>
                {/* Header row: Report ID & Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                    {report.reportId}
                  </span>
                  <StatusBadge status={report.status} size="sm" />
                </div>

                {/* Infrastructure & Problem */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-900 transition-colors">
                  {report.infrastructureType} · {report.problemType}
                </h3>

                {/* Location with typographic bullet separator */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{report.location?.city}</span>
                  <span aria-hidden="true">·</span>
                  <span>{report.location?.area}</span>
                  {report.location?.street && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{report.location.street}</span>
                    </>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {report.description}
                </p>
              </div>

              {/* Bottom Card Footer: Risk & Date */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  {report.riskAssessment ? (
                    <RiskBadge
                      level={report.riskAssessment.riskLevel}
                      score={report.riskAssessment.riskScore}
                      size="sm"
                    />
                  ) : (
                    <span className="text-[11px] text-slate-400">Risk Assessment Pending</span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No reports match your filters"
          description="Try selecting a different status or infrastructure category, or report a new issue."
          actionLabel="Report an Issue"
          onAction={() => navigate('/report')}
        />
      )}
    </div>
  );
}
