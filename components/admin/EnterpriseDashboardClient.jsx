"use client";
import { useState } from "react";
import AdminDashboardStats from "./AdminDashboardStats";
import UserManagementPanel from "./UserManagementPanel";
import DashboardInsights from "./DashboardInsights";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

import dynamic from "next/dynamic";
const PuestoAdminPanelClient = dynamic(() => import("./PuestoAdminPanelClient"));
const PlantelSignatureNamesPanel = dynamic(() => import("./PlantelSignatureNamesPanel"));
const PlantelListAdminPanelClient = dynamic(() => import("./PlantelListAdminPanelClient"));
const PlantelAdminMatrixCrudClient = dynamic(() => import("./PlantelAdminMatrixCrudClient"));
const PlantelAdminMatrix = dynamic(() => import("./PlantelAdminMatrix"));

export default function EnterpriseDashboardClient({ session, users, planteles, allPlanteles, admins, summary }) {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [exporting, setExporting] = useState(false);

  const isSuper = session.role === "superadmin";

  const tabs = [
    { id: "usuarios", label: "Directorio & Operación" },
    { id: "insights", label: "Insights & Progreso" },
    ...(isSuper ? [{ id: "configuracion", label: "Configuración" }] : [])
  ];

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/users/export-excel`, { method: "GET" });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full min-w-0 bg-[#FAFAFA]">
      <div className="sticky top-[68px] z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm px-4 sm:px-8 pt-6 pb-0">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Panel de Control</h1>
              <p className="text-sm text-slate-500 font-medium">Resumen general de expedientes laborales</p>
            </div>
            <button 
              onClick={handleExport} disabled={exporting}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-70"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              {exporting ? "Generando..." : "Exportar Reporte"}
            </button>
          </div>

          <AdminDashboardStats summary={summary} />

          <div className="flex space-x-6 mt-6 border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 rounded-t-md" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-8 py-8">
        {activeTab === "usuarios" && (
          <UserManagementPanel
            users={users}
            planteles={planteles}
            adminRole={session.role}
            plantelesPermittedIds={isSuper ? allPlanteles.map(p => p.id) : planteles.map(p => p.id)}
            canAssignPlantel={isSuper}
            summary={summary}
          />
        )}

        {activeTab === "insights" && (
          <DashboardInsights users={users} planteles={planteles} summary={summary} />
        )}

        {activeTab === "configuracion" && isSuper && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
             <div className="flex flex-col gap-6 w-full">
                <PuestoAdminPanelClient />
                <PlantelSignatureNamesPanel />
              </div>
              <div className="flex flex-col gap-6 w-full">
                <PlantelListAdminPanelClient initialPlanteles={allPlanteles} />
                <PlantelAdminMatrixCrudClient />
              </div>
              <div className="xl:col-span-2">
                <PlantelAdminMatrix planteles={allPlanteles} admins={admins} />
              </div>
          </div>
        )}
      </div>
    </div>
  );
}