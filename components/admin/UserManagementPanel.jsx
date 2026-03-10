"use client";
import { useState, useEffect, useMemo } from "react";
import UserManagementTable from "./UserManagementTable";
import BulkActionBar from "./BulkActionBar";
import UserDocsDrawer from "./UserDocsDrawer";
import UserFichaTecnicaDrawer from "./UserFichaTecnicaDrawer";
import { CheckCircleIcon, XCircleIcon, ChevronLeftIcon, ChevronRightIcon, ArrowDownTrayIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const TABS = [
  { id: "all", label: "Todos" },
  { id: "ready", label: "Listos para aprobar" },
  { id: "employee", label: "Empleados" },
  { id: "incomplete", label: "Incompletos" }
];

export default function UserManagementPanel({
  users, planteles, adminRole, plantelesPermittedIds, canAssignPlantel
}) {
  const [filter, setFilter] = useState("");
  const [plantelFilter, setPlantelFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [activeFilter, setActiveFilter] = useState("todos");
  
  const [selection, setSelection] = useState({});
  const [docsDrawer, setDocsDrawer] = useState({ open: false, user: null });
  const [fichaDrawer, setFichaDrawer] = useState({ open: false, user: null });
  const [feedback, setFeedback] = useState({ type: null, message: "" });
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const adminsPlanteles = adminRole === "superadmin" ? planteles.map(p => p.id) : plantelesPermittedIds || [];
  const editablePlanteles = planteles.filter(p => adminsPlanteles.includes(p.id));

  useEffect(() => { setPage(1); }, [filter, plantelFilter, roleFilter, statusFilter, activeFilter, users.length]);

  const usersFiltered = useMemo(() => {
    return (users || []).filter(u =>
      (!filter || (String(u.name || "").toLowerCase().includes(filter.toLowerCase()) || String(u.email || "").toLowerCase().includes(filter.toLowerCase()))) &&
      (!plantelFilter || String(u.plantelId || "") === String(plantelFilter)) &&
      (roleFilter === "all" || u.role === roleFilter) &&
      (statusFilter === "all" ||
       (statusFilter === "ready" && u.readyForApproval) ||
       (statusFilter === "employee" && u.role === "employee") ||
       (statusFilter === "incomplete" && !u.readyForApproval && u.role === "candidate")) &&
      (activeFilter === "todos" || (activeFilter === "activos" ? u.isActive : !u.isActive))
    );
  }, [users, filter, plantelFilter, roleFilter, statusFilter, activeFilter]);
  
  const totalPages = Math.max(1, Math.ceil(usersFiltered.length / pageSize));
  const paginatedUsers = useMemo(() => usersFiltered.slice((page - 1) * pageSize, page * pageSize), [usersFiltered, page, pageSize]);

  const selectedUserIds = useMemo(() => Object.entries(selection).filter(([k,v]) => v).map(([k]) => Number(k)), [selection]);
  const allSelected = paginatedUsers.length > 0 && selectedUserIds.length >= paginatedUsers.length;

  function handleSelectUser(userId, on) { setSelection(sel => ({ ...sel, [userId]: on })); }
  function handleSelectAll(on) {
    if (on) setSelection(sel => ({ ...sel, ...Object.fromEntries(paginatedUsers.map(u => [u.id, true])) }));
    else setSelection(sel => { const ns = { ...sel }; paginatedUsers.forEach(u => { delete ns[u.id]; }); return ns; });
  }
  
  async function handleAssignPlantel(userId, plantelId) {
    setFeedback({ type: "info", message: "Asignando..." });
    try {
      const res = await fetch(`/api/admin/user/${userId}/plantel`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plantelId }) });
      if (!res.ok) throw new Error((await res.json()).error || "Error de servidor");
      setFeedback({ type: "success", message: "Plantel actualizado" });
      setTimeout(() => { setFeedback({ type: null, message: "" }); window.location.reload(); }, 900);
    } catch (e) { setFeedback({ type: "error", message: String(e.message || e) }); }
  }
  
  async function handleBulkAssign(plantelId) {
    setFeedback({ type: "info", message: "Asignando en lote..." });
    try {
      const res = await fetch(`/api/admin/users/assign-plantel`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userIds: selectedUserIds, plantelId }) });
      if (!res.ok) throw new Error((await res.json()).error || "Error de servidor");
      setFeedback({ type: "success", message: "Usuarios asignados" });
      setTimeout(() => { setFeedback({ type: null, message: "" }); window.location.reload(); }, 900);
    } catch (e) { setFeedback({ type: "error", message: String(e.message || e) }); }
  }

  async function handleSetActive(userId, isActive) {
    setFeedback({ type: "info", message: isActive ? "Activando..." : "Dando de baja..." });
    try {
      const res = await fetch(`/api/admin/user/${userId}/active`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive }) });
      if (!res.ok) throw new Error((await res.json()).error || "Error en el estatus");
      setFeedback({ type: "success", message: isActive ? "Usuario activado" : "Usuario dado de baja" });
      setTimeout(() => { setFeedback({ type: null, message: "" }); window.location.reload(); }, 900);
    } catch (e) { setFeedback({ type: "error", message: String(e.message || e) }); }
  }
  
  async function handleBulkSetActive(isActive) {
    setFeedback({ type: "info", message: isActive ? "Procesando..." : "Procesando..." });
    for (let userId of selectedUserIds) await handleSetActive(userId, isActive);
    setFeedback({ type: "success", message: isActive ? "Usuarios activados" : "Usuarios dados de baja" });
    setTimeout(() => { setFeedback({ type: null, message: "" }); window.location.reload(); }, 900);
  }

  async function handleDelete(userId) {
    setFeedback({ type: "info", message: "Eliminando usuario..." });
    try {
      const res = await fetch(`/api/admin/user/${userId}/delete`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Error al eliminar");
      setFeedback({ type: "success", message: "Usuario eliminado" });
      setTimeout(() => { setFeedback({ type: null, message: "" }); window.location.reload(); }, 900);
    } catch (e) { setFeedback({ type: "error", message: String(e.message || e) }); }
  }

  function handleOpenDocs(user) { setDocsDrawer({ open: true, user }); }
  function closeDocsDrawer() { setDocsDrawer({ open: false, user: null }); }
  function handleOpenFichaTecnica(user) { setFichaDrawer({ open: true, user }); }
  function closeFichaDrawer() { setFichaDrawer({ open: false, user: null }); }

  async function handleExcelExport() {
    setExporting(true); setFeedback({ type: "info", message: "Generando reporte..." });
    try {
      const res = await fetch(`/api/admin/users/export-excel`, { method: "GET", headers: { "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" } });
      if (!res.ok) throw new Error("Error al exportar");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const el = document.createElement("a");
      el.href = url; el.download = `ExpedientePorPlantel_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(el); el.click(); el.remove();
      window.URL.revokeObjectURL(url);
      setFeedback({ type: "success", message: "Descarga exitosa" });
    } catch (e) { setFeedback({ type: "error", message: `${e.message || e}` }); }
    setExporting(false);
    setTimeout(() => setFeedback({ type: null, message: "" }), 1500);
  }

  return (
    <div className="w-full flex flex-col bg-white border border-[#EEF2F7] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] rounded-3xl relative overflow-hidden">
      {/* Top Header & Tabs */}
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[#EEF2F7] bg-white">
         <div className="flex space-x-3 w-full md:w-auto overflow-x-auto no-scrollbar bg-[#F6F8FB] p-2 rounded-2xl border border-[#EEF2F7]">
           {TABS.map(tab => (
             <button
               key={tab.id}
               className={`px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-all duration-200 rounded-xl ${
                 statusFilter === tab.id 
                   ? 'bg-white text-[#6A3DF0] shadow-sm ring-1 ring-slate-900/5 transform scale-100' 
                   : 'text-slate-500 hover:text-[#1F2937] hover:bg-slate-200/50'
               }`}
               onClick={() => setStatusFilter(tab.id)}
             >
               {tab.label}
             </button>
           ))}
         </div>
         {["superadmin", "admin"].includes(adminRole) && (
           <div className="pb-2 md:pb-0">
             <button
               type="button"
               onClick={handleExcelExport}
               disabled={exporting}
               className="flex items-center gap-3 bg-[#00A6A6] text-white hover:bg-[#0FB5C9] font-extrabold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-[#00A6A6]/20 disabled:opacity-70 text-sm hover:-translate-y-0.5"
             >
               <ArrowDownTrayIcon className="w-5 h-5 stroke-2" />
               {exporting ? "Generando Reporte..." : "Exportar Datos (Excel)"}
             </button>
           </div>
         )}
      </div>

      {/* Spacious Grid Filter Bar */}
      <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 bg-white border-b border-[#EEF2F7]">
        {/* Search */}
        <div className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00A6A6]" />
          <input 
            className="w-full pl-12 pr-4 py-3.5 bg-[#F6F8FB] border border-[#EEF2F7] rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6] transition-all outline-none text-[#1F2937] placeholder:text-slate-400"
            placeholder="Buscar por nombre o correo..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        {/* Plantel */}
        <div className="relative w-full">
          <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6A3DF0]" />
          <select className="w-full pl-12 pr-10 py-3.5 bg-[#F6F8FB] border border-[#EEF2F7] rounded-xl text-sm font-bold text-[#1F2937] outline-none hover:bg-white focus:bg-white focus:border-[#6A3DF0]/50 transition-colors cursor-pointer appearance-none" value={plantelFilter} onChange={e => setPlantelFilter(e.target.value)}>
            <option value="">Todos los Planteles</option>
            {planteles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
        </div>
        {/* Role */}
        <div className="relative w-full">
          <select className="w-full pl-5 pr-10 py-3.5 bg-[#F6F8FB] border border-[#EEF2F7] rounded-xl text-sm font-bold text-[#1F2937] outline-none hover:bg-white focus:bg-white focus:border-[#6A3DF0]/50 transition-colors cursor-pointer appearance-none" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">Cualquier Rol</option>
            <option value="candidate">Solo Candidatos</option>
            <option value="employee">Solo Empleados</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
        </div>
        {/* Active Status */}
        <div className="relative w-full">
          <select className="w-full pl-5 pr-10 py-3.5 bg-[#F6F8FB] border border-[#EEF2F7] rounded-xl text-sm font-bold text-[#1F2937] outline-none hover:bg-white focus:bg-white focus:border-[#6A3DF0]/50 transition-colors cursor-pointer appearance-none" value={activeFilter} onChange={e => setActiveFilter(e.target.value)}>
            <option value="todos">Activos e Inactivos</option>
            <option value="activos">Personal Activo</option>
            <option value="bajas">Personal de Baja</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
        </div>
      </div>

      {feedback.message && (
        <div className={`mx-8 mt-6 mb-2 px-6 py-4 rounded-xl font-bold text-sm border flex items-center gap-3 animate-fade-in shadow-sm ${feedback.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : feedback.type === "error" ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-slate-50 text-slate-800 border-slate-200"}`}>
          {feedback.type === "success" && <CheckCircleIcon className="w-6 h-6 text-emerald-600 stroke-2" />}
          {feedback.type === "error" && <XCircleIcon className="w-6 h-6 text-rose-600 stroke-2" />}
          {feedback.message}
        </div>
      )}

      {/* Main Table Area */}
      <div className="px-8 py-2 overflow-x-auto min-h-[400px]">
        <UserManagementTable
          users={paginatedUsers}
          planteles={planteles}
          adminsPlanteles={adminsPlanteles}
          role={adminRole}
          selection={selection}
          selectedUserIds={selectedUserIds}
          allSelected={allSelected}
          canAssignPlantel={canAssignPlantel}
          onSelectUser={handleSelectUser}
          onSelectAll={handleSelectAll}
          onAssignPlantel={handleAssignPlantel}
          onDocs={handleOpenDocs}
          onFichaTecnica={handleOpenFichaTecnica}
          onSetActive={handleSetActive}
          onDelete={handleDelete}
        />
      </div>
      
      {/* Footer Pagination */}
      <div className="px-8 py-6 border-t border-[#EEF2F7] bg-white flex flex-wrap items-center justify-between text-sm text-slate-500 gap-6">
        <div className="flex items-center gap-4 font-medium">
          <span>Mostrando página <strong className="text-[#1F2937] text-base">{page}</strong> de {totalPages}</span>
          <select className="border border-[#EEF2F7] rounded-xl bg-[#F6F8FB] px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00A6A6]/30 font-bold text-[#1F2937] transition-shadow cursor-pointer" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s} filas por página</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button className="p-3 rounded-xl border border-[#EEF2F7] bg-[#F6F8FB] hover:bg-white hover:text-[#6A3DF0] hover:border-[#6A3DF0]/30 disabled:opacity-50 transition-all shadow-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeftIcon className="w-5 h-5 stroke-2" /></button>
          <button className="p-3 rounded-xl border border-[#EEF2F7] bg-[#F6F8FB] hover:bg-white hover:text-[#6A3DF0] hover:border-[#6A3DF0]/30 disabled:opacity-50 transition-all shadow-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRightIcon className="w-5 h-5 stroke-2" /></button>
        </div>
      </div>

      <BulkActionBar
        users={paginatedUsers}
        planteles={planteles}
        adminRole={adminRole}
        selectedUserIds={selectedUserIds}
        canAssignPlantel={canAssignPlantel}
        onBulkAssign={handleBulkAssign}
        onBulkSetActive={handleBulkSetActive}
      />
      
      <UserDocsDrawer open={docsDrawer.open} user={docsDrawer.user} onClose={closeDocsDrawer} />
      <UserFichaTecnicaDrawer open={fichaDrawer.open} user={fichaDrawer.user} planteles={planteles} canEdit={fichaDrawer.open && fichaDrawer.user && (adminRole === "superadmin" || adminsPlanteles.includes(fichaDrawer.user.plantelId))} editablePlanteles={editablePlanteles} onClose={closeFichaDrawer} isSuperadmin={adminRole === "superadmin"} />
    </div>
  );
}