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
    <tr className={`group border-b border-[#EEF2F7] transition-all duration-200 ${selected ? "bg-[#F6F8FB]" : "bg-white hover:bg-[#F6F8FB] hover:shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] relative z-0 hover:z-10"} ${!isActive ? "opacity-50 grayscale-[0.8]" : ""}`} onMouseLeave={() => setMenuOpen(false)}>
      <td className="py-4 text-center pl-2">
        <input type="checkbox" checked={selected} onChange={e => onSelect(e.target.checked)} className="accent-[#6A3DF0] w-4 h-4 rounded border-slate-300 cursor-pointer" />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-4">
          <img src={user.picture || "/IMAGOTIPO-IECS-IEDIS.png"} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = "/IMAGOTIPO-IECS-IEDIS.png"; }} />
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-sm text-[#1F2937] truncate leading-tight">{user.name}</span>
            <span className="text-xs text-slate-500 font-medium truncate mt-0.5">{user.email}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        {canAssignPlantel ? (
          <select
            className="rounded-xl border border-[#EEF2F7] px-3 py-2 text-xs bg-[#F6F8FB] hover:bg-white focus:bg-white focus:ring-2 focus:ring-[#00A6A6]/30 outline-none w-full max-w-[180px] text-[#1F2937] font-bold transition-colors cursor-pointer appearance-none"
            value={user.plantelId || ""}
            onChange={e => onAssignPlantel(user.id, e.target.value)}
            disabled={!isActive || (role === "admin" && !canAdminAssignTo(Number(e.target.value)))}
          >
            <option value="">Sin plantel</option>
            {planteles.map(p => <option key={p.id} value={p.id} disabled={role === "admin" && !canAdminAssignTo(p.id)}>{p.name}</option>)}
          </select>
        ) : (
          <span className="text-xs text-[#1F2937] font-bold bg-[#F6F8FB] px-3 py-1.5 rounded-lg border border-[#EEF2F7]">
            {planteles.find(p => String(p.id) === String(user.plantelId))?.name || <span className="text-slate-400 italic font-medium">Sin plantel</span>}
          </span>
        )}
      </td>
      <td className="px-4 py-4">
        {isActive ? (
          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-[#00A6A6] text-[11px] font-extrabold ring-1 ring-inset ring-[#00A6A6]/20 shadow-sm">Activo</span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-extrabold ring-1 ring-inset ring-slate-300/50 shadow-sm">Baja</span>
        )}
      </td>
      <td className="px-4 py-4 min-w-[160px]">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-[#EEF2F7] overflow-hidden shadow-inner">
            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${progress.pct === 100 ? "bg-[#00A6A6] shadow-[0_0_8px_rgba(0,166,166,0.6)]" : "bg-[#6A3DF0]"}`} style={{ width: `${progress.pct}%` }} />
          </div>
          <span className="text-[11px] font-extrabold text-[#1F2937] w-8">{progress.pct}%</span>
        </div>
      </td>
      <td className="px-4 py-4 text-right relative pr-6">
        <div className="flex items-center justify-end gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onDocs(user)} className="p-2 text-[#00A6A6] bg-[#F6F8FB] hover:text-white rounded-xl hover:bg-[#0FB5C9] transition-colors shadow-sm" title="Documentos"><EyeIcon className="w-4 h-4 stroke-2" /></button>
          <button onClick={() => onFichaTecnica(user)} className="p-2 text-[#6A3DF0] bg-[#F6F8FB] hover:text-white rounded-xl hover:bg-[#7B4DFF] transition-colors shadow-sm" title="Ficha Técnica"><ClipboardDocumentListIcon className="w-4 h-4 stroke-2" /></button>
          
          {(canToggleActive || canDelete) && (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-500 bg-[#F6F8FB] hover:text-[#1F2937] rounded-xl hover:bg-slate-200 transition-colors shadow-sm">
                <EllipsisVerticalIcon className="w-4 h-4 stroke-2" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 mt-1 w-40 bg-white border border-[#EEF2F7] rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden fade-in text-left">
                  {canToggleActive && (
                    <button onClick={() => { setMenuOpen(false); setConfirmAction({ type: "toggle", user }); }} className="w-full px-4 py-3 text-xs font-bold text-[#1F2937] hover:bg-[#F6F8FB] hover:text-[#6A3DF0] flex items-center gap-3 transition-colors">
                      <PowerIcon className="w-4 h-4 stroke-2" /> {isActive ? "Dar de baja" : "Activar"}
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => { setMenuOpen(false); setConfirmAction({ type: "delete", user }); }} className="w-full px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors border-t border-[#EEF2F7]">
                      <TrashIcon className="w-4 h-4 stroke-2" /> Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {confirmAction?.type === "toggle" && confirmAction.user.id === user.id && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#1F2937]/40 backdrop-blur-sm z-[110] p-4 text-left fade-in">
            <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-sm w-full border border-[#EEF2F7]">
              <h3 className="font-extrabold text-xl text-[#1F2937] mb-2">{isActive ? "Dar de baja usuario" : "Activar usuario"}</h3>
              <p className="mb-8 text-slate-500 text-sm font-medium leading-relaxed">{isActive ? "¿Seguro que deseas dar de baja a este usuario? Perderá acceso a la plataforma." : "¿Seguro que deseas reactivar a este usuario?"}</p>
              <div className="flex gap-3 justify-end">
                <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-[#F6F8FB] transition" onClick={() => setConfirmAction(null)}>Cancelar</button>
                <button className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-md ${isActive ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30" : "bg-[#00A6A6] hover:bg-[#0FB5C9] shadow-[#00A6A6]/30"}`} onClick={() => { setConfirmAction(null); onSetActive(user.id, !isActive); }}>{isActive ? "Dar de baja" : "Activar"}</button>
              </div>
            </div>
          </div>
        )}
        
        {canDelete && confirmAction?.type === "delete" && confirmAction.user.id === user.id && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#1F2937]/40 backdrop-blur-sm z-[110] p-4 text-left fade-in">
            <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-sm w-full border border-[#EEF2F7]">
              <h3 className="font-extrabold text-xl text-rose-600 mb-2">¡Acción Irreversible!</h3>
              <p className="mb-8 text-slate-500 text-sm font-medium leading-relaxed">¿Seguro que deseas eliminar este usuario? <br/><br/>Se recomienda usar <strong>Baja</strong> para conservar su historial intacto.</p>
              <div className="flex flex-col gap-3">
                <button className="w-full px-5 py-3 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition" onClick={() => { setConfirmAction(null); onDelete(user.id); }}>Eliminar permanentemente</button>
                <button className="w-full px-5 py-3 rounded-xl text-sm font-bold text-slate-600 bg-[#F6F8FB] hover:bg-slate-200 transition" onClick={() => setConfirmAction(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}