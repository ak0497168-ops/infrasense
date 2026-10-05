import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

export default function AdminNotificationsPage() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getNotifications();
      if (res.data?.data) {
        setFeed(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Checking municipal dispatch notifications..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Operational Event Feed
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time incident ingestion stream and automated predictive triage alerts
        </p>
      </div>

      <div className="space-y-3">
        {feed.map((item, idx) => (
          <div
            key={`notif-${item.id || item.reportId || idx}-${idx}`}
            className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-start gap-4 hover:border-sky-300 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center shrink-0 border border-sky-100">
              <Bell className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                    {item.reportId}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>

              <div className="mt-3 flex items-center justify-between">
                <StatusBadge status={item.status} size="sm" />
                <Link
                  to={`/admin/reports/${item.reportId}`}
                  className="text-xs font-bold text-sky-800 hover:text-sky-950 inline-flex items-center gap-1"
                >
                  Manage Docket <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
