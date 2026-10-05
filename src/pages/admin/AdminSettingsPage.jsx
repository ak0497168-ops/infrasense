import React, { useState } from 'react';
import { Settings, ShieldCheck, Sliders, Bell, Save, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const [thresholds, setThresholds] = useState({
    autoDispatchCritical: true,
    similarComplaintThreshold: 10,
    slaTargetHours: 48,
    emergencyHotlineNotice: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Administration & Municipal Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure automated dispatch triggers, priority thresholds, and officer settings
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 text-sky-900">
          <Sliders className="w-5 h-5 text-sky-800" />
          <h2 className="text-base font-bold">Predictive Dispatch Thresholds</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div>
              <span className="font-bold text-slate-900 block">Auto-Escalate Critical Risk Scores (&gt; 80)</span>
              <span className="text-slate-500">Automatically flag reports with score &gt;= 81 for rapid municipal response unit</span>
            </div>
            <input
              type="checkbox"
              checked={thresholds.autoDispatchCritical}
              onChange={(e) => setThresholds({ ...thresholds, autoDispatchCritical: e.target.checked })}
              className="w-4 h-4 text-sky-800 rounded border-slate-300 focus:ring-sky-800"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div>
              <span className="font-bold text-slate-900 block">Emergency 24x7 Citizen Push Notification</span>
              <span className="text-slate-500">Send immediate SMS broadcast to citizens within 500m of acute structural bridge or drainage collapse</span>
            </div>
            <input
              type="checkbox"
              checked={thresholds.emergencyHotlineNotice}
              onChange={(e) => setThresholds({ ...thresholds, emergencyHotlineNotice: e.target.checked })}
              className="w-4 h-4 text-sky-800 rounded border-slate-300 focus:ring-sky-800"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cluster Density Threshold (Complaints in 30 Days)
              </label>
              <input
                type="number"
                value={thresholds.similarComplaintThreshold}
                onChange={(e) => setThresholds({ ...thresholds, similarComplaintThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Standard Resolution SLA Window (Hours)
              </label>
              <input
                type="number"
                value={thresholds.slaTargetHours}
                onChange={(e) => setThresholds({ ...thresholds, slaTargetHours: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Operational Configuration
            </button>
            {saved && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Settings saved successfully
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Admin Account Metadata */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sky-900">
          <ShieldCheck className="w-5 h-5 text-sky-800" />
          <h2 className="text-base font-bold">Officer Profile Credentials</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Logged Officer:</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">{user?.name}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Authorization Email:</span>
            <div className="font-mono text-slate-800 text-sm mt-0.5">{user?.email}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Privilege Level:</span>
            <div className="font-bold text-sky-800 mt-0.5">MUNICIPAL_ADMIN (Role: {user?.role})</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Operational Jurisdiction:</span>
            <div className="font-bold text-slate-900 mt-0.5">Patna Central Metropolitan Zone</div>
          </div>
        </div>
      </div>
    </div>
  );
}
