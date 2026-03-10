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
    <div id="plantel-admin-matrix" className="w-full bg-white border border-[#EEF2F7] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] rounded-2xl p-7 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-8">
        <h2 className="text-lg font-extrabold flex items-center gap-3 text-[#1F2937] tracking-tight">
          <div className="p-2.5 rounded-xl bg-[#F6F8FB] text-[#6A3DF0]">
            <UserIcon className="w-6 h-6 stroke-2" />
          </div>
          Auditoría de Expedientes por Plantel
        </h2>
        <div className="relative w-full sm:max-w-sm">
          <MagnifyingGlassIcon className="w-5 h-5 text-[#00A6A6] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            aria-label="Buscar empleado"
            type="text"
            className="w-full rounded-xl pl-11 pr-4 py-3 bg-[#F6F8FB] border border-[#EEF2F7] placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6] transition-all"
            placeholder="Buscar por nombre o correo..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
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
            <div key={p.id} className="border border-[#EEF2F7] rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-md group">
              <button
                className="flex flex-row items-center justify-between w-full px-6 py-5 font-extrabold text-[#1F2937] text-base focus:outline-none hover:bg-[#F6F8FB] transition-colors"
                onClick={() => handleExpand(p.id)}
                aria-expanded={expanded === p.id}
                aria-controls={`plantel-expand-${p.id}`}
                type="button"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full transition-all duration-300 ${expanded === p.id ? 'bg-[#6A3DF0]' : 'bg-[#00A6A6] opacity-70 group-hover:opacity-100'}`}></div>
                  <span className="text-lg tracking-tight">{p.name}</span>
                </div>
                <span className="flex items-center gap-5">
                  {users && users.length > 0 && (
                    <div className="hidden lg:flex items-center -space-x-3 mr-4">
                      {users.slice(0, 5).filter(u => u.picture).map((u, i) => (
                        <img 
                          key={u.id} 
                          src={u.picture} 
                          className={`w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover bg-white hover:z-50 hover:!scale-125 transition-transform bubble-float-subtle-${i % 2}`} 
                        />
                      ))}
                      {users.length > 5 && (
                         <div className="w-10 h-10 rounded-full border-2 border-white bg-[#F6F8FB] flex items-center justify-center text-[11px] font-extrabold text-[#004C4C] z-10 shadow-sm">
                           +{users.length - 5}
                         </div>
                      )}
                    </div>
                  )}
                  <PlantelSummaryBar users={users} loading={loading[p.id]} />
                  <div className={`p-2 rounded-xl transition-all duration-300 ${expanded === p.id ? 'bg-[#6A3DF0] text-white shadow-md shadow-[#6A3DF0]/30' : 'bg-[#F6F8FB] text-[#1F2937] group-hover:bg-white group-hover:shadow-sm'}`}>
                    {expanded === p.id
                      ? <ChevronUpIcon className="w-5 h-5 stroke-2" />
                      : <ChevronDownIcon className="w-5 h-5 stroke-2" />
                    }
                  </div>
                </span>
              </button>
              
              <div id={`plantel-expand-${p.id}`} className={expanded === p.id ? "block" : "hidden"}>
                <div className="p-0 border-t border-[#EEF2F7]">
                  {loading[p.id] && <div className="p-8 text-center text-[#00A6A6] font-bold text-sm animate-pulse">Analizando densidad de expedientes...</div>}
                  {error[p.id] && <div className="p-6 text-rose-600 font-bold bg-rose-50 text-sm border-b border-rose-100">{error[p.id]}</div>}
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
    return <span className="text-[11px] font-bold text-slate-400 animate-pulse uppercase tracking-widest mr-2">Calculando...</span>;
  }
  const userTotal = users.length;
  const userDoneCount = users.filter(u => u.userProgress.complete).length;
  const pct = userTotal ? Math.round((userDoneCount/userTotal)*100) : 0;

  return (
    <span className="flex flex-row gap-5 items-center mr-2">
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Completitud</span>
        <span className="text-base font-extrabold text-[#1F2937] leading-tight">{userDoneCount} <span className="text-slate-400 font-semibold text-sm">/ {userTotal}</span></span>
      </div>
      <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#EEF2F7] relative bg-[#F6F8FB]">
         <svg className="absolute inset-0 w-full h-full transform -rotate-90">
           <circle cx="20" cy="20" r="18" fill="transparent" stroke="transparent" strokeWidth="4" className="text-[#EEF2F7]" />
           <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="113" strokeDashoffset={113 - (113 * pct / 100)} className={`${pct === 100 ? 'text-[#00A6A6]' : 'text-[#6A3DF0]'} transition-all duration-1000 ease-out`} />
         </svg>
         <span className={`text-[11px] font-extrabold z-10 ${pct === 100 ? 'text-[#00A6A6]' : 'text-[#6A3DF0]'}`}>{pct}%</span>
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
  const col1Width = "280px";
  return (
    <div className="relative w-full overflow-x-auto bg-[#F6F8FB]/50">
      <table className="min-w-full table-auto text-[11px] md:text-sm border-collapse">
        <thead>
          <tr className="bg-[#F6F8FB] border-b border-[#EEF2F7] uppercase tracking-widest text-slate-400 text-[10px]">
            <th
              className="sticky top-0 left-0 z-30 bg-[#F6F8FB]/90 backdrop-blur-md border-r border-[#EEF2F7] font-bold px-6 py-4 text-left"
              style={{minWidth:col1Width, maxWidth:col1Width, width:col1Width}}
            >Colaborador</th>
            <th className="px-6 py-4 font-bold text-left">Rol</th>
            <th className="px-6 py-4 font-bold text-left">Docs. Base</th>
            <th className="px-6 py-4 font-bold text-center">Proyectivos</th>
            <th className="px-6 py-4 font-bold text-center">Estatus Global</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-slate-500 py-10 bg-white font-bold text-sm">Sin usuarios encontrados en este plantel.</td>
            </tr>
          )}
          {filteredUsers.map(u => (
            <tr key={u.id} className="border-b border-[#EEF2F7] hover:bg-white transition-colors bg-transparent group">
              <td
                className="sticky left-0 bg-transparent group-hover:bg-white z-20 border-r border-[#EEF2F7] flex flex-row gap-4 items-center px-6 py-3 transition-colors"
                style={{ minWidth: col1Width, maxWidth: col1Width, width: col1Width }}
              >
                <img 
                  src={u.picture || "/IMAGOTIPO-IECS-IEDIS.png"} 
                  width={36} 
                  height={36} 
                  alt="" 
                  className="rounded-full bg-white border-2 border-white shadow-sm object-cover shrink-0" 
                  onError={(e) => { e.target.onerror = null; e.target.src = "/IMAGOTIPO-IECS-IEDIS.png"; }}
                />
                <div className="min-w-0 w-full">
                  <div className="font-extrabold text-[#1F2937] truncate text-sm leading-tight">{u.name}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">{u.email}</div>
                </div>
              </td>
              <td className="px-6 py-3">
                <span className={`inline-flex px-3 py-1 rounded-lg font-extrabold text-[11px] ring-1 ring-inset shadow-sm ${
                  u.role === "employee" ? "bg-emerald-50 text-[#00A6A6] ring-[#00A6A6]/20" : "bg-[#F6F8FB] text-[#6A3DF0] ring-[#6A3DF0]/20"
                }`}>{u.role === "employee" ? "Empleado" : "Candidato"}</span>
              </td>
              <td className="px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 bg-[#EEF2F7] rounded-full overflow-hidden border border-[#EEF2F7]/50 shadow-inner">
                    <div className={`h-full transition-all duration-700 ${u.userProgress.pct === 100 ? "bg-[#00A6A6]" : "bg-[#6A3DF0]"}`}
                      style={{width: `${u.userProgress.pct}%`}} />
                  </div>
                  <span className="text-[11px] font-extrabold text-[#1F2937]">{u.userProgress.done}<span className="text-slate-400 font-semibold">/{u.userProgress.total}</span></span>
                </div>
              </td>
              <td className="px-6 py-3 text-center">
                {u.adminProgress.proyectivosUploaded
                  ? <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold rounded-lg bg-emerald-50 ring-1 ring-inset ring-[#00A6A6]/20 px-2.5 py-1 text-[#00A6A6]"><CheckCircleIcon className="w-4 h-4 stroke-2" />Entregados</span>
                  : <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold rounded-lg bg-amber-50 ring-1 ring-inset ring-amber-500/20 px-2.5 py-1 text-amber-600"><ClockIcon className="w-4 h-4 stroke-2" />Pendiente</span>
                }
              </td>
              <td className="px-6 py-3 text-center">
                {u.fullyCompleted
                  ? <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold rounded-lg bg-emerald-50 ring-1 ring-inset ring-[#00A6A6]/20 px-3 py-1 text-[#00A6A6] shadow-sm"><CheckCircleIcon className="w-4 h-4 stroke-2" />Completo</span>
                  : <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold rounded-lg bg-[#F6F8FB] ring-1 ring-inset ring-slate-300/50 px-3 py-1 text-slate-500 shadow-sm"><XCircleIcon className="w-4 h-4 stroke-2" />En proceso</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}