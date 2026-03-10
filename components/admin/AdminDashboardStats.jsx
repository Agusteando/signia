"use client";
import React from "react";
import { CheckBadgeIcon, ExclamationTriangleIcon, UserGroupIcon, UserPlusIcon } from "@heroicons/react/24/outline";

export default function AdminDashboardStats({ summary }) {
  // Gracefully handles both payload structures mapped from `page.jsx` vs `page.js`
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      <StatCard 
        title="Empleados" 
        value={summary.totalActiveEmployees ?? summary.totalUsers} 
        icon={UserGroupIcon} 
        color="slate" 
      />
      <StatCard 
        title="Completos" 
        value={summary.completedActiveEmployees ?? summary.userDocsCompleted} 
        icon={CheckBadgeIcon} 
        color="emerald" 
      />
      <StatCard 
        title="Incompletos" 
        value={summary.incompleteActiveEmployees ?? (summary.totalUsers - summary.userDocsCompleted)} 
        icon={ExclamationTriangleIcon} 
        color="amber" 
      />
      <StatCard 
        title="Candidatos" 
        value={summary.totalActiveCandidates ?? 0} 
        icon={UserPlusIcon} 
        color="slate" 
      />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    slate: "text-slate-700 bg-slate-100/80 border-slate-200/80",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200/80",
    amber: "text-amber-700 bg-amber-50 border-amber-200/80",
    rose: "text-rose-700 bg-rose-50 border-rose-200/80",
  };

  return (
    <div className="flex items-center gap-4 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] min-w-[140px] transition-shadow hover:shadow-md">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${colorMap[color]}`}>
        <Icon className="w-4 h-4 stroke-2" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <span className="text-lg font-semibold text-slate-900 leading-none mt-1">{value ?? 0}</span>
      </div>
    </div>
  );
}