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
    <tr className={`group border-b border-[#EEF2F7] transition-all duration-300 ${selected ? "bg-[#F6F8FB]" : "bg-white hover:bg-[#F6F8FB] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.06)] relative z-0 hover:z-10"} ${!isActive ? "opacity-60 grayscale-[0.6]" : ""}`} onMouseLeave={() => setMenuOpen(false)}>
      <td className="py-5 text-center pl-2">
        <input type="checkbox" checked={selected} onChange={e => onSelect(e.target.checked)} className="accent-[#6A3DF0] w-5 h-5 rounded border-slate-300 cursor-pointer transition-transform hover:scale-110" />
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-5">
          <img src={user.picture || "/IMAGOTIPO-IECS-IEDIS.png"} alt="" className="w-12 h-12 rounded-full object-cover border-[3px] border-white shadow-md shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = "/IMAGOTIPO-IECS-IEDIS.png"; }} />
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-base text-[#1F2937] truncate leading-tight mb-0.5">{user.name}</span>
            <span className="text-sm text-slate-500 font-medium truncate">{user.email}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        {canAssignPlantel ? (
          <div className="relative w-full max-w-[240px]">
            <select
              className="w-full rounded-xl border border-[#EEF2F7] px-4 py-3 text-sm bg-[#F6F8FB] hover:bg-white focus:bg-white focus:ring-2 focus:ring-[#00A6A6]/30 outline-none text-[#1F2937] font-bold transition-all cursor-pointer appearance-none"
              value={user.plantelId || ""}
              onChange={e => onAssignPlantel(user.id, e.target.value)}
              disabled={!isActive || (role === "admin" && !canAdminAssignTo(Number(e.target.value)))}
            >
              <option value="">Asignar plantel...</option>
              {planteles.map(p => <option key={p.id} value={p.id} disabled={role === "admin" && !canAdminAssignTo(p.id)}>{p.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>
        ) : (
          <span className="text-sm text-[#1F2937] font-bold bg-[#F6F8FB] px-4 py-2.5 rounded-xl border border-[#EEF2F7]">
            {planteles.find(p => String(p.id) === String(user.plantelId))?.name || <span className="text-slate-400 italic font-medium">Sin plantel asignado</span>}
          </span>
        )}
      </td>
      <td className="px-6 py-5">
        {isActive ? (
          <span className="inline-flex items-center px-4 py-1.5 rounded-lg bg-emerald-50 text-[#00A6A6] text-xs font-extrabold ring-1 ring-inset ring-[#00A6A6]/20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A6A6] mr-2"></span> Activo
          </span>
        ) : (
          <span className="inline-flex items-center px-4 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-extrabold ring-1 ring-inset ring-slate-300/50 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2"></span> Baja
          </span>
        )}
      </td>
      <td className="px-6 py-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between w-full pr-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Digital</span>
            <span className="text-sm font-extrabold text-[#1F2937]">{progress.pct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#EEF2F7] overflow-hidden shadow-inner mr-4">
            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${progress.pct === 100 ? "bg-[#00A6A6] shadow-[0_0_8px_rgba(0,166,166,0.6)]" : "bg-[#6A3DF0]"}`} style={{ width: `${progress.pct}%` }} />
          </div>
        </div>
      </td>
      <td className="px-6 py-5 text-right relative pr-6">
        <div className="flex items-center justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={() => onDocs(user)} className="p-2.5 text-[#00A6A6] bg-[#F6F8FB] hover:text-white rounded-xl hover:bg-[#00A6A6] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5" title="Revisar Documentos"><EyeIcon className="w-5 h-5 stroke-2" /></button>
          <button onClick={() => onFichaTecnica(user)} className="p-2.5 text-[#6A3DF0] bg-[#F6F8FB] hover:text-white rounded-xl hover:bg-[#6A3DF0] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5" title="Ficha Técnica y Expediente"><ClipboardDocumentListIcon className="w-5 h-5 stroke-2" /></button>
          
          {(canToggleActive || canDelete) && (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2.5 text-slate-500 bg-[#F6F8FB] hover:text-[#1F2937] rounded-xl hover:bg-slate-200 transition-all shadow-sm hover:shadow-md">
                <EllipsisVerticalIcon className="w-5 h-5 stroke-2" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 mt-2 w-48 bg-white border border-[#EEF2F7] rounded-xl shadow-[0_16px_40px_-10px_rgba(0,0,0,0.15)] z-50 overflow-hidden fade-in text-left">
                  {canToggleActive && (
                    <button onClick={() => { setMenuOpen(false); setConfirmAction({ type: "toggle", user }); }} className="w-full px-5 py-4 text-sm font-bold text-[#1F2937] hover:bg-[#F6F8FB] hover:text-[#6A3DF0] flex items-center gap-3 transition-colors">
                      <PowerIcon className="w-5 h-5 stroke-2" /> {isActive ? "Dar de baja" : "Reactivar"}
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => { setMenuOpen(false); setConfirmAction({ type: "delete", user }); }} className="w-full px-5 py-4 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors border-t border-[#EEF2F7]">
                      <TrashIcon className="w-5 h-5 stroke-2" /> Eliminar Perfil
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {confirmAction?.type === "toggle" && confirmAction.user.id === user.id && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#1F2937]/50 backdrop-blur-md z-[110] p-4 text-left fade-in">
            <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full border border-[#EEF2F7]">
              <h3 className="font-extrabold text-2xl text-[#1F2937] mb-3">{isActive ? "Dar de baja a colaborador" : "Reactivar colaborador"}</h3>
              <p className="mb-10 text-slate-500 text-base font-medium leading-relaxed">{isActive ? `¿Estás seguro que deseas dar de baja a ${user.name}? Se revocará su acceso al Workspace Operativo.` : `¿Deseas reactivar el acceso de ${user.name}?`}</p>
              <div className="flex gap-4 justify-end">
                <button className="px-6 py-3.5 rounded-xl text-base font-bold text-slate-500 hover:text-[#1F2937] hover:bg-[#F6F8FB] transition-all" onClick={() => setConfirmAction(null)}>Cancelar</button>
                <button className={`px-6 py-3.5 rounded-xl text-base font-extrabold text-white transition-all shadow-lg hover:-translate-y-0.5 ${isActive ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30" : "bg-[#00A6A6] hover:bg-[#0FB5C9] shadow-[#00A6A6]/30"}`} onClick={() => { setConfirmAction(null); onSetActive(user.id, !isActive); }}>{isActive ? "Confirmar Baja" : "Activar Acceso"}</button>
              </div>
            </div>
          </div>
        )}
        
        {canDelete && confirmAction?.type === "delete" && confirmAction.user.id === user.id && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#1F2937]/50 backdrop-blur-md z-[110] p-4 text-left fade-in">
            <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full border border-[#EEF2F7]">
              <h3 className="font-extrabold text-2xl text-rose-600 mb-3 flex items-center gap-3"><TrashIcon className="w-8 h-8"/> Acción Irreversible</h3>
              <p className="mb-10 text-slate-500 text-base font-medium leading-relaxed">Estás a punto de eliminar a <strong>{user.name}</strong> y todos sus documentos.<br/><br/>Se recomienda usar <strong>Baja</strong> para conservar el historial intacto.</p>
              <div className="flex flex-col gap-4">
                <button className="w-full px-6 py-4 rounded-xl text-base font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/30 transition-all hover:-translate-y-0.5" onClick={() => { setConfirmAction(null); onDelete(user.id); }}>Eliminar Permanentemente</button>
                <button className="w-full px-6 py-4 rounded-xl text-base font-bold text-slate-600 bg-[#F6F8FB] hover:bg-[#EEF2F7] hover:text-[#1F2937] transition-all" onClick={() => setConfirmAction(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}