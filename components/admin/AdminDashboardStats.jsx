"use client";
import React from "react";
import { CheckBadgeIcon, ExclamationTriangleIcon, UserGroupIcon, UserPlusIcon } from "@heroicons/react/24/outline";

export default function AdminDashboardStats({ summary }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <StatCard 
        title="Colaboradores" 
        value={summary.totalActiveEmployees} 
        icon={UserGroupIcon} 
        type="primary"
      />
      <StatCard 
        title="Validados" 
        value={summary.completedActiveEmployees} 
        icon={CheckBadgeIcon} 
        type="teal"
      />
      <StatCard 
        title="Incompletos" 
        value={summary.incompleteActiveEmployees} 
        icon={ExclamationTriangleIcon} 
        type="purple"
      />
      <StatCard 
        title="Candidatos" 
        value={summary.totalActiveCandidates} 
        icon={UserPlusIcon} 
        type="neutral"
      />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, type }) {
  const styles = {
    primary: "group-hover:text-signia-purple group-hover:bg-signia-purple/10",
    teal: "group-hover:text-signia-teal group-hover:bg-signia-teal/10",
    purple: "group-hover:text-[#7B4DFF] group-hover:bg-[#7B4DFF]/10",
    neutral: "group-hover:text-slate-800 group-hover:bg-slate-200",
  };

  return (
    <div className="group relative bg-white/60 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-200/60 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-white hover:border-slate-300 min-w-[150px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <Icon className={`w-4 h-4 text-slate-400 transition-colors duration-300 ${styles[type]}`} />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-black text-slate-900 leading-none">{value ?? 0}</span>
      </div>
      
      {/* Micro-interaction expansion line */}
      <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-signia-purple to-signia-teal transition-all duration-500 group-hover:w-full rounded-b-2xl`} />
    </div>
  );
}