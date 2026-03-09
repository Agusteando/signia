"use client";
import { useState, useEffect } from "react";
import { PencilSquareIcon, ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

export default function PlantelSignatureNamesPanel() {
  const [planteles, setPlanteles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [edit, setEdit] = useState({});
  const [isDirty, setIsDirty] = useState({});

  async function fetchPlanteles() {
    setLoading(true);
    setMsg("");
    const r = await fetch("/api/admin/planteles/list", { credentials: "same-origin" });
    const d = await r.json();
    setPlanteles(d || []);
    setLoading(false);
  }

  useEffect(() => { fetchPlanteles(); }, []);

  function handleEdit(id, field, value) {
    setEdit(e => ({ ...e, [id]: { ...e[id], [field]: value } }));
    setIsDirty(d => ({ ...d, [id]: true }));
  }

  async function handleSave(plantel) {
    setSavingId(plantel.id);
    setMsg("");
    const data = {
      direccion: edit[plantel.id]?.direccion ?? plantel.direccion ?? "",
      administracion: edit[plantel.id]?.administracion ?? plantel.administracion ?? "",
      coordinacionGeneral: edit[plantel.id]?.coordinacionGeneral ?? plantel.coordinacionGeneral ?? "",
    };
    try {
      const resp = await fetch(`/api/admin/planteles/${plantel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(data),
      });
      if (!resp.ok) throw new Error((await resp.json()).error || "Error al guardar");
      setMsg(`Guardado exitosamente: "${plantel.label || plantel.name}"`);
      setIsDirty(d => ({ ...d, [plantel.id]: false }));
      await fetchPlanteles();
    } catch (e) {
      setMsg(e.message || "Error guardando");
    }
    setSavingId(null);
  }

  return (
    <div id="plantel-signature-names" className="w-full bg-white border border-slate-200 shadow-sm rounded-xl p-5 mb-6">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-semibold text-slate-900 text-lg">
          <span>Firmas de Autoridades por Plantel</span>
        </div>
        <button className="p-1.5 rounded-md hover:bg-slate-100 transition" aria-label="Recargar" onClick={fetchPlanteles} title="Refrescar">
          <ArrowPathIcon className="w-5 h-5 text-slate-400" />
        </button>
      </header>
      
      {msg && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600" /> {msg}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12 font-medium text-slate-500 bg-slate-50 rounded-xl border border-slate-100">Cargando catálogo...</div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="min-w-full table-auto text-xs sm:text-sm bg-white">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="px-4 py-3 text-left font-semibold">Plantel</th>
                <th className="px-4 py-3 font-semibold text-left">Dirección</th>
                <th className="px-4 py-3 font-semibold text-left">Administración</th>
                <th className="px-4 py-3 font-semibold text-left">Coordinación General</th>
                <th className="px-4 py-3 font-semibold text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {planteles.map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.label || p.name}</td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      className="border border-slate-300 rounded-md px-3 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      defaultValue={p.direccion || ""}
                      onChange={e => handleEdit(p.id, "direccion", e.target.value)}
                      disabled={savingId === p.id}
                      maxLength={80}
                      placeholder="Nombre dirección"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      className="border border-slate-300 rounded-md px-3 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      defaultValue={p.administracion || ""}
                      onChange={e => handleEdit(p.id, "administracion", e.target.value)}
                      disabled={savingId === p.id}
                      maxLength={80}
                      placeholder="Nombre administración"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      className="border border-slate-300 rounded-md px-3 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      defaultValue={p.coordinacionGeneral || ""}
                      onChange={e => handleEdit(p.id, "coordinacionGeneral", e.target.value)}
                      disabled={savingId === p.id}
                      maxLength={80}
                      placeholder="Nombre coordinación"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleSave(p)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium text-white flex items-center gap-1.5 mx-auto transition-colors ${
                        savingId === p.id || !isDirty[p.id] 
                          ? "bg-slate-300 cursor-not-allowed text-slate-500" 
                          : "bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                      }`}
                      disabled={savingId === p.id || !isDirty[p.id]}
                      title="Guardar"
                    >
                      <PencilSquareIcon className="w-4 h-4" /> Guardar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 text-xs text-slate-500 bg-slate-50 border-t border-slate-100">
            <strong>Tip:</strong> Estos datos se inyectarán automáticamente como firmas institucionales en los documentos PDF generados.
          </div>
        </div>
      )}
    </div>
  );
}