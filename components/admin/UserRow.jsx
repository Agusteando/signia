"use client";
import { useState } from "react";
import { CheckCircleIcon, EyeIcon, ClipboardDocumentListIcon, TrashIcon, PowerIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";

export default function UserRow({
  user, planteles, adminsPlanteles, role, selected, canAssignPlantel,
  onSelect, onAssignPlantel, onDocs, onFichaTecnica, onSetActive, onDelete, getUserChecklistProgress
}) {
  const [confirmAction, setConfirmAction] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = !!user.isActive;
  const canAdminAssignTo = pid => role === "superadmin" || adminsPlanteles.includes(pid);
  const canDelete = role === "superadmin" && typeof onDelete === "function";
  const canToggleActive = role === "superadmin" || (role === "admin" && user.plantelId && adminsPlanteles.includes(user.plantelId));
  
  const progress = getUserChecklistProgress(user);

  return (
    <tr className={`group border-b border-slate-100 transition-colors ${selected ? "bg-indigo-50/40 hover:bg-indigo-50/60" : "bg-white hover:bg-slate-50"} ${!isActive ? "opacity-60" : ""}`} onMouseLeave={() => setMenuOpen(false)}>
      <td className="py-3 text-center">
        <input type="checkbox" checked={selected} onChange={e => onSelect(e.target.checked)} className="accent-indigo-600 w-4 h-4 rounded border-slate-300 cursor-pointer" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={user.picture || "/IMAGOTIPO-IECS-IEDIS.png"} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = "/IMAGOTIPO-IECS-IEDIS.png"; }} />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-slate-900 truncate">{user.name}</span>
            <span className="text-xs text-slate-500 truncate">{user.email}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {canAssignPlantel ? (
          <select
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs bg-transparent focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none w-full max-w-[160px] text-slate-700"
            value={user.plantelId || ""}
            onChange={e => onAssignPlantel(user.id, e.target.value)}
            disabled={!isActive || (role === "admin" && !canAdminAssignTo(Number(e.target.value)))}
          >
            <option value="">Sin plantel</option>
            {planteles.map(p => <option key={p.id} value={p.id} disabled={role === "admin" && !canAdminAssignTo(p.id)}>{p.name}</option>)}
          </select>
        ) : (
          <span className="text-xs text-slate-700 font-medium">
            {planteles.find(p => String(p.id) === String(user.plantelId))?.name || <span className="text-slate-400 italic">Sin plantel</span>}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {isActive ? (
          <span className="inline-flex px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">ACTIVO</span>
        ) : (
          <span className="inline-flex px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">BAJA</span>
        )}
      </td>
      <td className="px-4 py-3 min-w-[140px]">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${progress.pct === 100 ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${progress.pct}%` }} />
          </div>
          <span className="text-xs font-semibold text-slate-600 w-8">{progress.pct}%</span>
        </div>
      </td>
      <td className="px-4 py-3 text-right relative">
        <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onDocs(user)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition" title="Documentos"><EyeIcon className="w-5 h-5" /></button>
          <button onClick={() => onFichaTecnica(user)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition" title="Ficha Técnica"><ClipboardDocumentListIcon className="w-5 h-5" /></button>
          
          {(canToggleActive || canDelete) && (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden fade-in text-left">
                  {canToggleActive && (
                    <button onClick={() => { setMenuOpen(false); setConfirmAction({ type: "toggle", user }); }} className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                      <PowerIcon className="w-4 h-4" /> {isActive ? "Dar de baja" : "Activar"}
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => { setMenuOpen(false); setConfirmAction({ type: "delete", user }); }} className="w-full px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <TrashIcon className="w-4 h-4" /> Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {confirmAction?.type === "toggle" && confirmAction.user.id === user.id && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-[110] p-4 text-left">
            <div className="bg-white shadow-2xl rounded-2xl p-6 max-w-sm w-full border border-slate-200">
              <h3 className="font-bold text-lg text-slate-900 mb-2">{isActive ? "Dar de baja usuario" : "Activar usuario"}</h3>
              <p className="mb-6 text-slate-600 text-sm">{isActive ? "¿Seguro que deseas dar de baja a este usuario? Perderá acceso a la plataforma." : "¿Seguro que deseas reactivar a este usuario?"}</p>
              <div className="flex gap-3 justify-end">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition" onClick={() => setConfirmAction(null)}>Cancelar</button>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition ${isActive ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}`} onClick={() => { setConfirmAction(null); onSetActive(user.id, !isActive); }}>{isActive ? "Dar de baja" : "Activar"}</button>
              </div>
            </div>
          </div>
        )}
        
        {canDelete && confirmAction?.type === "delete" && confirmAction.user.id === user.id && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-[110] p-4 text-left">
            <div className="bg-white shadow-2xl rounded-2xl p-6 max-w-sm w-full border-t-4 border-red-500">
              <h3 className="font-bold text-lg text-red-600 mb-2">¡Acción Irreversible!</h3>
              <p className="mb-6 text-slate-600 text-sm">¿Seguro que deseas eliminar este usuario? <br/><br/>Se recomienda usar <strong>Baja</strong> para conservar su historial.</p>
              <div className="flex gap-3 justify-end">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition" onClick={() => setConfirmAction(null)}>Cancelar</button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition" onClick={() => { setConfirmAction(null); onDelete(user.id); }}>Eliminar permanentemente</button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}