import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowRight,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  MapPin,
  Calendar
} from 'lucide-react';
import { adminAPI } from '../../services/api.js';
import RiskBadge from '../../components/RiskBadge.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [infraFilter, setInfraFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReports();
  }, [infraFilter, riskFilter, severityFilter, statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getReports({
        infrastructure: infraFilter,
        risk: riskFilter,
        severity: severityFilter,
        status: statusFilter,
        search
      });
      if (res.data?.data?.reports) {
        setReports(res.data.data.reports);
      }
    } catch (err) {
      setError('Failed to retrieve citizen complaints.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleResetFilters = () => {
    setInfraFilter('ALL');
    setRiskFilter('ALL');
    setSeverityFilter('ALL');
    setStatusFilter('ALL');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Citizen Complaints & Incident Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, and triage public infrastructure defects submitted by residents
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Queue
        </button>
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
              placeholder="Search by Report ID, Citizen name, locality, or problem..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-800 text-slate-900"
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

          {/* Infrastructure Category */}
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

          {/* Risk Level */}
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

          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>

          {/* Status */}
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

          {(infraFilter !== 'ALL' || riskFilter !== 'ALL' || severityFilter !== 'ALL' || statusFilter !== 'ALL' || search) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <LoadingSpinner message="Loading filtered complaint register..." />
      ) : reports.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Citizen</th>
                  <th className="py-3 px-4">Infrastructure</th>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report, idx) => {
                  const uniqueKey = `admin-rep-${report._id || report.id || report.reportId || 'idx'}-${idx}`;
                  return (
                    <tr
                      key={uniqueKey}
                      onClick={() => navigate(`/admin/reports/${report.reportId}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-sky-900 whitespace-nowrap">
                        {report.reportId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 truncate max-w-[120px]">
                          {report.citizen?.name || 'Verified Citizen'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {report.citizen?.email || 'citizen@domain.in'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {report.infrastructureType}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {report.problemType}
                      </td>
                      <td className="py-3 px-4 max-w-[160px] truncate text-slate-600">
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
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                        {report.riskAssessment?.riskScore !== undefined
                          ? `${report.riskAssessment.riskScore}/100`
                          : '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {report.riskAssessment ? (
                          <RiskBadge
                            level={report.riskAssessment.riskLevel}
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
                          className="px-2.5 py-1 text-xs font-bold text-sky-800 hover:text-sky-950 hover:bg-sky-50 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing {reports.length} citizen complaints</span>
            <span className="font-medium">Click on any row to open full municipal management review</span>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No complaints match current filters"
          description="Adjust your search query, status, or infrastructure filter to view recorded items."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
}
