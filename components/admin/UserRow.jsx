"use client";
import { useState } from "react";
import { CheckCircleIcon, EyeIcon, ClipboardDocumentListIcon, TrashIcon, PowerIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function UserRow({
  user,
  planteles,
  adminsPlanteles,
  role,
  selected,
  canAssignPlantel,
  onSelect,
  onAssignPlantel,
  onDocs,
  onFichaTecnica,
  onSetActive,
  onDelete,
  getUserChecklistProgress: customChecklistProgress
}) {
  const [confirmAction, setConfirmAction] = useState(null);

  const isActive = !!user.isActive;
  function canAdminAssignTo(pid) {
    return role === "superadmin" || adminsPlanteles.includes(pid);
  }
  const canDelete = role === "superadmin" && typeof onDelete === "function" && user.id !== undefined;

  let statusBadge =
    isActive
      ? <span className="inline-block px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">Activo</span>
      : <span className="inline-block px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium">Baja</span>;

  const canToggleActive = role === "superadmin" ||
    (role === "admin" && user.plantelId && adminsPlanteles.includes(user.plantelId) && user.id !== undefined);

  const progress = (customChecklistProgress)(user);

  return (
    <tr className={`border-b border-slate-100 hover:bg-slate-50 transition ${selected ? "bg-indigo-50/50 hover:bg-indigo-50" : ""} ${!isActive ? "opacity-60 bg-slate-50" : ""}`}>
      <td className="text-center px-3 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelect(e.target.checked)}
          className="accent-indigo-600 w-4 h-4 rounded border-slate-300"
          aria-label="Seleccionar usuario"
        />
      </td>
      <td className="px-3 py-3 flex flex-row gap-3 items-center">
        <Image
          src={user.picture || "/IMAGOTIPO-IECS-IEDIS.png"}
          width={36}
          height={36}
          alt=""
          className="rounded-full object-cover bg-white border border-slate-200 shadow-sm shrink-0"
        />
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 truncate">{user.name}</div>
          <div className="text-xs text-slate-500 truncate">{user.email}</div>
          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium mt-1 border ${
            user.role === "employee"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-indigo-50 text-indigo-700 border-indigo-200"
          }`}>{user.role === "employee" ? "Empleado" : "Candidato"}</span>
        </div>
      </td>
      <td className="px-3 py-3">
        {canAssignPlantel ? (
          <select
            className="rounded-md border border-slate-300 px-2 py-1.5 text-xs bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full max-w-[160px]"
            value={user.plantelId || ""}
            onChange={e => onAssignPlantel(user.id, e.target.value)}
            disabled={!isActive || (role === "admin" && !canAdminAssignTo(Number(e.target.value)))}
          >
            <option value="">Sin plantel</option>
            {planteles.map(p => (
              <option
                key={p.id}
                value={p.id}
                disabled={role === "admin" && !canAdminAssignTo(p.id)}
              >{p.name}</option>
            ))}
          </select>
        ) : (
          <span className="text-sm text-slate-700 font-medium">
            {planteles.find(p => String(p.id) === String(user.plantelId))?.name ||
              <span className="text-slate-400 italic font-normal">Sin plantel</span>}
          </span>
        )}
      </td>
      <td className="px-3 py-3">
        {statusBadge}
      </td>
      <td className="px-3 py-3 min-w-[150px] align-middle">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative min-w-[72px] max-w-[120px]">
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  progress.pct >= 100 ? "bg-emerald-500" : progress.pct > 50 ? "bg-indigo-500" : "bg-amber-400"
                }`}
                style={{ width: `${progress.pct}%` }}
              ></div>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-600">{progress.done}/{progress.total}</span>
          {progress.pct === 100
            ? <span className="ml-2 text-emerald-600 flex items-center gap-1 text-[11px] font-medium"><CheckCircleIcon className="w-3.5 h-3.5" />Listo</span>
            : <span className="ml-2 text-slate-500 text-[11px] font-medium">En proceso</span>
          }
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-row gap-1 items-center">
          <button
            className="p-1.5 rounded-md transition text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
            onClick={() => onDocs(user)}
            aria-label="Ver documentos"
            disabled={!isActive}
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            className="p-1.5 rounded-md transition text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
            onClick={() => onFichaTecnica(user)}
            aria-label="Abrir ficha técnica"
            disabled={!isActive}
          >
            <ClipboardDocumentListIcon className="w-5 h-5" />
          </button>
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-row flex-wrap gap-2 items-center justify-center min-w-[120px]">
          {canToggleActive && (
            isActive ? (
              <button
                title="Dar de baja"
                className="inline-flex min-w-[90px] justify-center items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-[11px] font-medium shadow-sm transition-shadow focus:outline-none"
                onClick={() => setConfirmAction({ type: "toggle", user })}
                aria-label="Dar de baja"
              >
                <PowerIcon className="w-4 h-4 text-slate-400" />
                Baja
              </button>
            ) : (
              <button
                title="Activar"
                className="inline-flex min-w-[90px] justify-center items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium shadow-sm transition-colors focus:outline-none"
                onClick={() => setConfirmAction({ type: "toggle", user })}
                aria-label="Activar"
              >
                <CheckCircleIcon className="w-4 h-4 text-emerald-100" />
                Activar
              </button>
            )
          )}
          {canDelete && (
            <button
              title="Eliminar usuario (NO recomendado)"
              className="inline-flex min-w-[90px] justify-center items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-red-200 text-red-600 text-[11px] font-medium shadow-sm transition-colors hover:bg-red-50 focus:outline-none opacity-60 hover:opacity-100"
              onClick={() => setConfirmAction({ type: "delete", user })}
              aria-label="Eliminar usuario"
            >
              <TrashIcon className="w-4 h-4" /> Eliminar
            </button>
          )}
          
          {confirmAction?.type === "toggle" && confirmAction.user.id === user.id && (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 p-4">
              <div className="bg-white shadow-xl rounded-xl p-6 max-w-sm w-full text-center border border-slate-100">
                <p className="mb-5 text-slate-900 font-medium">
                  {isActive
                    ? "¿Seguro que deseas dar de baja a este usuario? No podrá acceder a la plataforma."
                    : "¿Seguro que deseas activar a este usuario?"}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    className="px-5 py-2 rounded-md bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                    onClick={() => setConfirmAction(null)}
                  >Cancelar</button>
                  <button
                    className={`px-5 py-2 rounded-md font-medium text-white transition ${isActive ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                    onClick={() => { setConfirmAction(null); onSetActive(user.id, !isActive); }}
                  >
                    {isActive ? "Dar de baja" : "Activar"}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {canDelete && confirmAction?.type === "delete" && confirmAction.user.id === user.id && (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 p-4">
              <div className="bg-white shadow-xl rounded-xl p-6 max-w-sm w-full text-center border-t-4 border-red-500">
                <p className="mb-5 text-slate-900">
                  <span className="block text-red-600 font-bold text-lg mb-2">¡Acción IRREVERSIBLE!</span>
                  ¿Seguro que deseas eliminar este usuario?
                  <br /><br />
                  <span className="text-slate-500 text-sm block mb-1">NO recomendado. Sugerimos usar "Baja" para conservar su historial documental.</span>
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    className="px-5 py-2 rounded-md bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                    onClick={() => setConfirmAction(null)}
                  >Cancelar</button>
                  <button
                    className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition"
                    onClick={() => { setConfirmAction(null); if (typeof onDelete === "function") onDelete(user.id); }}
                  >Eliminar permanentemente</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}