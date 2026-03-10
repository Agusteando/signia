"use client";
import React, { useMemo, useState } from "react";
import { UserGroupIcon, MapPinIcon, BriefcaseIcon, FunnelIcon, CalendarDaysIcon, ChartBarIcon } from "@heroicons/react/24/solid";

// Helper: Extraer edad aproximada del CURP
function parseAgeFromCURP(curp) {
  if (!curp || curp.length < 18) return null;
  const yrStr = curp.substring(4, 6);
  const moStr = curp.substring(6, 8);
  const daStr = curp.substring(8, 10);
  
  const yr = parseInt(yrStr, 10);
  const mo = parseInt(moStr, 10);
  const da = parseInt(daStr, 10);
  if (isNaN(yr) || isNaN(mo) || isNaN(da)) return null;

  const currentYear2D = new Date().getFullYear() % 100;
  let fullYear = yr;
  if (yr > currentYear2D && yr <= 99) fullYear += 1900;
  else fullYear += 2000;

  const dob = new Date(fullYear, mo - 1, da);
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

// Extraer lista única de puestos
function getPuestos(users) {
  const p = new Set(users.map(u => u.puesto?.trim().toUpperCase()).filter(Boolean));
  return Array.from(p).sort();
}

// --- WIDGETS CON DISEÑO VIBRANTE ---

function HRAgeWidget({ avgAge }) {
  return (
    <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 rounded-[2rem] p-7 flex flex-col justify-between shadow-xl relative overflow-hidden h-full text-white">
      {/* Elementos decorativos (Glass/Glow) */}
      <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-fuchsia-400/20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none">
        <UserGroupIcon className="w-32 h-32 text-white" />
      </div>
      
      <div className="flex flex-col z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <UserGroupIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="uppercase tracking-widest text-[11px] font-extrabold text-indigo-100">
            Edad Promedio
          </h3>
        </div>
        <p className="text-sm font-medium text-white/80 mt-1">Plantilla activa filtrada</p>
      </div>

      <div className="mt-8 flex items-baseline gap-2 z-10">
        {avgAge > 0 ? (
          <>
            <span className="text-7xl font-black tracking-tighter leading-none drop-shadow-md">{avgAge}</span>
            <span className="text-indigo-100 font-bold text-xl">años</span>
          </>
        ) : (
          <span className="text-base font-semibold text-indigo-200 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-md">Sin datos suficientes</span>
        )}
      </div>
    </div>
  );
}

function HRTurnoverWidget({ stats }) {
  return (
    <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-orange-500 rounded-[2rem] p-7 flex flex-col justify-between shadow-xl relative overflow-hidden h-full text-white">
      {/* Elementos decorativos */}
      <div className="absolute -right-4 -top-8 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute right-2 bottom-2 opacity-10 pointer-events-none">
        <CalendarDaysIcon className="w-32 h-32 text-white" />
      </div>
      
      <div className="flex flex-col z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <ChartBarIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="uppercase tracking-widest text-[11px] font-extrabold text-rose-100">
            Índice de Rotación
          </h3>
        </div>
        <p className="text-sm font-medium text-white/80 mt-1">Bajas vs. Histórico</p>
      </div>

      <div className="mt-8 flex flex-col z-10">
        <div className="flex items-baseline gap-1 drop-shadow-md">
          <span className="text-7xl font-black tracking-tighter leading-none">{stats.turnover}</span>
          <span className="text-rose-100 font-bold text-2xl">%</span>
        </div>
        {stats.historico > 0 && (
          <p className="text-xs font-semibold mt-4 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-xl inline-block w-fit shadow-inner">
            <span className="text-white font-bold text-sm">{stats.bajas}</span> bajas de <span className="text-white font-bold text-sm">{stats.historico}</span> registrados
          </p>
        )}
      </div>
    </div>
  );
}

function HRMapWidget({ planteles, users }) {
  const plantelesWithCounts = useMemo(() => {
    return planteles.map(p => {
      const pUsers = users.filter(u => u.plantelId === p.id && u.role === "employee" && u.isActive);
      return { ...p, activeCount: pUsers.length };
    }).filter(p => p.activeCount > 0)
      .sort((a,b) => b.activeCount - a.activeCount);
  }, [planteles, users]);

  if (plantelesWithCounts.length === 0) {
    return <div className="w-full h-full min-h-[250px] bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 text-sm font-medium">Sin datos geográficos</div>;
  }

  return (
    <div className="bg-[#0f172a] rounded-[2rem] h-full p-7 flex flex-col shadow-xl relative overflow-hidden group">
      {/* Fondo del mapa estilizado */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-transparent pointer-events-none"></div>
      
      <div className="flex flex-col z-10 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/20">
            <MapPinIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-indigo-300 uppercase tracking-widest text-[11px] font-bold">
            Distribución Geográfica
          </h3>
        </div>
        <p className="text-sm text-slate-300 font-medium">Topología de empleados activos</p>
      </div>
      
      <div className="flex-1 relative flex items-center justify-center min-h-[240px]">
        {/* Nodo Central */}
        <div className="absolute z-20 w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xs shadow-[0_0_50px_rgba(99,102,241,0.5)] border-4 border-slate-900">
          MATRIZ
        </div>
        
        {plantelesWithCounts.map((p, i) => {
           const totalNodes = plantelesWithCounts.length;
           const angle = (i / totalNodes) * Math.PI * 2 - (Math.PI/2); 
           const radius = totalNodes > 4 ? 110 + (i % 2 === 0 ? 30 : -20) : 120;
           const x = Math.cos(angle) * radius;
           const y = Math.sin(angle) * radius;
           const maxCount = plantelesWithCounts[0].activeCount;
           const nodeSize = Math.max(40, Math.min(75, (p.activeCount / maxCount) * 80));

           return (
             <React.Fragment key={p.id}>
               {/* Líneas de conexión neón */}
               <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                  <line 
                    x1="50%" y1="50%" 
                    x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`} 
                    stroke="#818cf8" strokeWidth="2" strokeDasharray="4 6" 
                  />
               </svg>
               {/* Nodo */}
               <div 
                 className="absolute z-10 flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 hover:z-30 cursor-crosshair group/node"
                 style={{ transform: `translate(${x}px, ${y}px)`, width: `${nodeSize}px`, height: `${nodeSize}px` }}
               >
                 <div className="w-full h-full bg-slate-800 border-[3px] border-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)] relative group-hover/node:border-emerald-300">
                   <span className="text-white font-black text-sm">{p.activeCount}</span>
                 </div>
                 {/* Tooltip visible por defecto o al hover dependiendo del tamaño */}
                 <span className="absolute top-[100%] mt-2 text-[10px] font-bold text-slate-200 whitespace-nowrap bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-700 shadow-xl opacity-90 group-hover/node:opacity-100 transition-opacity">
                   {p.label || p.name}
                 </span>
               </div>
             </React.Fragment>
           );
        })}
      </div>
    </div>
  );
}

function HRPuestosWidget({ breakdown, maxCount }) {
  return (
    <div className="bg-white rounded-[2rem] h-full p-7 flex flex-col border border-slate-200 shadow-lg">
      <div className="flex flex-col mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-slate-100 rounded-xl">
            <BriefcaseIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-slate-500 uppercase tracking-widest text-[11px] font-bold">
            Estructura Organizacional
          </h3>
        </div>
        <p className="text-sm text-slate-800 font-semibold">Proporción de roles en plantilla activa</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-3 max-h-[400px] flex flex-col gap-5 custom-scrollbar">
        {breakdown.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-10 font-medium">No hay puestos registrados en la selección.</div>
        ) : (
          breakdown.map((item, idx) => {
             const pct = Math.max(2, (item.count / maxCount) * 100); 
             const isTop = idx === 0;
             const isSecond = idx === 1;
             
             // Colores vibrantes para los primeros
             let barColor = "bg-slate-300 group-hover:bg-indigo-300";
             if (isTop) barColor = "bg-gradient-to-r from-indigo-500 to-purple-500";
             else if (isSecond) barColor = "bg-indigo-400";

             return (
               <div key={item.name} className="flex flex-col w-full group">
                 <div className="flex justify-between items-end mb-1.5">
                   <span className={`font-bold truncate pr-2 text-sm ${isTop ? 'text-indigo-700' : 'text-slate-700'}`} title={item.name}>{item.name}</span>
                   <span className="font-extrabold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg text-xs">{item.count}</span>
                 </div>
                 <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                   <div 
                     className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                     style={{ width: `${pct}%` }}
                   />
                 </div>
               </div>
             );
          })
        )}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}

export default function HRInsightsDashboard({ users, planteles }) {
  if (!users || users.length === 0) return null;

  const puestosList = getPuestos(users);

  // --- GLOBAL FILTERS STATE ---
  const [filterPlantelId, setFilterPlantelId] = useState("ALL");
  const [filterPuesto, setFilterPuesto] = useState("ALL");
  const [filterPeriod, setFilterPeriod] = useState("ALL"); // ALL, 6M, 12M

  // --- COMPUTE STATS BASED ON FILTERS ---
  const filteredData = useMemo(() => {
    let totalAge = 0, ageCount = 0;
    let historico = 0, bajas = 0;
    
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const activeUsersForPuestos = [];

    users.forEach(u => {
      if (u.role !== "employee") return;
      
      const matchPlantel = filterPlantelId === "ALL" || String(u.plantelId) === String(filterPlantelId);
      const matchPuesto = filterPuesto === "ALL" || u.puesto?.trim().toUpperCase() === filterPuesto;

      if (!matchPlantel || !matchPuesto) return;

      // Edad (Sólo activos)
      if (u.isActive && u.curp) {
        const age = parseAgeFromCURP(u.curp);
        if (age && age >= 18 && age <= 100) {
          totalAge += age;
          ageCount++;
        }
      }

      // Rotación
      let inPeriod = true;
      if (filterPeriod !== "ALL") {
        const threshold = filterPeriod === "6M" ? sixMonthsAgo : twelveMonthsAgo;
        const refDate = new Date(u.updatedAt || u.createdAt);
        if (!u.isActive && refDate < threshold) {
          inPeriod = false;
        }
      }

      if (inPeriod) {
        historico++;
        if (!u.isActive) bajas++;
      }

      // Para los puestos, solo contamos los activos
      if (u.isActive && u.puesto) {
        activeUsersForPuestos.push(u);
      }
    });

    const avgAge = ageCount > 0 ? Math.round(totalAge / ageCount) : 0;
    const turnover = historico > 0 ? ((bajas / historico) * 100).toFixed(1) : 0;

    // Calcular distribución de puestos
    const counts = {};
    activeUsersForPuestos.forEach(u => {
      const p = u.puesto.toUpperCase().trim();
      counts[p] = (counts[p] || 0) + 1;
    });

    const breakdown = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a,b) => b.count - a.count);
      
    const maxCount = breakdown.length > 0 ? breakdown[0].count : 1;

    return { 
      age: avgAge, 
      turnoverStats: { turnover, bajas, historico }, 
      breakdown, 
      maxCount 
    };

  }, [users, filterPlantelId, filterPuesto, filterPeriod]);

  return (
    <div className="w-full flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Analítica de Recursos Humanos</h2>
          <p className="text-base text-slate-500 font-medium mt-1">Explora las tendencias y la distribución de tu fuerza laboral con datos en tiempo real.</p>
        </div>
      </div>

      {/* GLOBAL CONTROL BAR - Premium Glass Style */}
      <div className="flex flex-wrap items-center gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-2 pl-2 pr-4 border-r border-slate-200">
          <FunnelIcon className="w-5 h-5 text-indigo-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Filtros</span>
        </div>
        
        <select 
          className="text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all min-w-[180px] cursor-pointer"
          value={filterPlantelId} onChange={e => setFilterPlantelId(e.target.value)}
        >
          <option value="ALL">Plantel: Todos</option>
          {planteles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        
        <select 
          className="text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all min-w-[180px] cursor-pointer"
          value={filterPuesto} onChange={e => setFilterPuesto(e.target.value)}
        >
          <option value="ALL">Puesto: Todos</option>
          {puestosList.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        
        <select 
          className="text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all min-w-[180px] cursor-pointer"
          value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}
        >
          <option value="ALL">Periodo: Histórico Completo</option>
          <option value="6M">Últimos 6 meses</option>
          <option value="12M">Últimos 12 meses</option>
        </select>
      </div>

      {/* WIDGETS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Top KPIs + Map */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <HRAgeWidget avgAge={filteredData.age} />
            <HRTurnoverWidget stats={filteredData.turnoverStats} />
          </div>
          <div className="flex-1">
            <HRMapWidget planteles={planteles} users={users} />
          </div>
        </div>
        
        {/* Right Column: Roles Bar Chart */}
        <div className="lg:col-span-5">
          <HRPuestosWidget breakdown={filteredData.breakdown} maxCount={filteredData.maxCount} />
        </div>

      </div>
    </div>
  );
}