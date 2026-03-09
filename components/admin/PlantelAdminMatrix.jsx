"use client";
import { useState, useEffect, useMemo } from "react";
import { ChevronDownIcon, ChevronUpIcon, UserIcon } from "@heroicons/react/24/outline";

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
    <div id="plantel-admin-matrix" className="w-full bg-white border border-slate-200 shadow-sm rounded-xl p-5 mb-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-slate-900">
        <UserIcon className="w-5 h-5 text-slate-500" />
        Auditoría de Expedientes por Plantel
      </h2>
      <div className="mt-3 mb-5 w-full max-w-sm">
        <input
          aria-label="Buscar empleado"
          type="text"
          className="w-full rounded-md px-4 py-2 border border-slate-300 shadow-sm placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50 focus:bg-white"
          placeholder="Buscar empleado por nombre o correo..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
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
            <div key={p.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-md">
              <button
                className="flex flex-row items-center justify-between w-full px-5 py-4 font-semibold text-slate-800 text-sm rounded-xl focus:outline-none hover:bg-slate-50 transition"
                onClick={() => handleExpand(p.id)}
                aria-expanded={expanded === p.id}
                aria-controls={`plantel-expand-${p.id}`}
                type="button"
              >
                <span>{p.name}</span>
                <span className="flex items-center gap-3">
                  <PlantelSummaryBar users={users} loading={loading[p.id]} />
                  {expanded === p.id
                    ? <ChevronUpIcon className="w-5 h-5 text-slate-400 ml-2" />
                    : <ChevronDownIcon className="w-5 h-5 text-slate-400 ml-2" />
                  }
                </span>
              </button>
              
              <div id={`plantel-expand-${p.id}`} className={expanded === p.id ? "block" : "hidden"}>
                <div className="p-0 border-t border-slate-100">
                  {loading[p.id] && <div className="p-8 text-center text-slate-500 font-medium text-sm">Cargando datos del plantel...</div>}
                  {error[p.id] && <div className="p-4 text-red-600 font-medium bg-red-50 text-sm">{error[p.id]}</div>}
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
    return <span className="text-xs font-medium text-slate-400 ml-6 animate-pulse">Calculando métricas...</span>;
  }
  const userTotal = users.length;
  const userDoneCount = users.filter(u => u.userProgress.complete).length;
  const adminDoneCount = users.filter(u => u.fullyCompleted).length;

  return (
    <span className="flex flex-row gap-3 items-center ml-6">
      <span className="text-xs text-slate-500 font-medium">{userTotal} registros</span>
      <div className="hidden sm:block w-24 h-1.5 rounded-full bg-slate-100 relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full bg-indigo-500 rounded-l-full transition-all"
          style={{width: `${userTotal ? Math.round((userDoneCount/userTotal)*100) : 0}%`}} />
      </div>
      <span className="text-xs text-indigo-700 font-semibold">{userDoneCount}/{userTotal} validados</span>
      <span className="text-xs text-emerald-700 font-semibold">{adminDoneCount}/{userTotal} completados</span>
    </span>
  );
}

// ... internal dependencies intact
import Image from "next/image";
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
    <div className="relative w-full overflow-x-auto max-w-full bg-slate-50">
      <table className="min-w-full table-auto text-xs md:text-sm">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200">
            <th
              className="sticky top-0 left-0 z-30 bg-slate-100 border-r border-slate-200 font-semibold text-slate-700 px-3 py-2 text-left"
              style={{minWidth:col1Width, maxWidth:col1Width, width:col1Width, boxShadow:"1px 0 0 #e2e8f0"}}
            >Colaborador</th>
            <th className="px-3 py-2 font-semibold text-slate-700 text-left">Rol / Nivel</th>
            <th className="px-3 py-2 font-semibold text-slate-700 text-left">Documentos</th>
            <th className="px-3 py-2 font-semibold text-slate-700 text-center">Proyectivos</th>
            <th className="px-3 py-2 font-semibold text-slate-700 text-center">Estatus Global</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-slate-500 py-6 bg-white font-medium">Sin usuarios registrados o sin coincidencias.</td>
            </tr>
          )}
          {filteredUsers.map(u => (
            <tr key={u.id} className="border-b border-slate-100 hover:bg-white transition bg-slate-50">
              <td
                className="sticky left-0 bg-white z-20 border-r border-slate-200 flex flex-row gap-3 items-center px-3 py-2"
                style={{ minWidth: col1Width, maxWidth: col1Width, width: col1Width, boxShadow: "1px 0 0 #e2e8f0" }}
              >
                <Image src={u.picture || "/IMAGOTIPO-IECS-IEDIS.png"} width={32} height={32} alt="" className="rounded-full bg-slate-100 border border-slate-200 object-cover shrink-0" />
                <div className="min-w-0 w-full">
                  <div className="font-semibold text-slate-900 truncate">{u.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                </div>
              </td>
              <td className="px-3 py-2">
                <span className={`inline-block px-2 py-0.5 rounded-md font-medium text-[10px] border ${
                  u.role === "employee" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}>{u.role === "employee" ? "Empleado" : "Candidato"}</span>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${u.userProgress.pct === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                      style={{width: `${u.userProgress.pct}%`}} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600">{u.userProgress.done}/{u.userProgress.total}</span>
                </div>
              </td>
              <td className="px-3 py-2 text-center">
                {u.adminProgress.proyectivosUploaded
                  ? <span className="inline-flex items-center gap-1 text-[11px] font-medium rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1 text-emerald-700"><CheckCircleIcon className="w-3.5 h-3.5" />Entregados</span>
                  : <span className="inline-flex items-center gap-1 text-[11px] font-medium rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-amber-700"><ClockIcon className="w-3.5 h-3.5" />Falta</span>
                }
              </td>
              <td className="px-3 py-2 text-center">
                {u.fullyCompleted
                  ? <span className="inline-flex items-center gap-1 text-[11px] font-medium rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1 text-emerald-700"><CheckCircleIcon className="w-3.5 h-3.5" />Completo</span>
                  : <span className="inline-flex items-center gap-1 text-[11px] font-medium rounded-md bg-slate-100 border border-slate-200 px-2 py-1 text-slate-600"><XCircleIcon className="w-3.5 h-3.5" />En proceso</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}