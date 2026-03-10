"use client";
import { useState, useEffect } from "react";
import { PencilSquareIcon, ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

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
    <div className="w-full card-elevated p-5">
      <header className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900 text-base">Firmas de Autoridades por Plantel</h2>
        <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition" onClick={fetchPlanteles} title="Refrescar">
          <ArrowPathIcon className="w-4 h-4 text-slate-500" />
        </button>
      </header>
      
      {msg && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2 shadow-sm">
          <CheckCircleIcon className="w-4 h-4 text-emerald-600" /> {msg}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10 font-medium text-slate-500 bg-slate-50/50 rounded-xl text-sm border border-slate-100">Cargando catálogo...</div>
      ) : (
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="min-w-full table-auto text-xs sm:text-sm bg-white">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 uppercase text-[10px] tracking-wider text-slate-500">
                <th className="px-4 py-3 text-left font-medium">Plantel</th>
                <th className="px-4 py-3 text-left font-medium">Dirección</th>
                <th className="px-4 py-3 text-left font-medium">Administración</th>
                <th className="px-4 py-3 text-left font-medium">Coordinación General</th>
                <th className="px-4 py-3 text-center font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {planteles.map(p => (
                <tr key={p.id} className="border-b border-slate-100/80 hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.label || p.name}</td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      className="border border-slate-200 rounded-md px-3 py-1.5 w-full bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-colors"
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
                      className="border border-slate-200 rounded-md px-3 py-1.5 w-full bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-colors"
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
                      className="border border-slate-200 rounded-md px-3 py-1.5 w-full bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-colors"
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
                      className={`rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 mx-auto transition-colors ${
                        savingId === p.id || !isDirty[p.id] 
                          ? "bg-slate-100 cursor-not-allowed text-slate-400 border border-slate-200" 
                          : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                      }`}
                      disabled={savingId === p.id || !isDirty[p.id]}
                      title="Guardar"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" /> Guardar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 text-[11px] text-slate-500 bg-slate-50/50 border-t border-slate-100">
            <strong>Nota:</strong> Estos datos se inyectarán como autoridades en los PDFs.
          </div>
        </div>
      )}
    </div>
  );
}