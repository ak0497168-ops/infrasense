import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  AlertTriangle,
  User,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  MessageSquare,
  ShieldAlert,
  Activity,
  CloudRain,
  History,
  FileCheck
} from 'lucide-react';
import { adminAPI } from '../../services/api.js';
import RiskBadge from '../../components/RiskBadge.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import RiskFactorCard from '../../components/RiskFactorCard.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Status Change Form
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Internal Note Form
  const [internalNote, setInternalNote] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  // Schedule Maintenance Form
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [assignedCrew, setAssignedCrew] = useState('Central Roads Maintenance Team Alpha');
  const [duration, setDuration] = useState('4-6 Hours');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  // Resolution Form
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionsTaken, setActionsTaken] = useState('Physical site inspection, hydraulic seal repair, surface resurfacing');
  const [resolveSubmitting, setResolveSubmitting] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getReportById(id);
      if (res.data?.data) {
        setData(res.data.data);
        setNewStatus(res.data.data.report.status);
      }
    } catch (err) {
      setError('Report not found or server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    setStatusUpdating(true);
    try {
      await adminAPI.updateStatus(id, {
        status: newStatus,
        note: statusNote || `Status updated to ${newStatus}`
      });
      setActionSuccess(`Status successfully updated to ${newStatus}. Citizen notified.`);
      setStatusNote('');
      fetchReportDetails();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!internalNote.trim()) return;

    setNoteSubmitting(true);
    try {
      await adminAPI.addNote(id, internalNote);
      setInternalNote('');
      setActionSuccess('Internal administrator note saved.');
      fetchReportDetails();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert('Failed to save note');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduleSubmitting(true);
    try {
      await adminAPI.scheduleMaintenance(id, {
        scheduledDate: scheduledDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
        assignedCrew,
        estimatedDuration: duration,
        notes: scheduleNotes
      });
      setShowScheduleModal(false);
      setActionSuccess('Maintenance scheduled and crew dispatched. Citizen received automated notification.');
      fetchReportDetails();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      alert('Failed to schedule maintenance: ' + err.message);
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setResolveSubmitting(true);
    try {
      const actionsList = actionsTaken.split(',').map(a => a.trim()).filter(Boolean);
      await adminAPI.resolveReport(id, {
        resolutionNotes,
        actionsTaken: actionsList
      });
      setShowResolveModal(false);
      setActionSuccess('Incident officially marked RESOLVED. Citizen notified to submit feedback rating.');
      fetchReportDetails();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      alert('Failed to resolve report: ' + err.message);
    } finally {
      setResolveSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving complaint telemetry and incident docket..." />;
  }

  if (error || !data?.report) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Requested report ID is invalid.'}</p>
        <button
          onClick={() => navigate('/admin/reports')}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-800 rounded-lg inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Reports Register
        </button>
      </div>
    );
  }

  const { report, citizen, riskAssessment, feedback, historicalMaintenance, sensorTelemetry, climateTelemetry } = data;

  return (
    <div className="space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/reports')}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
            title="Back to complaints list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-100">
                {report.reportId}
              </span>
              <StatusBadge status={report.status} size="sm" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {report.infrastructureType} · {report.problemType}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {report.status !== 'MAINTENANCE_SCHEDULED' && report.status !== 'RESOLVED' && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-sm transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              Schedule Maintenance
            </button>
          )}

          {report.status !== 'RESOLVED' && (
            <button
              onClick={() => setShowResolveModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Details (Left) + Management Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Report Overview, Evidence & Risk Signals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Description & Citizen Metadata */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Citizen Incident Description
              </h2>
              <p className="text-sm text-slate-900 leading-relaxed font-medium">
                {report.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Reporting Citizen:</span>
                <div className="font-bold text-slate-900 mt-0.5">{citizen?.name || 'Verified Citizen'}</div>
                <div className="text-[11px] text-slate-400">{citizen?.email || 'citizen@domain.in'}</div>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Reported Severity:</span>
                <div className="font-bold text-slate-900 mt-0.5">{report.severity}</div>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Recorded Date:</span>
                <div className="text-slate-900 mt-0.5">
                  {new Date(report.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Location Details (Manual Entry - No GPS/Maps) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-900">
              <MapPin className="w-4 h-4 text-sky-800" />
              <span>Manual Civic Location Data</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1.5">
              <div>
                <span className="text-slate-500 font-medium">Road / Street:</span>{' '}
                <strong className="text-slate-900">{report.location?.street}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Area / Locality:</span>{' '}
                <strong className="text-slate-900">{report.location?.area}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">City:</span>{' '}
                <strong className="text-slate-900">{report.location?.city}</strong>
              </div>
              {report.location?.landmark && (
                <div>
                  <span className="text-slate-500 font-medium">Reference Landmark:</span>{' '}
                  <span className="text-slate-800">{report.location.landmark}</span>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Evidence & AI Computer Vision Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Uploaded Photographic Evidence</h3>

            {report.evidence?.images && report.evidence.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.evidence.images.map((img, i) => (
                  <div
                    key={`evidence-img-${i}`}
                    className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100"
                  >
                    <img
                      src={img}
                      alt="Submitted evidence"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML =
                          '<div class="flex items-center justify-center h-full text-xs text-slate-400 p-2 text-center">Citizen Photo Evidence</div>';
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No photographic attachments provided.</p>
            )}

            {/* AI Image Analysis Card */}
            {report.aiImageAnalysis && (
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/70 space-y-2 mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950">
                    <Sparkles className="w-3.5 h-3.5 text-sky-800" />
                    <span>Computer Vision Defect Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {report.aiImageAnalysis.confidence}% Match Confidence
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200">
                      {report.aiImageAnalysis.modelArchitecture || 'Gemini Flash Vision'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-800 pt-1">
                  <span className="text-slate-500">Defect Detected:</span>{' '}
                  <strong className="text-slate-900">{report.aiImageAnalysis.detectedIssue}</strong>
                  {report.aiImageAnalysis.estimatedSeverity && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-900">
                      {report.aiImageAnalysis.estimatedSeverity} Severity
                    </span>
                  )}
                </div>

                {report.aiImageAnalysis.visualCues && (
                  <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-0.5 pt-1">
                    {report.aiImageAnalysis.visualCues.map((cue, i) => (
                      <li key={`cue-${i}`}>{cue}</li>
                    ))}
                  </ul>
                )}

                {report.aiImageAnalysis.recommendation && (
                  <div className="mt-2 pt-2 border-t border-sky-200/60 text-[11px] text-sky-950">
                    <span className="font-semibold text-sky-900">Field Recommendation:</span>{' '}
                    <span>{report.aiImageAnalysis.recommendation}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Risk Factors & Multi-Signal Synthesis */}
          {riskAssessment && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Empirical Risk Assessment Matrix
                  </h3>
                  <p className="text-xs text-slate-500">6 multi-source telemetry signals synthesized for this incident</p>
                </div>
                <RiskBadge level={riskAssessment.riskLevel} score={riskAssessment.riskScore} size="lg" />
              </div>

              {/* 6 Risk Factors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RiskFactorCard
                  factorKey="historicalMaintenance"
                  title="Historical Maintenance"
                  factor={riskAssessment.riskFactors?.historicalMaintenance}
                />
                <RiskFactorCard
                  factorKey="publicComplaints"
                  title="Public Complaints"
                  factor={riskAssessment.riskFactors?.publicComplaints}
                />
                <RiskFactorCard
                  factorKey="climate"
                  title="Climate Conditions"
                  factor={riskAssessment.riskFactors?.climate}
                />
                <RiskFactorCard
                  factorKey="sensorData"
                  title="Sensor Data"
                  factor={riskAssessment.riskFactors?.sensorData}
                />
                <RiskFactorCard
                  factorKey="currentSeverity"
                  title="Current Severity"
                  factor={riskAssessment.riskFactors?.currentSeverity}
                />
                <RiskFactorCard
                  factorKey="infrastructureCondition"
                  title="Infrastructure Condition"
                  factor={riskAssessment.riskFactors?.infrastructureCondition}
                />
              </div>

              {/* Similar Complaints in Locality */}
              {riskAssessment.similarComplaintsSummary?.count > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Locality Cluster Alert:</span>{' '}
                    {riskAssessment.similarComplaintsSummary.count} similar complaints were recorded in {report.location?.area} within the last {riskAssessment.similarComplaintsSummary.windowDays} days.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Historical Maintenance Records & Grid Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Historical Maintenance */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <History className="w-4 h-4 text-sky-800" />
                <span>Sector Maintenance History</span>
              </div>
              {historicalMaintenance && historicalMaintenance.length > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {historicalMaintenance.map((m, idx) => (
                    <div key={`maint-${m._id || m.id || idx}-${idx}`} className="py-2.5">
                      <div className="font-semibold text-slate-800">{m.workDone}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(m.completedAt).toLocaleDateString()} · Cost: ₹{m.cost?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No previous work orders on file for this locality.</p>
              )}
            </div>

            {/* Sensor & Climate Telemetry */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Activity className="w-4 h-4 text-sky-800" />
                <span>Environmental & Sensor Readings</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Sensor Anomaly Status</span>
                  <span className="font-bold text-slate-800">
                    {sensorTelemetry?.thresholdStatus || 'Normal (Safe)'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Precipitation Level</span>
                  <span className="font-bold text-slate-800">
                    {climateTelemetry?.rainfallMm ? `${climateTelemetry.rainfallMm} mm` : '64.2 mm (Monsoon Runoff)'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Flood Risk Index</span>
                  <span className="font-bold text-rose-600">
                    {climateTelemetry?.floodRiskIndex ? `${climateTelemetry.floodRiskIndex}/100` : '72/100 (Elevated)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Admin Actions & Status History */}
        <div className="space-y-6">
          {/* Status Change Widget */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Update Incident Status</h3>
            <p className="text-xs text-slate-500">
              Modifying status will trigger an automated citizen notification alert
            </p>

            <form onSubmit={handleStatusChange} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-800"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="MAINTENANCE_SCHEDULED">MAINTENANCE_SCHEDULED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Transition Note (Optional)
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Assigned to engineering review team"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-800 text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={statusUpdating || newStatus === report.status}
                className="w-full py-2 px-3 text-xs font-bold text-white bg-sky-800 hover:bg-sky-900 rounded-lg transition-colors disabled:opacity-50"
              >
                {statusUpdating ? 'Updating Status...' : 'Apply Status Update'}
              </button>
            </form>
          </div>

          {/* Maintenance Schedule Information (if assigned) */}
          {report.maintenanceSchedule && (
            <div className="bg-white rounded-xl border border-sky-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
                <Wrench className="w-4 h-4 text-sky-800" />
                <span>Scheduled Maintenance Details</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-700">
                <div>
                  <span className="text-slate-500 font-medium">Assigned Field Unit:</span>{' '}
                  <strong>{report.maintenanceSchedule.assignedCrew}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Scheduled Date:</span>{' '}
                  <strong>{new Date(report.maintenanceSchedule.scheduledDate).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Duration:</span>{' '}
                  <span>{report.maintenanceSchedule.estimatedDuration}</span>
                </div>
                {report.maintenanceSchedule.notes && (
                  <div className="text-[11px] text-slate-500 italic mt-1">
                    "{report.maintenanceSchedule.notes}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resolution Details (if resolved) */}
          {report.status === 'RESOLVED' && report.resolutionDetails && (
            <div className="bg-white rounded-xl border border-emerald-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Municipal Resolution Docket</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-700">
                <div>
                  <span className="text-slate-500 font-medium">Verified By:</span>{' '}
                  <strong>{report.resolutionDetails.resolvedBy}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Resolved Timestamp:</span>{' '}
                  <strong>{new Date(report.resolutionDetails.resolvedAt).toLocaleString()}</strong>
                </div>
                <div className="p-2.5 rounded bg-emerald-50 text-emerald-900 text-[11px]">
                  {report.resolutionDetails.resolutionNotes}
                </div>
              </div>
            </div>
          )}

          {/* Citizen Feedback (if submitted) */}
          {feedback && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Citizen Satisfaction Feedback
              </h4>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                {'★'.repeat(feedback.rating)}
                <span className="text-xs font-medium text-slate-500 ml-1">({feedback.rating}/5 Stars)</span>
              </div>
              {feedback.comment && (
                <p className="text-xs text-slate-600 italic">"{feedback.comment}"</p>
              )}
            </div>
          )}

          {/* Internal Administrator Notes */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Internal Operational Notes</h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {report.internalNotes && report.internalNotes.length > 0 ? (
                report.internalNotes.map((n, idx) => (
                  <div key={`internal-note-${n._id || n.id || idx}-${idx}`} className="p-2.5 rounded-lg bg-slate-50 text-xs space-y-1 border border-slate-100">
                    <p className="text-slate-800">{n.note}</p>
                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>{n.adminName || 'Admin'}</span>
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No internal notes added yet.</p>
              )}
            </div>

            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-100">
              <textarea
                rows={2}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Log internal note for municipal engineers..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-800 text-slate-900"
              />
              <button
                type="submit"
                disabled={noteSubmitting || !internalNote.trim()}
                className="w-full py-1.5 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                {noteSubmitting ? 'Saving Note...' : 'Add Internal Note'}
              </button>
            </form>
          </div>

          {/* Status History Audit Trail */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Status History Audit Log</h3>
            <div className="space-y-3 text-xs">
              {report.statusHistory && report.statusHistory.length > 0 ? (
                report.statusHistory.map((h, idx) => (
                  <div key={`status-hist-${h._id || h.id || idx}-${idx}`} className="pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-sky-900">{h.status}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{h.note}</p>
                    <span className="text-[10px] text-slate-400">By: {h.adminName}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Initial intake status recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Maintenance Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-sky-800" />
                <h3 className="text-base font-bold text-slate-900">Schedule Field Maintenance</h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Work Date
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Field Crew Unit
                </label>
                <input
                  type="text"
                  required
                  value={assignedCrew}
                  onChange={(e) => setAssignedCrew(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estimated Repair Window
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 4 Hours, 1 Day"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dispatch Instructions & Machinery
                </label>
                <textarea
                  rows={2}
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="Specify equipment: e.g. Suction dredging vehicle, cold asphalt mix..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduleSubmitting}
                  className="px-4 py-2 rounded-lg bg-sky-800 hover:bg-sky-900 text-white font-bold disabled:opacity-50"
                >
                  {scheduleSubmitting ? 'Dispatching...' : 'Dispatch Maintenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Incident Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Resolve Citizen Complaint</h3>
              </div>
              <button
                onClick={() => setShowResolveModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resolution Notes
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain completed work: e.g. Pothole filled with asphalt sub-base, cleared for traffic."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Actions Executed (Comma-separated)
                </label>
                <input
                  type="text"
                  value={actionsTaken}
                  onChange={(e) => setActionsTaken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900 text-[11px]">
                Marking this issue as resolved will update municipal statistics and invite the citizen to submit feedback.
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolveSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold disabled:opacity-50"
                >
                  {resolveSubmitting ? 'Finalizing Resolution...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
