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
    <tr className={`group border-b border-slate-100/80 transition-colors ${selected ? "bg-slate-50/80" : "bg-white hover:bg-slate-50/50"} ${!isActive ? "opacity-60 grayscale-[0.5]" : ""}`} onMouseLeave={() => setMenuOpen(false)}>
      <td className="py-3 text-center">
        <input type="checkbox" checked={selected} onChange={e => onSelect(e.target.checked)} className="accent-slate-900 w-4 h-4 rounded border-slate-300 cursor-pointer" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={user.picture || "/IMAGOTIPO-IECS-IEDIS.png"} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-sm" onError={(e) => { e.target.onerror = null; e.target.src = "/IMAGOTIPO-IECS-IEDIS.png"; }} />
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm text-slate-900 truncate">{user.name}</span>
            <span className="text-xs text-slate-500 truncate">{user.email}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {canAssignPlantel ? (
          <select
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/5 outline-none w-full max-w-[160px] text-slate-700 transition-colors cursor-pointer"
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
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium ring-1 ring-inset ring-emerald-600/10">Activo</span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium ring-1 ring-inset ring-slate-500/10">Baja</span>
        )}
      </td>
      <td className="px-4 py-3 min-w-[140px]">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
            <div className={`h-full rounded-full transition-all ${progress.pct === 100 ? "bg-emerald-500" : "bg-slate-800"}`} style={{ width: `${progress.pct}%` }} />
          </div>
          <span className="text-[11px] font-medium text-slate-500 w-8">{progress.pct}%</span>
        </div>
      </td>
      <td className="px-4 py-3 text-right relative">
        <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onDocs(user)} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors" title="Documentos"><EyeIcon className="w-4 h-4" /></button>
          <button onClick={() => onFichaTecnica(user)} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors" title="Ficha Técnica"><ClipboardDocumentListIcon className="w-4 h-4" /></button>
          
          {(canToggleActive || canDelete) && (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
                <EllipsisVerticalIcon className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden fade-in text-left">
                  {canToggleActive && (
                    <button onClick={() => { setMenuOpen(false); setConfirmAction({ type: "toggle", user }); }} className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                      <PowerIcon className="w-4 h-4" /> {isActive ? "Dar de baja" : "Activar"}
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => { setMenuOpen(false); setConfirmAction({ type: "delete", user }); }} className="w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors border-t border-slate-100">
                      <TrashIcon className="w-4 h-4" /> Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {confirmAction?.type === "toggle" && confirmAction.user.id === user.id && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm z-[110] p-4 text-left">
            <div className="bg-white shadow-xl rounded-xl p-6 max-w-sm w-full border border-slate-200">
              <h3 className="font-semibold text-lg text-slate-900 mb-1">{isActive ? "Dar de baja usuario" : "Activar usuario"}</h3>
              <p className="mb-6 text-slate-500 text-sm leading-relaxed">{isActive ? "¿Seguro que deseas dar de baja a este usuario? Perderá acceso a la plataforma." : "¿Seguro que deseas reactivar a este usuario?"}</p>
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 transition" onClick={() => setConfirmAction(null)}>Cancelar</button>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition shadow-sm ${isActive ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}`} onClick={() => { setConfirmAction(null); onSetActive(user.id, !isActive); }}>{isActive ? "Dar de baja" : "Activar"}</button>
              </div>
            </div>
          </div>
        )}
        
        {canDelete && confirmAction?.type === "delete" && confirmAction.user.id === user.id && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm z-[110] p-4 text-left">
            <div className="bg-white shadow-xl rounded-xl p-6 max-w-sm w-full border border-slate-200">
              <h3 className="font-semibold text-lg text-rose-600 mb-1">¡Acción Irreversible!</h3>
              <p className="mb-6 text-slate-500 text-sm leading-relaxed">¿Seguro que deseas eliminar este usuario? <br/><br/>Se recomienda usar <strong>Baja</strong> para conservar su historial intacto.</p>
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 transition" onClick={() => setConfirmAction(null)}>Cancelar</button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition" onClick={() => { setConfirmAction(null); onDelete(user.id); }}>Eliminar permanentemente</button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}