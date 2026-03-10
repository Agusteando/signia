"use client";
import { UserIcon } from "@heroicons/react/24/solid";

export default function ReconciliationTable({ matches, onSelectMatch, selectedIds, setSelectedIds }) {
  const validMatches = matches.filter(m => m.signiaUser);
  const allSelected = validMatches.length > 0 && selectedIds.length === validMatches.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(validMatches.map(m => m.ingressioId));
    }
  };

  const toggleSelectRow = (id, hasSigniaUser) => {
    if (!hasSigniaUser) return; // Cannot select rows without a match
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(v => v !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="overflow-x-auto relative w-full pb-4">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 whitespace-nowrap">
          <tr>
            <th className="px-6 py-3 font-semibold text-center w-10">
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                checked={allSelected}
                onChange={toggleSelectAll}
                disabled={validMatches.length === 0}
              />
            </th>
            <th className="px-6 py-3 font-semibold">ID Ingressio</th>
            <th className="px-6 py-3 font-semibold">Empleado Ingressio</th>
            <th className="px-6 py-3 font-semibold">Mejor Match en Signia</th>
            <th className="px-6 py-3 font-semibold">Confianza</th>
            <th className="px-6 py-3 font-semibold">Razón del Match</th>
            {/* Sticky column header for Actions */}
            <th className="px-6 py-3 font-semibold text-right sticky right-0 bg-slate-50 border-l border-slate-200 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white whitespace-nowrap">
          {matches.map((m, idx) => {
            const isHighConfidence = m.confidence >= 80;
            const isMediumConfidence = m.confidence >= 40 && m.confidence < 80;
            const noMatch = !m.signiaUser;
            const isSelected = selectedIds.includes(m.ingressioId);

            return (
              <tr key={m.ingressioId + idx} className={`transition group ${isSelected ? "bg-indigo-50/50" : "hover:bg-slate-50"}`}>
                <td className="px-6 py-4 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    checked={isSelected}
                    disabled={noMatch}
                    onChange={() => toggleSelectRow(m.ingressioId, !noMatch)}
                  />
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{m.ingressioId}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{m.ingressioEmp.NombreCompleto || "Sin Nombre"}</div>
                  <div className="text-xs text-slate-500">{m.ingressioEmp.CURP || m.ingressioEmp.RFC}</div>
                </td>
                <td className="px-6 py-4">
                  {noMatch ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200">
                      <UserIcon className="w-3.5 h-3.5" /> No encontrado
                    </span>
                  ) : (
                    <div>
                      <div className="font-semibold text-indigo-900">{m.signiaUser.name}</div>
                      <div className="text-xs text-indigo-500">{m.signiaUser.email}</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full ${isHighConfidence ? "bg-emerald-500" : isMediumConfidence ? "bg-amber-500" : "bg-red-500"}`} 
                        style={{ width: `${m.confidence}%` }}
                      />
                    </div>
                    <span className={`font-bold text-xs ${isHighConfidence ? "text-emerald-700" : isMediumConfidence ? "text-amber-700" : "text-red-700"}`}>
                      {m.confidence}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-medium text-slate-600 max-w-[200px] truncate" title={m.reason}>
                    {m.reason}
                  </div>
                </td>
                {/* Sticky column cell for Actions */}
                <td className={`px-6 py-4 text-right sticky right-0 border-l border-slate-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)] transition-colors ${isSelected ? "bg-indigo-50" : "bg-white group-hover:bg-slate-50"}`}>
                  <button 
                    onClick={() => onSelectMatch(m)}
                    className="inline-flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Detalles
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}