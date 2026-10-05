import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  CheckCircle,
  Clock,
  Wrench,
  AlertTriangle,
  Mail,
  Phone,
  FileText
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>Citizen Information Guide</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Help & Civic Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Learn how InfraSense processes citizen reports, predicts maintenance urgency, and coordinates municipal repairs
        </p>
      </div>

      {/* 1. How to Report an Issue */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>01. How to Report an Infrastructure Issue</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Reporting on InfraSense is fully manual and privacy-preserving. No location tracking, maps, or background GPS access is requested.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">1. Select Asset</div>
            <p className="text-slate-600">
              Pick one of 6 infrastructure categories: Roads, Bridges, Streetlights, Water Pipelines, Public Buildings, or Drainage.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">2. Enter Locality</div>
            <p className="text-slate-600">
              Manually type your City, Area/Locality, Street/Road, and optional landmark so field crews can locate the site easily.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">3. Upload Photo</div>
            <p className="text-slate-600">
              Attach a photo or video to trigger automated visual defect detection and submit for risk calculation.
            </p>
          </div>
        </div>
      </section>

      {/* 2. How Risk Scores Work */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          02. How Risk Scores are Calculated
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          InfraSense employs a transparent 6-factor weighted calculation to prioritize repairs equitably based on empirical risk rather than complaint loudness:
        </p>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-900">Historical Maintenance</span>
              <p className="text-slate-500">Past repair frequency and recurrent failure history</p>
            </div>
            <span className="font-mono font-bold text-sky-900">20% Weight</span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-900">Similar Public Complaints</span>
              <p className="text-slate-500">Density of nearby citizen complaints within the last 30 days</p>
            </div>
            <span className="font-mono font-bold text-sky-900">20% Weight</span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-900">Current Issue Severity</span>
              <p className="text-slate-500">Citizen reported severity (Low, Moderate, High, Critical)</p>
            </div>
            <span className="font-mono font-bold text-sky-900">20% Weight</span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-900">Sensor Data Telemetry</span>
              <p className="text-slate-500">Subsurface strain, catch-basin ultrasonic, or pipeline pressure</p>
            </div>
            <span className="font-mono font-bold text-sky-900">15% Weight</span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-900">Climate & Environmental Risk</span>
              <p className="text-slate-500">Precipitation runoff, monsoon flooding index, and saturation</p>
            </div>
            <span className="font-mono font-bold text-sky-900">15% Weight</span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-900">Infrastructure Asset Baseline</span>
              <p className="text-slate-500">Municipal age, installation date, and inspection condition rating</p>
            </div>
            <span className="font-mono font-bold text-sky-900">10% Weight</span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-center">
          <div className="p-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="font-bold">0–30:</span> Low Risk
          </div>
          <div className="p-2 rounded bg-amber-50 text-amber-800 border border-amber-200">
            <span className="font-bold">31–60:</span> Moderate Risk
          </div>
          <div className="p-2 rounded bg-orange-50 text-orange-800 border border-orange-200">
            <span className="font-bold">61–80:</span> High Risk
          </div>
          <div className="p-2 rounded bg-rose-50 text-rose-800 border border-rose-200">
            <span className="font-bold">81–100:</span> Critical Risk
          </div>
        </div>
      </section>

      {/* 3. Report Status Progression */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          03. Understanding Report Statuses
        </h2>
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-800 mb-0.5">SUBMITTED</div>
            <p className="text-slate-600">The report is recorded into the municipal database and assigned a tracking ID.</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
            <div className="font-bold text-sky-900 mb-0.5">UNDER REVIEW</div>
            <p className="text-sky-800">Civic engineers correlate sensor logs and schedule field inspection.</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
            <div className="font-bold text-indigo-900 mb-0.5">MAINTENANCE SCHEDULED</div>
            <p className="text-indigo-800">A municipal public works contractor and machinery have been dispatched.</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="font-bold text-amber-900 mb-0.5">IN PROGRESS</div>
            <p className="text-amber-800">Active repairs, resurfacing, or clearing is underway on location.</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="font-bold text-emerald-900 mb-0.5">RESOLVED</div>
            <p className="text-emerald-800">The issue has been repaired and verified. Citizens can submit rating feedback.</p>
          </div>
        </div>
      </section>

      {/* 4. Contact & Civic Support */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          04. Emergency Civic Support
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          For acute emergencies posing immediate danger to life (such as exposed live 440V cables, major bridge fracture, or deep sinkholes):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <Phone className="w-5 h-5 text-sky-800 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Municipal Rapid Hotline</div>
              <div className="text-slate-500 font-mono">1800-345-6789 (24x7 Toll Free)</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <Mail className="w-5 h-5 text-sky-800 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Public Works Desk</div>
              <div className="text-slate-500 font-mono">support@infrasense.gov.in</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
