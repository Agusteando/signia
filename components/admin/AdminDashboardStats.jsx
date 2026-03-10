"use client";
import React from "react";
import { CheckBadgeIcon, ExclamationTriangleIcon, UserGroupIcon, UserPlusIcon } from "@heroicons/react/24/solid";

export default function AdminDashboardStats({ summary }) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      {/* KPI 1 */}
      <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-700/50 shadow-inner min-w-[150px] transition-transform hover:-translate-y-0.5">
        <div className="w-11 h-11 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-400/30">
          <UserGroupIcon className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Empleados</span>
          <span className="text-2xl font-extrabold text-white leading-none mt-0.5">{summary.totalActiveEmployees}</span>
        </div>
      </div>

      {/* KPI 2 */}
      <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-700/50 shadow-inner min-w-[150px] transition-transform hover:-translate-y-0.5">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-400/30">
          <CheckBadgeIcon className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Completos</span>
          <span className="text-2xl font-extrabold text-white leading-none mt-0.5">{summary.completedActiveEmployees}</span>
        </div>
      </div>

      {/* KPI 3 */}
      <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-700/50 shadow-inner min-w-[150px] transition-transform hover:-translate-y-0.5">
        <div className="w-11 h-11 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-400/30">
          <ExclamationTriangleIcon className="w-6 h-6 text-rose-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Incompletos</span>
          <span className="text-2xl font-extrabold text-white leading-none mt-0.5">{summary.incompleteActiveEmployees}</span>
        </div>
      </div>

      {/* KPI 4 */}
      <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-700/50 shadow-inner min-w-[150px] transition-transform hover:-translate-y-0.5">
        <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-400/30">
          <UserPlusIcon className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Candidatos</span>
          <span className="text-2xl font-extrabold text-white leading-none mt-0.5">{summary.totalActiveCandidates}</span>
        </div>
      </div>
    </div>
  );
}