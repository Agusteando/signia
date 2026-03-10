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
    <div className="w-full flex flex-col card-elevated relative overflow-hidden">
      {/* Top Header & Tabs */}
      <div className="px-6 pt-5 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100">
         <div className="flex space-x-1 w-full md:w-auto overflow-x-auto no-scrollbar bg-slate-100/60 p-1 rounded-lg border border-slate-200/50">
           {TABS.map(tab => (
             <button
               key={tab.id}
               className={`px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all rounded-md ${
                 statusFilter === tab.id 
                   ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' 
                   : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
               }`}
               onClick={() => setStatusFilter(tab.id)}
             >
               {tab.label}
             </button>
           ))}
         </div>
         {["superadmin", "admin"].includes(adminRole) && (
           <div className="pb-1 md:pb-0">
             <button
               type="button"
               onClick={handleExcelExport}
               disabled={exporting}
               className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium px-4 py-2 rounded-lg transition text-xs sm:text-sm shadow-sm disabled:opacity-70"
             >
               <ArrowDownTrayIcon className="w-4 h-4" />
               {exporting ? "Generando..." : "Exportar Excel"}
             </button>
           </div>
         )}
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-4 flex flex-wrap items-center gap-3 bg-white border-b border-slate-100">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/60 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/5 focus:border-slate-300 transition-all outline-none text-slate-800 placeholder:text-slate-400"
            placeholder="Buscar por nombre o correo..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-lg px-2 hover:bg-white transition-colors cursor-pointer">
          <FunnelIcon className="w-4 h-4 text-slate-400 ml-2" />
          <select className="py-2 px-2 text-sm text-slate-600 outline-none bg-transparent appearance-none min-w-[120px] font-medium cursor-pointer" value={plantelFilter} onChange={e => setPlantelFilter(e.target.value)}>
            <option value="">Plantel (Todos)</option>
            {planteles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-lg px-2 hover:bg-white transition-colors cursor-pointer">
          <select className="py-2 px-2 text-sm text-slate-600 outline-none bg-transparent appearance-none min-w-[100px] font-medium cursor-pointer" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">Rol (Todos)</option>
            <option value="candidate">Candidatos</option>
            <option value="employee">Empleados</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-lg px-2 hover:bg-white transition-colors cursor-pointer">
          <select className="py-2 px-2 text-sm text-slate-600 outline-none bg-transparent appearance-none font-medium cursor-pointer" value={activeFilter} onChange={e => setActiveFilter(e.target.value)}>
            <option value="todos">Actividad (Todas)</option>
            <option value="activos">Sólo activos</option>
            <option value="bajas">Sólo bajas</option>
          </select>
        </div>
      </div>

      {feedback.message && (
        <div className={`mx-6 mt-4 mb-2 px-4 py-2.5 rounded-lg font-medium text-xs sm:text-sm border flex items-center gap-2 animate-fade-in shadow-sm ${feedback.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : feedback.type === "error" ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-slate-50 text-slate-800 border-slate-200"}`}>
          {feedback.type === "success" && <CheckCircleIcon className="w-5 h-5 text-emerald-600" />}
          {feedback.type === "error" && <XCircleIcon className="w-5 h-5 text-rose-600" />}
          {feedback.message}
        </div>
      )}

      {/* Main Table */}
      <div className="px-6 overflow-x-auto min-h-[300px]">
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
      
      {/* Bottom Pagination */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between text-sm text-slate-500 gap-4">
        <div className="flex items-center gap-3 font-medium">
          <span>Mostrando página <strong className="text-slate-800">{page}</strong> de {totalPages}</span>
          <select className="border border-slate-200 rounded-md bg-white px-2 py-1 outline-none focus:ring-2 focus:ring-slate-900/5 transition-shadow" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s} filas</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeftIcon className="w-4 h-4 text-slate-600" /></button>
          <button className="px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRightIcon className="w-4 h-4 text-slate-600" /></button>
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