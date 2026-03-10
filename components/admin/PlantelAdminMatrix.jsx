"use client";
import { useState, useEffect, useMemo } from "react";
import { ChevronDownIcon, ChevronUpIcon, UserIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function PlantelAdminMatrix({ planteles, admins }) {
  const [expanded, setExpanded] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAllPlanteles() {
      const promises = planteles.map(async (p) => {
        setLoading(s => ({ ...s, [p.id]: true }));
        setError(e => ({ ...e, [p.id]: "" }));
        try {
          const res = await fetch(`/api/admin/planteles/${p.id}/users/progress`);
          if (!res.ok) throw new Error((await res.text()).slice(0,120));
          const d = await res.json();
          setData(dat => ({ ...dat, [p.id]: d.users }));
        } catch (e) {
          setError(err => ({ ...err, [p.id]: e.message || "Error" }));
        }
        setLoading(s => ({ ...s, [p.id]: false }));
      });
      await Promise.all(promises);
    }
    fetchAllPlanteles();
  }, [planteles.map(p => p.id).join(",")]);

  function handleExpand(pid) {
    setExpanded(expanded === pid ? null : pid);
  }

  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setSearch(searchInput), 220);
    return () => clearTimeout(handler);
  }, [searchInput]);

  return (
    <div id="plantel-admin-matrix" className="w-full bg-white border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] rounded-xl p-5 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <h2 className="text-base font-semibold flex items-center gap-2 text-slate-900">
          <UserIcon className="w-5 h-5 text-slate-400" />
          Auditoría de Expedientes por Plantel
        </h2>
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            aria-label="Buscar empleado"
            type="text"
            className="w-full rounded-lg pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            placeholder="Buscar por nombre o correo..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        {planteles.map((p) => {
          let users = data[p.id] || [];
          let hasMatch = true;
          if (search && Array.isArray(users)) {
            hasMatch = users.some(
              u =>
                (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
                (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
            );
          }
          if (search && !hasMatch) return null;
          return (
            <div key={p.id} className="border border-slate-200/80 rounded-xl overflow-hidden bg-white transition-shadow hover:shadow-sm">
              <button
                className="flex flex-row items-center justify-between w-full px-4 py-3 sm:px-5 sm:py-3.5 font-medium text-slate-800 text-sm focus:outline-none hover:bg-slate-50/50 transition-colors"
                onClick={() => handleExpand(p.id)}
                aria-expanded={expanded === p.id}
                aria-controls={`plantel-expand-${p.id}`}
                type="button"
              >
                <span>{p.name}</span>
                <span className="flex items-center gap-2 sm:gap-4">
                  <PlantelSummaryBar users={users} loading={loading[p.id]} />
                  {expanded === p.id
                    ? <ChevronUpIcon className="w-4 h-4 text-slate-400" />
                    : <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                  }
                </span>
              </button>
              
              <div id={`plantel-expand-${p.id}`} className={expanded === p.id ? "block" : "hidden"}>
                <div className="p-0 border-t border-slate-100">
                  {loading[p.id] && <div className="p-6 text-center text-slate-500 font-medium text-sm">Cargando datos...</div>}
                  {error[p.id] && <div className="p-4 text-rose-600 font-medium bg-rose-50 text-sm">{error[p.id]}</div>}
                  {users && !loading[p.id] && <PlantelEmployeeProgressTable users={users} search={search} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlantelSummaryBar({ users = [], loading }) {
  if (loading === true || !Array.isArray(users)) {
    return <span className="text-[11px] font-medium text-slate-400 animate-pulse">Calculando...</span>;
  }
  const userTotal = users.length;
  const userDoneCount = users.filter(u => u.userProgress.complete).length;

  return (
    <span className="flex flex-row gap-3 items-center">
      <span className="text-[11px] text-slate-500 font-medium">{userTotal} reg.</span>
      <div className="hidden sm:block w-20 h-1.5 rounded-full bg-slate-100 relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full bg-slate-900 rounded-full transition-all"
          style={{width: `${userTotal ? Math.round((userDoneCount/userTotal)*100) : 0}%`}} />
      </div>
      <span className="text-[11px] text-slate-700 font-medium">{userDoneCount}/{userTotal} validados</span>
    </span>
  );
}

import { CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline";

function PlantelEmployeeProgressTable({ users, search }) {
  const filteredUsers = useMemo(() => {
    if (!search) return users;
    return users.filter(
      u =>
        (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [users, search]);
  const col1Width = "220px";
  return (
    <div className="relative w-full overflow-x-auto bg-slate-50/50">
      <table className="min-w-full table-auto text-[11px] md:text-xs">
        <thead>
          <tr className="bg-slate-100/50 border-b border-slate-200/60 uppercase tracking-wider text-slate-500">
            <th
              className="sticky top-0 left-0 z-30 bg-slate-100/80 backdrop-blur-sm border-r border-slate-200/60 font-medium px-4 py-2.5 text-left"
              style={{minWidth:col1Width, maxWidth:col1Width, width:col1Width}}
            >Colaborador</th>
            <th className="px-4 py-2.5 font-medium text-left">Rol</th>
            <th className="px-4 py-2.5 font-medium text-left">Documentos</th>
            <th className="px-4 py-2.5 font-medium text-center">Proyectivos</th>
            <th className="px-4 py-2.5 font-medium text-center">Estatus Global</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-slate-500 py-6 bg-white font-medium text-sm">Sin usuarios encontrados.</td>
            </tr>
          )}
          {filteredUsers.map(u => (
            <tr key={u.id} className="border-b border-slate-100/60 hover:bg-slate-50 transition-colors bg-white">
              <td
                className="sticky left-0 bg-white z-20 border-r border-slate-200/60 flex flex-row gap-3 items-center px-4 py-2"
                style={{ minWidth: col1Width, maxWidth: col1Width, width: col1Width }}
              >
                <img 
                  src={u.picture || "/IMAGOTIPO-IECS-IEDIS.png"} 
                  width={28} 
                  height={28} 
                  alt="" 
                  className="rounded-full bg-slate-50 border border-slate-200 object-cover shrink-0" 
                  onError={(e) => { e.target.onerror = null; e.target.src = "/IMAGOTIPO-IECS-IEDIS.png"; }}
                />
                <div className="min-w-0 w-full">
                  <div className="font-medium text-slate-900 truncate text-xs">{u.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{u.email}</div>
                </div>
              </td>
              <td className="px-4 py-2">
                <span className={`inline-flex px-2 py-0.5 rounded-md font-medium text-[10px] ring-1 ring-inset ${
                  u.role === "employee" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10" : "bg-slate-50 text-slate-700 ring-slate-500/10"
                }`}>{u.role === "employee" ? "Empleado" : "Candidato"}</span>
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className={`h-full transition-all ${u.userProgress.pct === 100 ? "bg-emerald-500" : "bg-slate-800"}`}
                      style={{width: `${u.userProgress.pct}%`}} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">{u.userProgress.done}/{u.userProgress.total}</span>
                </div>
              </td>
              <td className="px-4 py-2 text-center">
                {u.adminProgress.proyectivosUploaded
                  ? <span className="inline-flex items-center gap-1 text-[10px] font-medium rounded-md bg-emerald-50 ring-1 ring-inset ring-emerald-600/10 px-1.5 py-0.5 text-emerald-700"><CheckCircleIcon className="w-3 h-3" />Entregados</span>
                  : <span className="inline-flex items-center gap-1 text-[10px] font-medium rounded-md bg-amber-50 ring-1 ring-inset ring-amber-600/10 px-1.5 py-0.5 text-amber-700"><ClockIcon className="w-3 h-3" />Falta</span>
                }
              </td>
              <td className="px-4 py-2 text-center">
                {u.fullyCompleted
                  ? <span className="inline-flex items-center gap-1 text-[10px] font-medium rounded-md bg-emerald-50 ring-1 ring-inset ring-emerald-600/10 px-1.5 py-0.5 text-emerald-700"><CheckCircleIcon className="w-3 h-3" />Completo</span>
                  : <span className="inline-flex items-center gap-1 text-[10px] font-medium rounded-md bg-slate-50 ring-1 ring-inset ring-slate-500/10 px-1.5 py-0.5 text-slate-600"><XCircleIcon className="w-3 h-3" />En proceso</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}