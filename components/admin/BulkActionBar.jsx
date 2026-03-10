"use client";
import { useState } from "react";

export default function BulkActionBar({
  users, planteles, selectedUserIds, canAssignPlantel, onBulkAssign, onBulkSetActive
}) {
  const [bulkPlantelId, setBulkPlantelId] = useState("");

  if (selectedUserIds.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white rounded-2xl shadow-2xl flex flex-wrap items-center gap-4 px-5 py-3 border border-slate-700 fade-in">
      <div className="flex items-center gap-2">
        <span className="bg-indigo-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-inner">{selectedUserIds.length}</span>
        <span className="text-sm font-medium pr-2 hidden sm:inline text-slate-300">seleccionados</span>
      </div>
      <div className="w-px h-6 bg-slate-700" />
      
      <div className="flex items-center gap-2">
        {canAssignPlantel && (
          <>
            <select
               className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
               value={bulkPlantelId}
               onChange={e => setBulkPlantelId(e.target.value)}
            >
              <option value="">Asignar plantel...</option>
              {planteles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button 
              className="text-sm font-medium hover:text-indigo-400 transition px-2 disabled:opacity-50" 
              onClick={() => { onBulkAssign(bulkPlantelId); setBulkPlantelId(""); }} 
              disabled={!bulkPlantelId}
            >Aplicar</button>
            <div className="w-px h-6 bg-slate-700 mx-1" />
          </>
        )}
        <button className="text-sm font-medium hover:text-emerald-400 transition px-2" onClick={() => onBulkSetActive(true)}>Activar</button>
        <button className="text-sm font-medium hover:text-red-400 transition px-2" onClick={() => onBulkSetActive(false)}>Dar Baja</button>
      </div>
    </div>
  );
}