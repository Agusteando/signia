"use client";
import { useState, useMemo } from "react";
import UserManagementTable from "./UserManagementTable";
import { MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function UserManagementPanel({ users, planteles, adminRole, plantelesPermittedIds, canAssignPlantel }) {
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const usersFiltered = useMemo(() => {
    return users.filter(u => 
      (!filter || u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase())) &&
      (roleFilter === "all" || u.role === roleFilter)
    );
  }, [users, filter, roleFilter]);

  return (
    <div className="card-signia flex flex-col w-full">
      {/* Premium Header area */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/40">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 min-w-[260px]">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-signia-purple/40 shadow-inner transition-all outline-none"
              placeholder="Buscar colaborador..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
          
          <div className="relative bg-slate-50 rounded-xl shadow-inner px-2 hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200">
            <select 
              className="py-2.5 px-2 text-sm text-slate-600 outline-none bg-transparent appearance-none font-semibold cursor-pointer" 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              <option value="employee">Solo Empleados</option>
              <option value="candidate">Solo Candidatos</option>
            </select>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-slate-900 text-white hover:bg-signia-purple hover:shadow-lg hover:shadow-signia-purple/20 font-bold px-5 py-2.5 rounded-xl transition-all text-sm active:scale-95">
          <ArrowDownTrayIcon className="w-4 h-4" /> Exportar Reporte
        </button>
      </div>

      {/* Table Area */}
      <div className="bg-white px-2">
        <UserManagementTable 
          users={usersFiltered.slice(0, 20)} // Mock paginated for render
          planteles={planteles}
          role={adminRole}
          canAssignPlantel={canAssignPlantel}
          selection={{}} onSelectAll={()=>{}} onSelectUser={()=>{}}
        />
      </div>
    </div>
  );
}