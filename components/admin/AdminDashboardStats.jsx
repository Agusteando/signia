"use client";
import React from "react";
import { CheckBadgeIcon, ExclamationTriangleIcon, UserGroupIcon, UserPlusIcon } from "@heroicons/react/24/outline";

export default function AdminDashboardStats({ summary, users = [] }) {
  // Safe extraction matching both page.js and page.jsx summary shapes
  const totalEmployees = summary.totalActiveEmployees ?? summary.totalUsers ?? 0;
  const completed = summary.completedActiveEmployees ?? summary.userDocsCompleted ?? 0;
  const incomplete = summary.incompleteActiveEmployees ?? (totalEmployees - completed);
  const candidates = summary.totalActiveCandidates ?? 0;

  const pct = totalEmployees > 0 ? Math.round((completed / totalEmployees) * 100) : 0;

  // Visual logic for avatar cluster
  const activeUsers = users.filter(u => u.isActive && u.role === "employee" && u.picture);
  const displayAvatars = activeUsers.slice(0, 5).map(u => u.picture);
  const extraAvatarsCount = Math.max(0, totalEmployees - displayAvatars.length);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full fade-in">
      {/* 1. Main Purple Card */}
      <a href="#user-management" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6A3DF0] to-[#7B4DFF] p-7 text-white shadow-[0_12px_24px_-8px_rgba(106,61,240,0.4)] group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-8px_rgba(106,61,240,0.5)] flex flex-col justify-between min-h-[170px] outline-none focus-visible:ring-4 ring-[#7B4DFF]/50">
        <div className="absolute -top-4 -right-4 p-4 opacity-10 pointer-events-none">
           <UserGroupIcon className="w-32 h-32 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
        </div>
        <div>
          <p className="text-white/80 text-xs font-bold tracking-widest uppercase">Fuerza Laboral Activa</p>
          <h3 className="text-[2.75rem] font-extrabold mt-1 tracking-tight leading-none">{totalEmployees}</h3>
        </div>
        <div className="flex items-center mt-5">
          <div className="flex items-center -space-x-3">
            {displayAvatars.map((pic, i) => (
              <img 
                key={i} 
                src={pic} 
                alt="" 
                className={`w-11 h-11 rounded-full border-2 border-[#6A3DF0] object-cover shadow-sm bg-white relative z-10 hover:z-50 hover:!scale-125 transition-transform bubble-float-${i % 5}`} 
                onError={(e) => e.target.style.display='none'} 
              />
            ))}
            {extraAvatarsCount > 0 && (
              <div className="w-11 h-11 rounded-full border-2 border-[#6A3DF0] bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white relative z-0 shadow-sm bubble-float-0">
                +{extraAvatarsCount > 99 ? '99' : extraAvatarsCount}
              </div>
            )}
          </div>
        </div>
      </a>

      {/* 2. Teal Card */}
      <a href="#user-management" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00A6A6] to-[#0FB5C9] p-7 text-white shadow-[0_12px_24px_-8px_rgba(0,166,166,0.4)] group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-8px_rgba(0,166,166,0.5)] flex flex-col justify-between min-h-[170px] outline-none focus-visible:ring-4 ring-[#0FB5C9]/50">
        <div className="absolute -top-4 -right-4 p-4 opacity-10 pointer-events-none">
           <CheckBadgeIcon className="w-32 h-32 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
        </div>
        <div>
          <p className="text-white/80 text-xs font-bold tracking-widest uppercase">Expedientes Validados</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-[2.75rem] font-extrabold tracking-tight leading-none">{completed}</h3>
            <span className="text-lg text-white/80 font-medium">/ {totalEmployees}</span>
          </div>
        </div>
        <div className="w-full mt-6">
          <div className="flex justify-between text-xs font-bold mb-2 text-white/90">
            <span>Progreso Global</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </a>

      {/* 3. Deep Teal Neutral Card (Incomplete) */}
      <a href="#plantel-progress" className="relative overflow-hidden rounded-3xl bg-white border border-[#EEF2F7] p-7 shadow-sm group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#004C4C]/5 flex flex-col justify-between min-h-[170px] outline-none focus-visible:ring-4 ring-[#004C4C]/20">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">Incompletos</p>
            <h3 className="text-[2.75rem] font-extrabold text-[#1F2937] mt-1 tracking-tight leading-none">{incomplete}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#F6F8FB] flex items-center justify-center text-[#004C4C] group-hover:bg-[#004C4C] group-hover:text-white transition-colors duration-300 shadow-inner bubble-float-subtle-0">
            <ExclamationTriangleIcon className="w-7 h-7" />
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-5 font-medium leading-tight group-hover:text-slate-700 transition-colors">
          Empleados con documentos o firmas aún pendientes de entrega.
        </p>
      </a>

      {/* 4. Deep Teal Neutral Card (Candidates) */}
      <a href="#user-management" className="relative overflow-hidden rounded-3xl bg-white border border-[#EEF2F7] p-7 shadow-sm group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6A3DF0]/5 flex flex-col justify-between min-h-[170px] outline-none focus-visible:ring-4 ring-[#6A3DF0]/20">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">Candidatos</p>
            <h3 className="text-[2.75rem] font-extrabold text-[#1F2937] mt-1 tracking-tight leading-none">{candidates}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#F6F8FB] flex items-center justify-center text-[#6A3DF0] group-hover:bg-[#6A3DF0] group-hover:text-white transition-colors duration-300 shadow-inner bubble-float-subtle-0" style={{ animationDelay: '0.4s' }}>
            <UserPlusIcon className="w-7 h-7" />
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-5 font-medium leading-tight group-hover:text-slate-700 transition-colors">
          Personal en fase de reclutamiento y onboarding activo.
        </p>
      </a>
    </div>
  );
}