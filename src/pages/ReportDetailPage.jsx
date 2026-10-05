import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  AlertTriangle,
  Star,
  CheckCircle,
  FileText,
  Clock,
  ExternalLink,
  Sparkles,
  Send,
  FastForward
} from 'lucide-react';
import { reportsAPI } from '../services/api.js';
import RiskBadge from '../components/RiskBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import StatusTimeline from '../components/StatusTimeline.jsx';
import RiskFactorCard from '../components/RiskFactorCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Citizen Feedback Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Status Advance simulation for reviewers
  const [advancingStatus, setAdvancingStatus] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportsAPI.getById(id);
      if (res.data?.data) {
        setReport(res.data.data.report);
        setRiskAssessment(res.data.data.riskAssessment);
        if (res.data.data.feedback) {
          setFeedback(res.data.data.feedback);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Report not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    try {
      const res = await reportsAPI.submitFeedback(report.reportId, { rating, comment });
      if (res.data?.data) {
        setFeedback(res.data.data);
        setFeedbackSuccess(true);
      }
    } catch (err) {
      alert('Failed to submit feedback: ' + (err.response?.data?.message || err.message));
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleAdvanceStatus = async () => {
    setAdvancingStatus(true);
    try {
      const res = await reportsAPI.advanceStatus(report.reportId);
      if (res.data?.data) {
        setReport(res.data.data);
      }
    } catch (err) {
      alert('Failed to advance status: ' + err.message);
    } finally {
      setAdvancingStatus(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving infrastructure report details..." />;
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Report Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'The requested report could not be found.'}</p>
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-800 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Status Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reports')}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back"
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

        {/* Demo Reviewer Status Advancement Button */}
        <div className="flex items-center gap-2">
          {report.status !== 'RESOLVED' && (
            <button
              onClick={handleAdvanceStatus}
              disabled={advancingStatus}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors disabled:opacity-50"
              title="Test municipal status progression for hackathon review"
            >
              <FastForward className="w-3.5 h-3.5" />
              {advancingStatus ? 'Advancing...' : 'Advance Status (Demo)'}
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Report Details & Evidence */}
        <div className="lg:col-span-2 space-y-8">
          {/* Issue Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                Problem Description
              </h2>
              <p className="text-sm text-slate-800 leading-relaxed">
                {report.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Reported Severity:</span>
                <div className="font-bold text-slate-800 mt-0.5">{report.severity}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Submission Timestamp:</span>
                <div className="text-slate-800 mt-0.5">
                  {new Date(report.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-900">
              <MapPin className="w-4 h-4 text-sky-800" />
              <span>Location Confirmation</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1.5">
              <div>
                <span className="text-slate-500 font-medium">Street / Road:</span>{' '}
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
                  <span className="text-slate-500 font-medium">Landmark:</span>{' '}
                  <span className="text-slate-800">{report.location.landmark}</span>
                </div>
              )}
            </div>
          </div>

          {/* Evidence & AI Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Evidence & Visual Telemetry</h3>

            {/* Images */}
            {report.evidence?.images && report.evidence.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.evidence.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100"
                  >
                    <img
                      src={img}
                      alt="Submitted evidence"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML =
                          '<div class="flex items-center justify-center h-full text-xs text-slate-400 p-2 text-center">Photo Evidence Recorded</div>';
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No photographic evidence attached with initial report.</p>
            )}

            {/* AI Computer Vision Analysis */}
            {report.aiImageAnalysis && (
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/70 space-y-2 mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950">
                    <Sparkles className="w-3.5 h-3.5 text-sky-800" />
                    <span>Multimodal Image Inspection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {report.aiImageAnalysis.confidence}% Confidence
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200">
                      {report.aiImageAnalysis.modelArchitecture || 'Gemini Flash Vision'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-800 pt-1">
                  <span className="text-slate-500">Detected Defect:</span>{' '}
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
                      <li key={i}>{cue}</li>
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
        </div>

        {/* Right Column: Status Timeline & Feedback */}
        <div className="space-y-6">
          <StatusTimeline
            currentStatus={report.status}
            updatedAt={report.updatedAt}
          />

          {/* Citizen Feedback Form (When Resolved) */}
          {report.status === 'RESOLVED' && (
            <div className="bg-white rounded-xl border border-emerald-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Issue Resolution Feedback
                </h3>
              </div>

              <p className="text-xs text-slate-600">
                Was this issue resolved satisfactorily by municipal authorities?
              </p>

              {feedback || feedbackSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <span>Your Rating:</span>
                    <span className="flex text-amber-500">
                      {'★'.repeat(feedback?.rating || rating)}
                    </span>
                  </div>
                  {(feedback?.comment || comment) && (
                    <div className="italic text-slate-600 mt-1">
                      "{feedback?.comment || comment}"
                    </div>
                  )}
                  <div className="text-[11px] text-emerald-700 pt-1 font-medium">
                    Thank you! Your feedback helps optimize public maintenance service quality.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rating (1 to 5 Stars)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Optional Comment
                    </label>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Comment on work quality, timeliness, or safety..."
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-800 text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="w-full py-2 px-3 text-xs font-bold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {feedbackSubmitting ? 'Submitting...' : 'Submit Resolution Feedback'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Predictive Risk Assessment Breakdown */}
      {riskAssessment && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-900 mb-1">
                <span>Multi-Stream Risk Synthesis</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Predictive Risk Score: {riskAssessment.riskScore} / 100
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic weighted calculation correlating 6 civic parameters
              </p>
            </div>

            <div className="flex items-center gap-3">
              <RiskBadge level={riskAssessment.riskLevel} size="lg" />
              <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">Maintenance Likelihood</div>
                <div className="font-mono font-bold text-sky-900 tabular-nums">
                  {riskAssessment.maintenanceLikelihood}%
                </div>
              </div>
            </div>
          </div>

          {/* Similar Complaints Banner */}
          {riskAssessment.similarComplaintsSummary?.count > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Locality Cluster Detected:</span>{' '}
                {riskAssessment.similarComplaintsSummary.count} similar complaints were recorded in this area within the last {riskAssessment.similarComplaintsSummary.windowDays} days.
              </div>
            </div>
          )}

          {/* 6 Risk Factors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Civic Explanation:</span>{' '}
            {riskAssessment.explanation}
          </div>
        </section>
      )}
    </div>
  );
}
