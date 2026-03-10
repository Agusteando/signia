"use client";
import { useState } from "react";
import PlantelUserProgressTable from "./PlantelUserProgressTable";
import { CheckCircleIcon, ExclamationTriangleIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function PlantelProgressPanel({ planteles }) {
  const [openPlantelId, setOpenPlantelId] = useState(null);

  const sorted = [...planteles].sort((a, b) => {
     const pctA = a.progress.total ? a.progress.userDocsCompleted / a.progress.total : 0;
     const pctB = b.progress.total ? b.progress.userDocsCompleted / b.progress.total : 0;
     return pctB - pctA;
  });
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Insights de Progreso</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Insights Cards */}
        <div className="flex flex-col gap-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5" /> Plantel Destacado
            </h3>
            <p className="text-sm text-emerald-700 leading-relaxed">
              <strong>{top?.name}</strong> lidera con {top?.progress?.percentDigitalExpedientes || 0}% de expedientes digitales completos.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" /> Atención Requerida
            </h3>
            <p className="text-sm text-amber-700 leading-relaxed">
              <strong>{bottom?.name}</strong> tiene el menor avance global ({bottom?.progress?.percentDigitalExpedientes || 0}%).
            </p>
          </div>
        </div>
        
        {/* Ranked Progress Bars */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {sorted.map(p => (
            <div key={p.id}>
              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setOpenPlantelId(openPlantelId === p.id ? null : p.id)}>
                <div className="w-1/3 text-sm font-semibold text-slate-700 truncate group-hover:text-indigo-600 transition" title={p.name}>{p.name}</div>
                <div className="w-2/3 flex items-center gap-4">
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${p.progress.percentDigitalExpedientes}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-500 w-10 text-right">{p.progress.percentDigitalExpedientes}%</span>
                  <ChevronRightIcon className={`w-4 h-4 text-slate-400 transition-transform ${openPlantelId === p.id ? "rotate-90 text-indigo-500" : ""}`} />
                </div>
              </div>
              
              {openPlantelId === p.id && (
                <div className="mt-4 pl-4 border-l-2 border-indigo-100 animate-fade-in pb-4">
                  <PlantelUserProgressTable users={p.employees} stepMeta={p.stepMeta || []} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}