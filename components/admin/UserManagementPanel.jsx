"use client";
import { useState, useEffect, useMemo } from "react";
import UserManagementTable from "./UserManagementTable";
import BulkActionBar from "./BulkActionBar";
import UserDocsDrawer from "./UserDocsDrawer";
import UserFichaTecnicaDrawer from "./UserFichaTecnicaDrawer";
import { CheckCircleIcon, XCircleIcon, ChevronLeftIcon, ChevronRightIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function UserManagementPanel({
  users,
  planteles,
  adminRole,
  plantelesPermittedIds,
  canAssignPlantel
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

  const adminsPlanteles = adminRole === "superadmin"
    ? planteles.map(p => p.id)
    : plantelesPermittedIds || [];

  const editablePlanteles = planteles.filter(p => adminsPlanteles.includes(p.id));

  useEffect(() => { setPage(1); }, [filter, plantelFilter, roleFilter, statusFilter, activeFilter, users.length]);

  const usersFiltered = useMemo(() => {
    return (users || [])
      .filter(u =>
        (!filter || (
          String(u.name || "").toLowerCase().includes(filter.toLowerCase()) ||
          String(u.email || "").toLowerCase().includes(filter.toLowerCase())
        )) &&
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
  const paginatedUsers = useMemo(
    () => usersFiltered.slice((page - 1) * pageSize, page * pageSize),
    [usersFiltered, page, pageSize]
  );

  const selectedUserIds = useMemo(
    () => Object.entries(selection).filter(([k,v]) => v).map(([k]) => Number(k)),
    [selection]
  );
  const allSelected = paginatedUsers.length > 0 && selectedUserIds.length >= paginatedUsers.length;

  function handleSelectUser(userId, on) {
    setSelection(sel => ({ ...sel, [userId]: on }));
  }
  
  function handleSelectAll(on) {
    if (on)
      setSelection(sel => ({
        ...sel,
        ...Object.fromEntries(paginatedUsers.map(u => [u.id, true]))
      }));
    else
      setSelection(sel => {
        const ns = { ...sel };
        paginatedUsers.forEach(u => { delete ns[u.id]; });
        return ns;
      });
  }
  
  async function handleAssignPlantel(userId, plantelId) {
    setFeedback({ type: "info", message: "Asignando..." });
    try {
      const res = await fetch(`/api/admin/user/${userId}/plantel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantelId })
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error de servidor");
      setFeedback({ type: "success", message: "Plantel actualizado" });
      setTimeout(() => setFeedback({ type: null, message: "" }), 1100);
      window.location.reload();
    } catch (e) {
      setFeedback({ type: "error", message: String(e.message || e) });
    }
  }
  
  async function handleBulkAssign(plantelId) {
    setFeedback({ type: "info", message: "Asignando en lote..." });
    try {
      const res = await fetch(`/api/admin/users/assign-plantel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedUserIds, plantelId })
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error de servidor");
      setFeedback({ type: "success", message: "Usuarios asignados" });
      setTimeout(() => setFeedback({ type: null, message: "" }), 1100);
      window.location.reload();
    } catch (e) {
      setFeedback({ type: "error", message: String(e.message || e) });
    }
  }

  async function handleSetActive(userId, isActive) {
    setFeedback({ type: "info", message: isActive ? "Activando..." : "Dando de baja..." });
    try {
      const res = await fetch(`/api/admin/user/${userId}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en el estatus");
      setFeedback({ type: "success", message: isActive ? "Usuario activado" : "Usuario dado de baja" });
      setTimeout(() => setFeedback({ type: null, message: "" }), 1100);
      window.location.reload();
    } catch (e) {
      setFeedback({ type: "error", message: String(e.message || e) });
    }
  }
  
  async function handleBulkSetActive(isActive) {
    setFeedback({ type: "info", message: isActive ? "Activando..." : "Dando de baja..." });
    for (let userId of selectedUserIds) {
      await handleSetActive(userId, isActive);
    }
    setFeedback({ type: "success", message: isActive ? "Usuarios activados" : "Usuarios dados de baja" });
    setTimeout(() => setFeedback({ type: null, message: "" }), 1100);
    window.location.reload();
  }

  async function handleDelete(userId) {
    setFeedback({ type: "info", message: "Eliminando usuario..." });
    try {
      const res = await fetch(`/api/admin/user/${userId}/delete`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      setFeedback({ type: "success", message: "Usuario eliminado" });
      setTimeout(() => setFeedback({ type: null, message: "" }), 1200);
      window.location.reload();
    } catch (e) {
      setFeedback({ type: "error", message: String(e.message || e) });
    }
  }

  function handleOpenDocs(user) { setDocsDrawer({ open: true, user }); }
  function closeDocsDrawer() { setDocsDrawer({ open: false, user: null }); }
  function handleOpenFichaTecnica(user) { setFichaDrawer({ open: true, user }); }
  function closeFichaDrawer() { setFichaDrawer({ open: false, user: null }); }

  async function handleExcelExport() {
    setExporting(true);
    setFeedback({ type: "info", message: "Generando reporte..." });
    try {
      const res = await fetch(`/api/admin/users/export-excel`, {
        method: "GET",
        headers: { "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error("No se pudo generar el Excel: " + txt.slice(0, 200));
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const el = document.createElement("a");
      el.href = url;
      const today = new Date();
      el.download = `ExpedientePorPlantel_${today.toISOString().slice(0,10)}.xlsx`;
      el.style.display = "none";
      document.body.appendChild(el);
      el.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        el.remove();
      }, 750);
      setFeedback({ type: "success", message: "Descarga iniciada" });
      setExporting(false);
      setTimeout(() => setFeedback({ type: null, message: "" }), 1300);
    } catch (e) {
      setFeedback({ type: "error", message: `${e.message || e}` });
      setExporting(false);
    }
  }

  function PaginationBar() {
    return (
      <div className="w-full flex flex-wrap flex-row gap-3 justify-between items-center mt-2 mb-3 px-1 text-xs">
        <div className="flex items-center flex-wrap gap-3">
          <span className="font-semibold text-slate-700">
            Página {page} / {totalPages} <span className="hidden xs:inline">({usersFiltered.length} usuario{usersFiltered.length === 1 ? "" : "s"})</span>
          </span>
          <span className="text-slate-600 flex items-center gap-1">
            Filas:
            <select
              className="border border-slate-300 bg-white rounded-md px-1 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            className="px-3 py-1.5 rounded-md font-medium bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer disabled:opacity-50 transition"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeftIcon className="w-4 h-4 inline" />
          </button>
          <button
            className="px-3 py-1.5 rounded-md font-medium bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer disabled:opacity-50 transition"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            aria-label="Página siguiente"
          >
            <ChevronRightIcon className="w-4 h-4 inline" />
          </button>
        </div>
      </div>
    );
  }

  function ExportBar() {
    if (!["superadmin", "admin"].includes(adminRole)) return null;
    return (
      <div className="flex w-full items-center justify-end mb-3">
        <button
          type="button"
          onClick={handleExcelExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-1.5 rounded-md shadow-sm transition text-xs sm:text-sm disabled:opacity-70"
        >
          <ArrowDownTrayIcon className="w-4 h-4 text-slate-500" />
          {exporting ? "Generando reporte…" : "Exportar reporte (Excel)"}
        </button>
      </div>
    );
  }

  return (
    <div id="user-management" className="w-full bg-white border border-slate-200 shadow-sm rounded-xl p-4 sm:p-5">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Gestión de Usuarios</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 mt-2 text-sm">
          <input
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition"
            placeholder="Buscar nombre o correo..."
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          <select
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            value={plantelFilter}
            onChange={e => setPlantelFilter(e.target.value)}
          >
            <option value="">Plantel (todos)</option>
            {planteles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="all">Rol (Todos)</option>
            <option value="candidate">Candidatos</option>
            <option value="employee">Empleados</option>
          </select>
          <select
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Estatus (Todos)</option>
            <option value="ready">Listos para aprobar</option>
            <option value="employee">Aprobados</option>
            <option value="incomplete">Incompletos</option>
          </select>
          <select
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            value={activeFilter}
            onChange={e => setActiveFilter(e.target.value)}
          >
            <option value="todos">Plataforma (Todos)</option>
            <option value="activos">Sólo activos</option>
            <option value="bajas">Sólo bajas</option>
          </select>
        </div>
        {feedback.message && (
          <div className={`mt-3 px-3 py-2 rounded-md font-medium text-xs border ${feedback.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : feedback.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}>
            {feedback.type === "success" && <CheckCircleIcon className="w-4 h-4 mr-1 inline" />}
            {feedback.type === "error" && <XCircleIcon className="w-4 h-4 mr-1 inline" />}
            {feedback.message}
          </div>
        )}
      </header>
      
      <ExportBar />
      <PaginationBar />
      
      <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
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
      
      <PaginationBar />
      
      <BulkActionBar
        users={paginatedUsers}
        planteles={planteles}
        adminRole={adminRole}
        selectedUserIds={selectedUserIds}
        allSelected={allSelected}
        canAssignPlantel={canAssignPlantel}
        onBulkAssign={handleBulkAssign}
        onBulkSetActive={handleBulkSetActive}
      />
      
      <UserDocsDrawer
        open={docsDrawer.open}
        user={docsDrawer.user}
        onClose={closeDocsDrawer}
      />
      
      <UserFichaTecnicaDrawer
        open={fichaDrawer.open}
        user={fichaDrawer.user}
        planteles={planteles}
        canEdit={fichaDrawer.open && fichaDrawer.user && (adminRole === "superadmin" || adminsPlanteles.includes(fichaDrawer.user.plantelId))}
        editablePlanteles={editablePlanteles}
        onClose={closeFichaDrawer}
        isSuperadmin={adminRole === "superadmin"}
      />
    </div>
  );
}