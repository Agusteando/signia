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
    <div id="plantel-admin-matrix" className="w-full bg-white border border-[#EEF2F7] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] rounded-3xl p-8 mb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
        <h2 className="text-xl font-extrabold flex items-center gap-4 text-[#1F2937] tracking-tight">
          <div className="p-3 rounded-2xl bg-[#F6F8FB] text-[#6A3DF0]">
            <UserIcon className="w-7 h-7 stroke-2" />
          </div>
          Auditoría Operativa por Plantel
        </h2>
        <div className="relative w-full sm:max-w-md">
          <MagnifyingGlassIcon className="w-6 h-6 text-[#00A6A6] absolute left-5 top-1/2 -translate-y-1/2" />
          <input
            aria-label="Buscar empleado"
            type="text"
            className="w-full rounded-2xl pl-14 pr-5 py-4 bg-[#F6F8FB] border border-[#EEF2F7] placeholder-slate-400 text-sm font-bold text-[#1F2937] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6] transition-all"
            placeholder="Buscar por nombre o correo..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-5">
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
            <div key={p.id} className="border border-[#EEF2F7] rounded-3xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-lg group">
              <button
                className="flex flex-row items-center justify-between w-full px-8 py-6 font-extrabold text-[#1F2937] focus:outline-none hover:bg-[#F6F8FB] transition-colors"
                onClick={() => handleExpand(p.id)}
                aria-expanded={expanded === p.id}
                aria-controls={`plantel-expand-${p.id}`}
                type="button"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-2.5 h-12 rounded-full transition-all duration-500 ${expanded === p.id ? 'bg-[#6A3DF0]' : 'bg-[#00A6A6] opacity-70 group-hover:opacity-100 group-hover:scale-y-110'}`}></div>
                  <span className="text-xl tracking-tight">{p.name}</span>
                </div>
                <span className="flex items-center gap-6">
                  {users && users.length > 0 && (
                    <div className="hidden lg:flex items-center -space-x-4 mr-6">
                      {users.slice(0, 5).filter(u => u.picture).map(u => (
                        <img key={u.id} src={u.picture} className="w-12 h-12 rounded-full border-[3px] border-white shadow-sm object-cover bg-white relative hover:z-20 hover:scale-110 transition-transform" />
                      ))}
                      {users.length > 5 && (
                         <div className="w-12 h-12 rounded-full border-[3px] border-white bg-[#F6F8FB] flex items-center justify-center text-xs font-extrabold text-[#004C4C] z-10 shadow-sm">
                           +{users.length - 5}
                         </div>
                      )}
                    </div>
                  )}
                  <PlantelSummaryBar users={users} loading={loading[p.id]} />
                  <div className={`p-3 rounded-2xl transition-all duration-300 ${expanded === p.id ? 'bg-[#6A3DF0] text-white shadow-lg shadow-[#6A3DF0]/30' : 'bg-[#F6F8FB] text-[#1F2937] group-hover:bg-white group-hover:shadow-md'}`}>
                    {expanded === p.id
                      ? <ChevronUpIcon className="w-6 h-6 stroke-2" />
                      : <ChevronDownIcon className="w-6 h-6 stroke-2" />
                    }
                  </div>
                </span>
              </button>
              
              <div id={`plantel-expand-${p.id}`} className={expanded === p.id ? "block" : "hidden"}>
                <div className="p-0 border-t border-[#EEF2F7]">
                  {loading[p.id] && <div className="p-12 text-center text-[#00A6A6] font-extrabold text-base animate-pulse">Analizando densidad de expedientes...</div>}
                  {error[p.id] && <div className="p-8 text-rose-600 font-bold bg-rose-50 text-base border-b border-rose-100">{error[p.id]}</div>}
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
    return <span className="text-xs font-extrabold text-slate-400 animate-pulse uppercase tracking-widest mr-4">Calculando...</span>;
  }
  const userTotal = users.length;
  const userDoneCount = users.filter(u => u.userProgress.complete).length;
  const pct = userTotal ? Math.round((userDoneCount/userTotal)*100) : 0;

  return (
    <span className="flex flex-row gap-6 items-center mr-4">
      <div className="flex flex-col items-end">
        <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest mb-0.5">Completitud</span>
        <span className="text-lg font-black text-[#1F2937] leading-none">{userDoneCount} <span className="text-slate-400 font-semibold text-base">/ {userTotal}</span></span>
      </div>
      <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-full border-4 border-[#EEF2F7] relative bg-[#F6F8FB] shadow-inner">
         <svg className="absolute inset-0 w-full h-full transform -rotate-90">
           <circle cx="24" cy="24" r="20" fill="transparent" stroke="transparent" strokeWidth="4" className="text-[#EEF2F7]" />
           <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * pct / 100)} className={`${pct === 100 ? 'text-[#00A6A6]' : 'text-[#6A3DF0]'} transition-all duration-1000 ease-out`} />
         </svg>
         <span className={`text-xs font-black z-10 ${pct === 100 ? 'text-[#00A6A6]' : 'text-[#6A3DF0]'}`}>{pct}%</span>
      </div>
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
  const col1Width = "320px";
  return (
    <div className="relative w-full overflow-x-auto bg-[#F6F8FB]/30">
      <table className="min-w-full table-auto text-sm border-collapse">
        <thead>
          <tr className="bg-[#F6F8FB] border-b border-[#EEF2F7] uppercase tracking-widest text-slate-400 text-[11px] font-extrabold">
            <th
              className="sticky top-0 left-0 z-30 bg-[#F6F8FB]/90 backdrop-blur-xl border-r border-[#EEF2F7] px-8 py-5 text-left"
              style={{minWidth:col1Width, maxWidth:col1Width, width:col1Width}}
            >Identidad de Colaborador</th>
            <th className="px-8 py-5 text-left">Rol Oficial</th>
            <th className="px-8 py-5 text-left">Expediente Base</th>
            <th className="px-8 py-5 text-center">Filtro Proyectivos</th>
            <th className="px-8 py-5 text-center">Status Final</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-slate-500 py-12 bg-white font-bold text-base">Sin colaboradores encontrados en este plantel.</td>
            </tr>
          )}
          {filteredUsers.map(u => (
            <tr key={u.id} className="border-b border-[#EEF2F7] hover:bg-white transition-colors bg-transparent group">
              <td
                className="sticky left-0 bg-transparent group-hover:bg-white z-20 border-r border-[#EEF2F7] flex flex-row gap-5 items-center px-8 py-4 transition-colors"
                style={{ minWidth: col1Width, maxWidth: col1Width, width: col1Width }}
              >
                <img 
                  src={u.picture || "/IMAGOTIPO-IECS-IEDIS.png"} 
                  width={44} 
                  height={44} 
                  alt="" 
                  className="rounded-full bg-white border-2 border-white shadow-md object-cover shrink-0" 
                  onError={(e) => { e.target.onerror = null; e.target.src = "/IMAGOTIPO-IECS-IEDIS.png"; }}
                />
                <div className="min-w-0 w-full">
                  <div className="font-extrabold text-[#1F2937] truncate text-base leading-tight">{u.name}</div>
                  <div className="text-xs text-slate-500 truncate mt-1 font-medium">{u.email}</div>
                </div>
              </td>
              <td className="px-8 py-4">
                <span className={`inline-flex px-4 py-1.5 rounded-xl font-extrabold text-xs ring-1 ring-inset shadow-sm ${
                  u.role === "employee" ? "bg-emerald-50 text-[#00A6A6] ring-[#00A6A6]/20" : "bg-[#F6F8FB] text-[#6A3DF0] ring-[#6A3DF0]/20"
                }`}>{u.role === "employee" ? "Empleado" : "Candidato"}</span>
              </td>
              <td className="px-8 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-2.5 bg-[#EEF2F7] rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full transition-all duration-700 ${u.userProgress.pct === 100 ? "bg-[#00A6A6]" : "bg-[#6A3DF0]"}`}
                      style={{width: `${u.userProgress.pct}%`}} />
                  </div>
                  <span className="text-xs font-black text-[#1F2937]">{u.userProgress.done}<span className="text-slate-400 font-bold">/{u.userProgress.total}</span></span>
                </div>
              </td>
              <td className="px-8 py-4 text-center">
                {u.adminProgress.proyectivosUploaded
                  ? <span className="inline-flex items-center gap-2 text-xs font-extrabold rounded-xl bg-emerald-50 ring-1 ring-inset ring-[#00A6A6]/20 px-3.5 py-1.5 text-[#00A6A6]"><CheckCircleIcon className="w-5 h-5 stroke-2" />Validado</span>
                  : <span className="inline-flex items-center gap-2 text-xs font-extrabold rounded-xl bg-amber-50 ring-1 ring-inset ring-amber-500/20 px-3.5 py-1.5 text-amber-600"><ClockIcon className="w-5 h-5 stroke-2" />Pendiente</span>
                }
              </td>
              <td className="px-8 py-4 text-center">
                {u.fullyCompleted
                  ? <span className="inline-flex items-center gap-2 text-xs font-black rounded-xl bg-gradient-to-r from-[#00A6A6] to-[#0FB5C9] px-4 py-1.5 text-white shadow-md shadow-[#00A6A6]/20"><CheckCircleIcon className="w-5 h-5 stroke-2" />Autorizado</span>
                  : <span className="inline-flex items-center gap-2 text-xs font-extrabold rounded-xl bg-[#F6F8FB] ring-1 ring-inset ring-slate-300/50 px-4 py-1.5 text-slate-500 shadow-sm"><XCircleIcon className="w-5 h-5 stroke-2" />En Proceso</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}