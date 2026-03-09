"use client";
import { useState } from "react";
import PlantelUserProgressTable from "./PlantelUserProgressTable";
import { ClipboardDocumentListIcon, BuildingLibraryIcon } from "@heroicons/react/24/outline";

export default function PlantelProgressPanel({ planteles }) {
  const [openPlantelId, setOpenPlantelId] = useState(null);

  return (
    <div id="plantel-progress" className="w-full">
      <h2 className="text-lg font-semibold mb-4 text-slate-900 flex items-center gap-2">
        <BuildingLibraryIcon className="w-5 h-5 text-slate-500" />
        Progreso por Plantel
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {planteles.map(p => {
          const progress = p.progress || {};
          const total = Number(progress.total) || 0;
          const userCompleted = Number(progress.userDocsCompleted) || 0;
          const adminCompleted = Number(progress.expedientesValidados) || 0;
          const percentDigital = total > 0 ? Math.round((userCompleted / total) * 100) : 0;
          const percentFinal = total > 0 ? Math.round((adminCompleted / total) * 100) : 0;

          return (
            <div key={p.id}
              className="shadow-sm border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition relative flex flex-col"
            >
              <div className="px-4 py-3 sm:px-5 sm:py-4 flex flex-row items-center justify-between gap-2 border-b border-slate-100">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-sm sm:text-base text-slate-900 truncate">{p.name}</div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                    Usuarios: <span className="text-slate-900 font-semibold">{total}</span>
                  </div>
                </div>
                <button className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm flex items-center gap-1.5 transition shrink-0"
                  onClick={() => setOpenPlantelId(p.id)}
                >
                  <ClipboardDocumentListIcon className="w-4 h-4 text-slate-400" />
                  Detalles
                </button>
              </div>
              <div className="px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-600 font-medium">Expedientes digitales</span>
                  <span className="text-xs font-semibold text-slate-900">{percentDigital}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentDigital > 90
                        ? "bg-emerald-500"
                        : percentDigital > 50
                        ? "bg-indigo-500"
                        : "bg-amber-400"
                    }`}
                    style={{ width: `${percentDigital}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-600 font-medium">Expedientes finales</span>
                  <span className="text-xs font-semibold text-slate-900">{percentFinal}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-5">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentFinal > 90
                        ? "bg-emerald-500"
                        : percentFinal > 50
                        ? "bg-indigo-500"
                        : "bg-amber-400"
                    }`}
                    style={{ width: `${percentFinal}%` }}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs font-medium">
                  <span className="px-2 py-1 rounded bg-slate-50 text-slate-600 border border-slate-200">
                    Digitales: <strong className="text-slate-900">{userCompleted}</strong>
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-50 text-slate-600 border border-slate-200">
                    Finales: <strong className="text-slate-900">{adminCompleted}</strong>
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-50 text-slate-600 border border-slate-200">
                    Faltantes: <strong className="text-slate-900">{total - adminCompleted}</strong>
                  </span>
                </div>
              </div>
              
              {openPlantelId === p.id &&
                <PlantelUserProgressTable
                  users={p.employees}
                  stepMeta={p.stepMeta || []}
                  plantelName={p.name}
                  onClose={() => setOpenPlantelId(null)}
                />
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}