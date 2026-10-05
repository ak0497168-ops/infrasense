import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Bell,
  CheckCircle2,
  FileText,
  LogOut,
  HelpCircle,
  ShieldCheck,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { reportsAPI } from '../services/api.js';

export default function ProfilePage() {
  const { user, logout, updatePreferences } = useAuth();
  const navigate = useNavigate();

  const [totalReports, setTotalReports] = useState(0);
  const [resolvedReports, setResolvedReports] = useState(0);
  const [prefs, setPrefs] = useState({
    email: user?.notificationPreferences?.email ?? true,
    push: user?.notificationPreferences?.push ?? true,
    sms: user?.notificationPreferences?.sms ?? false,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    reportsAPI.getMy()
      .then((res) => {
        if (res.data?.data?.stats) {
          setTotalReports(res.data.data.stats.totalReports || 0);
          setResolvedReports(res.data.data.stats.resolved || 0);
        }
      })
      .catch(() => {});
  }, []);

  const handlePrefToggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setSaveSuccess(false);
    try {
      await updatePreferences(prefs);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Citizen Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your verified citizen credentials, dispatch notifications, and account settings
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Citizen
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-500 font-medium">Total Reports Submitted</div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
              {totalReports}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-500 font-medium">Resolved Issues</div>
            <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1 tabular-nums">
              {resolvedReports}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
            <div className="text-slate-500 font-medium">Registered Civic Region</div>
            <div className="text-sm font-bold text-slate-900 mt-1 truncate">
              Patna Municipal Zone
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Notification Preferences
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control how you receive updates when repairs are scheduled or completed
            </p>
          </div>
          <Bell className="w-5 h-5 text-sky-800" />
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="divide-y divide-slate-100">
            <label className="py-3 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-900">Email Notifications</span>
                <p className="text-[11px] text-slate-500">
                  Receive report confirmations and risk summaries via email
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.email}
                onChange={() => handlePrefToggle('email')}
                className="w-4 h-4 text-sky-800 rounded border-slate-300 focus:ring-sky-800"
              />
            </label>

            <label className="py-3 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-900">In-App Push Alerts</span>
                <p className="text-[11px] text-slate-500">
                  Instant notifications when municipal crews update maintenance stages
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.push}
                onChange={() => handlePrefToggle('push')}
                className="w-4 h-4 text-sky-800 rounded border-slate-300 focus:ring-sky-800"
              />
            </label>

            <label className="py-3 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-900">SMS Alerts (Critical Only)</span>
                <p className="text-[11px] text-slate-500">
                  Emergency text messages for acute flooding or structural bridge hazards
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.sms}
                onChange={() => handlePrefToggle('sms')}
                className="w-4 h-4 text-sky-800 rounded border-slate-300 focus:ring-sky-800"
              />
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={savingPrefs}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {savingPrefs ? 'Saving...' : 'Save Preferences'}
            </button>
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Preferences updated
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/help"
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 shadow-xs flex items-center justify-between group transition-all"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-900">
              Help & Citizen Knowledge Base
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Read about the 6-factor risk algorithm and civic response SLAs
            </p>
          </div>
          <HelpCircle className="w-5 h-5 text-slate-400 group-hover:text-sky-800 shrink-0" />
        </Link>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Civic Data & Privacy
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              No continuous GPS tracking or location surveillance is performed
            </p>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        </div>
      </div>
    </div>
  );
}
