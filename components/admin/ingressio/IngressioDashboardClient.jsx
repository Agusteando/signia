"use client";
import { useState, useMemo } from "react";
import { 
  ArrowsRightLeftIcon, 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  BoltIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import ReconciliationTable from "./ReconciliationTable";
import EnrichmentDrawer from "./EnrichmentDrawer";
import AuditLogsPanel from "./AuditLogsPanel";

export default function IngressioDashboardClient({ signiaUsers }) {
  const [activeTab, setActiveTab] = useState("reconciliation");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [globalPolicy, setGlobalPolicy] = useState({
    name: "IGNORE",
    curp: "FILL_EMPTY",
    rfc: "FILL_EMPTY",
    nss: "FILL_EMPTY",
    fechaIngreso: "FILL_EMPTY",
    puesto: "IGNORE",
    email: "IGNORE",
    isActive: "IGNORE"
  });

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/ingressio/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de sincronización");
      
      setMatches(data.matches);
      
      // Auto-select 100% confidence matches by default
      const perfectMatches = data.matches
        .filter(m => m.confidence === 100 && m.signiaUser)
        .map(m => m.ingressioId);
      setSelectedIds(perfectMatches);

      setSyncResult({ success: true, count: data.matches.length, msg: "Sincronización exitosa desde Ingressio SOAP." });
    } catch (err) {
      setSyncResult({ success: false, msg: err.message });
    }
    setIsSyncing(false);
  };

  const handlePromoteRoles = async () => {
    setIsPromoting(true);
    try {
      const res = await fetch("/api/admin/ingressio/update-roles", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar roles");
      setSyncResult({ success: true, msg: `Se actualizaron ${data.count} candidatos a empleados exitosamente.` });
    } catch (err) {
      setSyncResult({ success: false, msg: err.message });
    }
    setIsPromoting(false);
  };

  const handleBulkEnrich = async () => {
    if (selectedIds.length === 0) return;
    setIsEnriching(true);
    setSyncResult(null);
    try {
      const matchesToEnrich = matches.filter(m => selectedIds.includes(m.ingressioId) && m.signiaUser);
      
      const updates = matchesToEnrich.map(m => {
        const sig = m.signiaUser;
        const inc = m.ingressioEmp;
        const payload = {};

        const applyPolicy = (field, sigVal, incVal) => {
          const pol = globalPolicy[field] || 'IGNORE';
          if (pol === 'OVERWRITE_ALWAYS' && incVal) payload[field] = incVal;
          if (pol === 'FILL_EMPTY' && !sigVal && incVal) payload[field] = incVal;
        };

        applyPolicy('name', sig.name, inc.NombreCompleto);
        applyPolicy('curp', sig.curp, inc.CURP);
        applyPolicy('rfc', sig.rfc, inc.RFC);
        applyPolicy('nss', sig.nss, inc.NIN);
        applyPolicy('fechaIngreso', sig.fechaIngreso, inc.FechaIngreso);
        applyPolicy('puesto', sig.puesto, inc.ClavePuesto || inc.ID_Puesto);
        applyPolicy('email', sig.email, inc.Correo);
        applyPolicy('isActive', sig.isActive, inc.EsActivo);

        // Always force the ingressioId link to maintain canonical identity
        payload.ingressioId = inc.ID_Empleado;

        return { signiaUserId: sig.id, payload };
      });

      const res = await fetch("/api/admin/ingressio/enrich-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en enriquecimiento masivo");
      
      setSyncResult({ success: true, msg: `Se enriquecieron ${data.count} registros exitosamente.` });
      setSelectedIds([]);
      // Re-sync to show updated data
      await handleSync();
    } catch (err) {
      setSyncResult({ success: false, msg: err.message });
    }
    setIsEnriching(false);
  };

  return (
    <div className="flex-1 w-full bg-[#f8fafc] relative pb-20 overflow-x-hidden min-h-screen">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 sm:px-10 py-5 shadow-sm border-t-4 border-t-indigo-600">
        <div className="max-w-screen-2xl mx-auto flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ArrowsRightLeftIcon className="w-7 h-7 text-indigo-600" />
              Identity Normalization & Enrichment
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Reconciliación de usuarios Signia vs. Empleados Ingressio</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handlePromoteRoles}
              disabled={isPromoting}
              className="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait"
              title="Convierte candidatos a empleados si tienen fecha de ingreso"
            >
              <UserGroupIcon className={`w-5 h-5 ${isPromoting ? "animate-pulse" : "text-indigo-600"}`} />
              {isPromoting ? "Promoviendo..." : "Auto-Promover a Empleados"}
            </button>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait"
            >
              <ArrowPathIcon className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Sincronizando SOAP..." : "Sincronizar Ingressio"}
            </button>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto mt-6 flex space-x-6">
          <button onClick={() => setActiveTab("reconciliation")} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "reconciliation" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            Reconciliación y Matches
          </button>
          <button onClick={() => setActiveTab("policy")} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "policy" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            Políticas de Sobrescritura
          </button>
          <button onClick={() => setActiveTab("audit")} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "audit" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            Auditoría e Historial
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto w-full px-6 sm:px-10 py-8">
        {syncResult && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 font-semibold text-sm shadow-sm ${syncResult.success ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"}`}>
            {syncResult.success ? <CheckCircleIcon className="w-6 h-6 text-emerald-600 shrink-0" /> : <ExclamationTriangleIcon className="w-6 h-6 text-red-600 shrink-0" />}
            {syncResult.msg}
          </div>
        )}

        {activeTab === "reconciliation" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800">Candidatos a Enlace ({matches.length})</h3>
                <p className="text-xs text-slate-500">Selecciona registros para aplicar enriquecimiento en lote.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-600">
                  {selectedIds.length} seleccionados
                </span>
                <button 
                  onClick={handleBulkEnrich}
                  disabled={selectedIds.length === 0 || isEnriching}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  <BoltIcon className="w-4 h-4" /> 
                  {isEnriching ? "Enriqueciendo..." : "Enriquecer Seleccionados"}
                </button>
              </div>
            </div>
            {matches.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">No hay datos de Ingressio. Haz clic en "Sincronizar" para importar el catálogo maestro.</div>
            ) : (
              <ReconciliationTable 
                matches={matches} 
                onSelectMatch={setSelectedMatch}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            )}
          </div>
        )}

        {activeTab === "policy" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Matriz de Selección de Campos</h3>
            <p className="text-sm text-slate-500 mb-6">Configura el comportamiento global de enriquecimiento cuando se aplique a los registros seleccionados.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <PolicyField label="Nombre, Apellidos" field="name" policy={globalPolicy} setPolicy={setGlobalPolicy} />
               <PolicyField label="CURP" field="curp" policy={globalPolicy} setPolicy={setGlobalPolicy} />
               <PolicyField label="RFC" field="rfc" policy={globalPolicy} setPolicy={setGlobalPolicy} />
               <PolicyField label="Número Seguro Social (NSS/NIN)" field="nss" policy={globalPolicy} setPolicy={setGlobalPolicy} />
               <PolicyField label="Fecha de Ingreso" field="fechaIngreso" policy={globalPolicy} setPolicy={setGlobalPolicy} />
               <PolicyField label="Puesto / ClavePuesto" field="puesto" policy={globalPolicy} setPolicy={setGlobalPolicy} />
               <PolicyField label="Correo" field="email" policy={globalPolicy} setPolicy={setGlobalPolicy} />
               <PolicyField label="Actividad (isActive)" field="isActive" policy={globalPolicy} setPolicy={setGlobalPolicy} />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
              <button 
                onClick={handleBulkEnrich}
                disabled={selectedIds.length === 0 || isEnriching}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50"
              >
                <BoltIcon className="w-5 h-5" /> 
                {isEnriching ? "Aplicando Enriquecimiento..." : `Enriquecer ${selectedIds.length} Registros`}
              </button>
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <AuditLogsPanel />
        )}
      </div>

      <EnrichmentDrawer 
        open={!!selectedMatch} 
        match={selectedMatch} 
        onClose={() => setSelectedMatch(null)} 
        onEnrichSuccess={() => { setSelectedMatch(null); handleSync(); }}
      />
    </div>
  );
}

function PolicyField({ label, field, policy, setPolicy }) {
  const value = policy[field] || "IGNORE";
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
      <div className="font-semibold text-slate-800 text-sm mb-3">{label}</div>
      <select 
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
        value={value}
        onChange={(e) => setPolicy({ ...policy, [field]: e.target.value })}
      >
        <option value="IGNORE">Ignorar (No sincronizar)</option>
        <option value="FILL_EMPTY">Rellenar sólo si está vacío</option>
        <option value="OVERWRITE_ALWAYS">Sobrescribir siempre (Manda Ingressio)</option>
      </select>
    </div>
  );
}