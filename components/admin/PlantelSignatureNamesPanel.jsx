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
    try {
      const r = await fetch("/api/admin/planteles/list", { credentials: "same-origin" });
      if (r.ok) {
        const d = await r.json();
        setPlanteles(d || []);
      }
    } catch {}
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
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div className="w-full bg-white border border-[#EEF2F7] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] rounded-2xl p-7 fade-in">
      <header className="flex items-center justify-between mb-6">
        <h2 className="font-extrabold text-[#1F2937] text-lg tracking-tight">Firmas Oficiales por Plantel</h2>
        <button className="p-2 rounded-xl border border-[#EEF2F7] bg-[#F6F8FB] hover:bg-white text-slate-500 hover:text-[#00A6A6] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30" onClick={fetchPlanteles} title="Refrescar">
          <ArrowPathIcon className="w-5 h-5 stroke-2" />
        </button>
      </header>
      
      {msg && (
        <div className="mb-5 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-bold text-emerald-800 flex items-center gap-3 shadow-sm fade-in">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600 stroke-2" /> {msg}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12 font-bold text-[#00A6A6] bg-[#F6F8FB] rounded-2xl text-sm border border-[#EEF2F7] animate-pulse">Sincronizando catálogo de firmas...</div>
      ) : (
        <div className="overflow-x-auto border border-[#EEF2F7] rounded-2xl shadow-inner bg-[#F6F8FB]/50">
          <table className="min-w-full table-auto text-xs sm:text-sm bg-transparent border-collapse">
            <thead>
              <tr className="bg-[#F6F8FB] border-b border-[#EEF2F7] uppercase text-[10px] tracking-widest text-slate-400">
                <th className="px-5 py-4 text-left font-bold w-1/5">Plantel</th>
                <th className="px-5 py-4 text-left font-bold">Dirección</th>
                <th className="px-5 py-4 text-left font-bold">Administración</th>
                <th className="px-5 py-4 text-left font-bold">Coord. General</th>
                <th className="px-5 py-4 text-center font-bold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {planteles.map(p => (
                <tr key={p.id} className="border-b border-[#EEF2F7] hover:bg-white transition-colors">
                  <td className="px-5 py-4 font-extrabold text-[#1F2937] truncate max-w-[150px]" title={p.label || p.name}>{p.label || p.name}</td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      className="border border-[#EEF2F7] rounded-xl px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6] transition-all font-medium text-slate-800 text-sm shadow-sm"
                      defaultValue={p.direccion || ""}
                      onChange={e => handleEdit(p.id, "direccion", e.target.value)}
                      disabled={savingId === p.id}
                      maxLength={80}
                      placeholder="Nombre dirección"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      className="border border-[#EEF2F7] rounded-xl px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6] transition-all font-medium text-slate-800 text-sm shadow-sm"
                      defaultValue={p.administracion || ""}
                      onChange={e => handleEdit(p.id, "administracion", e.target.value)}
                      disabled={savingId === p.id}
                      maxLength={80}
                      placeholder="Nombre administración"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      className="border border-[#EEF2F7] rounded-xl px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6] transition-all font-medium text-slate-800 text-sm shadow-sm"
                      defaultValue={p.coordinacionGeneral || ""}
                      onChange={e => handleEdit(p.id, "coordinacionGeneral", e.target.value)}
                      disabled={savingId === p.id}
                      maxLength={80}
                      placeholder="Nombre coordinación"
                    />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleSave(p)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold flex items-center justify-center w-full gap-2 transition-all duration-300 ${
                        savingId === p.id || !isDirty[p.id] 
                          ? "bg-[#F6F8FB] cursor-not-allowed text-slate-400 border border-[#EEF2F7]" 
                          : "bg-[#00A6A6] text-white hover:bg-[#0FB5C9] shadow-md shadow-[#00A6A6]/20 hover:-translate-y-0.5"
                      }`}
                      disabled={savingId === p.id || !isDirty[p.id]}
                    >
                      <PencilSquareIcon className="w-4 h-4 stroke-2" /> Guardar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-4 text-xs text-slate-500 bg-[#F6F8FB] border-t border-[#EEF2F7] font-medium flex items-center gap-2">
            <svg className="w-4 h-4 text-[#00A6A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Estos nombres se inyectarán automáticamente como autoridades en los PDFs generados.</span>
          </div>
        </div>
      )}
    </div>
  );
}