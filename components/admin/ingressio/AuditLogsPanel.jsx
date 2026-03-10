"use client";
export default function AuditLogsPanel() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
      <div className="text-slate-400 font-medium text-lg">Historial de Auditoría</div>
      <p className="text-slate-500 mt-2 text-sm">El registro de cambios inmutables se mostrará aquí una vez que se completen las primeras sincronizaciones, indicando el usuario, fecha y valores sobreescritos.</p>
    </div>
  );
}