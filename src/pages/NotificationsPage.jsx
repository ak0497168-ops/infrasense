import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wrench,
  CheckCheck,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { notificationsAPI } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      if (res.data?.data) {
        setNotifications(res.data.data.notifications || []);
      }
    } catch {
      setError('Unable to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'RISK_ASSESSED':
        return <ShieldAlert className="w-5 h-5 text-sky-800" />;
      case 'SIMILAR_DETECTED':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'STATUS_CHANGED':
      case 'MAINTENANCE_SCHEDULED':
        return <Wrench className="w-5 h-5 text-indigo-600" />;
      case 'RESOLVED':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Checking municipal notification feed..." />;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Civic Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-600 text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status alerts, risk classifications, and municipal dispatch notices
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const notifId = notif._id || notif.id;
            return (
              <div
                key={notifId}
                className={`p-4 sm:p-5 rounded-xl border transition-all flex items-start gap-4 ${
                  notif.read
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-sky-50/50 border-sky-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                  {getTypeIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkRead(notifId)}
                          className="text-[11px] font-semibold text-sky-800 hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.reportId && (
                    <div className="mt-3">
                      <Link
                        to={`/reports/${notif.reportId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 hover:underline"
                      >
                        View Report {notif.reportId} <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You will receive alerts here when you submit reports or when municipal crews update maintenance stages."
        />
      )}
    </div>
  );
}
