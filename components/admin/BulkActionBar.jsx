"use client";
import { useState } from "react";
import { BuildingLibraryIcon, PowerIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function BulkActionBar({
  users,
  planteles,
  adminRole,
  selectedUserIds,
  allSelected,
  canAssignPlantel,
  onBulkAssign,
  onBulkSetActive,
}) {
  const [bulkPlantelId, setBulkPlantelId] = useState("");
  const usersSelected = users.filter(u => selectedUserIds.includes(u.id));

  const eligibleForActivate = usersSelected.filter(u => !u.isActive);
  const canBulkActivate = eligibleForActivate.length > 0;

  const eligibleForBaja = usersSelected.filter(u => u.isActive);
  const canBulkInactivate = eligibleForBaja.length > 0;

  const canBulkAssign = selectedUserIds.length > 0;

  return (
    <div className="sticky bottom-0 w-full py-3 sm:py-4 bg-white/95 backdrop-blur border-t border-slate-200 z-20 rounded-b-xl flex flex-wrap items-center gap-3 sm:gap-4 justify-between mt-2 px-2 sm:px-1">
      <span className="flex flex-row gap-2 items-center font-medium text-slate-700 text-xs sm:text-sm">
        {selectedUserIds.length > 0 ? (
          <>Seleccionados: <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{selectedUserIds.length}</span></>
        ) : (
          <span className="text-slate-400">Ningún usuario seleccionado</span>
        )}
      </span>
      <div className="flex flex-row flex-wrap gap-2 sm:gap-3 items-center">
        {canAssignPlantel && (
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border border-slate-300 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-white min-w-[130px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={bulkPlantelId}
              onChange={e => setBulkPlantelId(e.target.value)}
            >
              <option value="">Asignar a plantel...</option>
              {planteles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm rounded-md px-3 py-1 sm:px-4 sm:py-1.5 font-medium shadow-sm disabled:opacity-50 transition-colors flex flex-row gap-1.5 items-center min-w-[80px]"
              disabled={!canBulkAssign || !bulkPlantelId}
              onClick={() => onBulkAssign(bulkPlantelId)}
            >
              <BuildingLibraryIcon className="w-4 h-4 hidden xs:block" /> Asignar
            </button>
          </div>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2 border-l pl-2 sm:pl-3 border-slate-200 ml-1">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm rounded-md px-2.5 py-1 sm:px-4 sm:py-1.5 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
            disabled={!canBulkInactivate}
            onClick={() => onBulkSetActive(false)}
          >
            <PowerIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            Baja
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 border border-transparent text-white text-xs sm:text-sm rounded-md px-2.5 py-1 sm:px-4 sm:py-1.5 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
            disabled={!canBulkActivate}
            onClick={() => onBulkSetActive(true)}
          >
            <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-100" />
            Activar
          </button>
        </div>
      </div>
    </div>
  );
}