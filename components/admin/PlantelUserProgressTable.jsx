"use client";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

function getUserProgress(u, stepMeta) {
  const userKeys = stepMeta.filter(s => !s.adminUploadOnly && !s.isPlantelSelection).map(s => s.key);
  const checklist = (u.checklistItems || []).filter(i => userKeys.includes(i.type));
  const done = checklist.filter(i => i.fulfilled).length;
  return { done, total: userKeys.length, pct: userKeys.length ? done / userKeys.length : 0, complete: done === userKeys.length };
}

function getAdminProgress(u) {
  return !!((u.documents || []).find(d => d.type === "proyectivos" && d.status === "ACCEPTED"));
}

export default function PlantelUserProgressTable({ users, stepMeta }) {
  return (
    <div className="overflow-x-auto border-t border-slate-100 bg-slate-50">
      <table className="min-w-[600px] w-full table-auto text-xs md:text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
            <th className="px-3 py-2 text-left font-semibold">Foto</th>
            <th className="px-3 py-2 text-left font-semibold">Nombre</th>
            <th className="px-3 py-2 text-left font-semibold">Rol</th>
            <th className="px-3 py-2 text-left font-semibold">Docs usuario</th>
            <th className="px-3 py-2 text-center font-semibold">Proyectivos</th>
            <th className="px-3 py-2 text-center font-semibold">Expediente</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            const up = getUserProgress(u, stepMeta);
            const adminDone = getAdminProgress(u);
            const fully = up.complete && adminDone;
            return (
              <tr key={u.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-3 py-2">
                  <img 
                    src={u.picture || "/IMAGOTIPO-IECS-IEDIS.png"} 
                    width={32} 
                    height={32} 
                    alt="" 
                    className="rounded-full border border-slate-200 bg-white object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = "/IMAGOTIPO-IECS-IEDIS.png"; }}
                  />
                </td>
                <td className="px-3 py-2 font-medium text-slate-900">
                  {u.name}
                  <div className="text-[11px] text-slate-500 font-normal">{u.email}</div>
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-md font-medium text-[10px] border ${
                    u.role === "employee" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-indigo-50 text-indigo-700 border-indigo-200"
                  }`}>
                    {u.role === "employee" ? "Empleado" : "Candidato"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${up.complete ? "bg-emerald-500" : "bg-indigo-400"}`} style={{width: `${Math.round(up.pct*100)}%`}} />
                    </div>
                    <span className="font-medium text-slate-600 text-[11px]">{up.done}/{up.total}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-center">
                  {adminDone
                    ? <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium"><CheckCircleIcon className="w-3 h-3" />Entregados</span>
                    : <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium"><ClockIcon className="w-3 h-3" />Falta</span>
                  }
                </td>
                <td className="px-3 py-2 text-center">
                  {fully
                    ? <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium"><CheckCircleIcon className="w-3 h-3" />Completo</span>
                    : <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium"><XCircleIcon className="w-3 h-3" />En proceso</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}