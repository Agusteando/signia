"use client";
import { useEffect, useMemo, useState } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon, DocumentDuplicateIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

function normalizeListInput(text) {
  if (!text) return [];
  return text.split(/\r?\n|,/g).map(s => s.trim()).filter(Boolean);
}

export default function PuestoAdminPanel() {
  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMode, setImportMode] = useState("merge");
  const [importing, setImporting] = useState(false);

  async function fetchPuestos() {
    setLoading(true); setMsg(""); setErr("");
    try {
      const r = await fetch("/api/admin/puestos/list");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo cargar");
      setPuestos(d.puestos || []);
    } catch (e) { setErr(e.message || "Error"); }
    setLoading(false);
  }

  useEffect(() => { fetchPuestos(); }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return puestos;
    const q = query.toLowerCase();
    return puestos.filter(p => p.name.toLowerCase().includes(q));
  }, [puestos, query]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true); setErr(""); setMsg("");
    try {
      const r = await fetch("/api/admin/puestos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim() }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo crear");
      setNewName(""); setMsg("Puesto agregado/activado");
      await fetchPuestos();
    } catch (e) { setErr(e.message || "Error"); }
    setAdding(false);
  }

  async function toggleActive(p, next) {
    setSavingId(p.id); setErr(""); setMsg("");
    try {
      const r = await fetch(`/api/admin/puestos/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: next }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Error");
      setMsg(next ? "Activado" : "Desactivado");
      await fetchPuestos();
    } catch (e) { setErr(e.message || "Error"); }
    setSavingId(null);
    setTimeout(() => setMsg(""), 2000);
  }

  return (
    <div className="w-full bg-white border border-[#EEF2F7] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] rounded-3xl p-8 fade-in">
      <header className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <h2 className="font-extrabold text-[#1F2937] text-xl tracking-tight">Catálogo de Puestos</h2>
        <div className="flex items-center gap-4">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar puesto..."
            className="border border-[#EEF2F7] bg-[#F6F8FB] rounded-xl px-5 py-3 text-sm w-[220px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6] transition-all font-bold text-[#1F2937]"
          />
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-[#EEF2F7] hover:bg-[#F6F8FB] text-slate-700 hover:text-[#6A3DF0] text-sm rounded-xl font-extrabold transition-all shadow-sm focus:ring-4 ring-[#6A3DF0]/20 outline-none" onClick={() => setImportOpen(true)} type="button">
            <DocumentDuplicateIcon className="w-5 h-5 stroke-2" /> Importar
          </button>
          <button className="p-3 border border-[#EEF2F7] rounded-xl text-sm hover:bg-[#F6F8FB] bg-white text-slate-500 hover:text-[#00A6A6] shadow-sm transition-all focus:ring-4 ring-[#00A6A6]/20 outline-none" onClick={fetchPuestos} type="button" title="Recargar">
            <ArrowPathIcon className="w-5 h-5 stroke-2" />
          </button>
        </div>
      </header>

      {(msg || err) && (
        <div className={`mb-6 text-center text-sm font-bold px-5 py-4 rounded-xl border flex items-center justify-center gap-3 shadow-sm ${err ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-[#00A6A6] border-[#00A6A6]/20"}`}>
          {err ? <XMarkIcon className="w-5 h-5 stroke-2"/> : <CheckCircleIcon className="w-5 h-5 stroke-2"/>}
          {err || msg}
        </div>
      )}

      <div className="w-full overflow-x-auto border border-[#EEF2F7] rounded-3xl shadow-inner bg-[#F6F8FB]/50">
        {loading ? (
          <div className="text-center p-12 text-[#00A6A6] font-extrabold text-base animate-pulse">Sincronizando catálogo...</div>
        ) : (
          <table className="min-w-full table-auto text-sm border-collapse">
            <thead>
              <tr className="bg-[#F6F8FB] border-b border-[#EEF2F7] uppercase text-[11px] tracking-widest text-slate-400">
                <th className="px-6 py-5 text-left font-bold w-1/2">Nombre Oficial del Puesto</th>
                <th className="px-6 py-5 text-left font-bold">Estatus</th>
                <th className="px-6 py-5 text-left font-bold pr-8">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-[#F6F8FB] border-b border-[#EEF2F7]">
                <td className="px-6 py-4" colSpan={3}>
                  <form onSubmit={handleAdd} className="flex gap-4 items-center w-full max-w-xl">
                    <input type="text" placeholder="Escribir nuevo puesto..." value={newName} onChange={e => setNewName(e.target.value)} className="rounded-xl border border-[#EEF2F7] px-5 py-3.5 w-full bg-white focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6] transition outline-none font-bold text-[#1F2937] shadow-sm" maxLength={80} disabled={adding} />
                    <button type="submit" className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#00A6A6] to-[#0FB5C9] text-white rounded-xl text-sm font-extrabold disabled:opacity-50 transition-all shadow-md shadow-[#00A6A6]/20 hover:shadow-lg hover:-translate-y-0.5" disabled={adding || !newName.trim()}>
                      <PlusIcon className="w-5 h-5 stroke-2" /> Agregar
                    </button>
                  </form>
                </td>
              </tr>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-[#EEF2F7] bg-transparent hover:bg-white transition-colors">
                  <td className="px-6 py-5 font-extrabold text-[#1F2937] text-base">{p.name}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-extrabold ring-1 ring-inset shadow-sm ${p.active ? "bg-emerald-50 text-[#00A6A6] ring-[#00A6A6]/20" : "bg-slate-100 text-slate-500 ring-slate-300/50"}`}>
                      {p.active ? <CheckCircleIcon className="w-4 h-4 stroke-2" /> : <XMarkIcon className="w-4 h-4 stroke-2" />}
                      {p.active ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </td>
                  <td className="px-6 py-5 pr-6">
                    <button className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${p.active ? "bg-white border-[#EEF2F7] text-slate-600 hover:bg-[#F6F8FB] hover:text-[#1F2937]" : "bg-[#00A6A6] text-white border-[#00A6A6] hover:bg-[#0FB5C9] shadow-[#00A6A6]/20 hover:-translate-y-0.5"}`} onClick={() => toggleActive(p, !p.active)} disabled={savingId === p.id}>
                      {p.active ? "Desactivar Puesto" : "Activar Puesto"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="px-6 py-12 text-center text-slate-500 font-bold bg-white text-base" colSpan={3}>No se encontraron puestos que coincidan con la búsqueda.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Import Modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 bg-[#1F2937]/50 backdrop-blur-md flex items-center justify-center p-4 fade-in">
          <div className="bg-white rounded-3xl p-10 w-full max-w-2xl border border-[#EEF2F7] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-2xl text-[#1F2937]">Importación Masiva de Puestos</h3>
              <button className="text-slate-400 hover:text-[#6A3DF0] rounded-full p-2 bg-[#F6F8FB] hover:bg-[#EEF2F7] transition" onClick={() => setImportOpen(false)} type="button">
                <XMarkIcon className="w-6 h-6 stroke-2" />
              </button>
            </div>
            <p className="text-base font-medium text-slate-500 mb-8">Pega una lista de puestos (uno por línea o separados por comas).</p>
            <div className="flex flex-col gap-6">
              <textarea
                className="w-full min-h-[220px] rounded-2xl border border-[#EEF2F7] bg-[#F6F8FB] p-6 text-base font-bold text-[#1F2937] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6A3DF0]/30 focus:border-[#6A3DF0] transition-colors leading-relaxed resize-none"
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Ejemplo:&#10;DIRECTOR GENERAL&#10;DOCENTE FRENTE A GRUPO"
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <select value={importMode} onChange={e => setImportMode(e.target.value)} className="w-full sm:flex-1 rounded-xl border border-[#EEF2F7] bg-[#F6F8FB] px-5 py-4 text-base font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#6A3DF0]/30 cursor-pointer appearance-none">
                  <option value="merge">Fusionar con catálogo actual (Recomendado)</option>
                  <option value="replace">Reemplazar TODO el catálogo</option>
                </select>
                <span className="text-sm font-bold text-[#6A3DF0] bg-purple-50 px-5 py-4 rounded-xl border border-[#6A3DF0]/20 w-full sm:w-auto text-center">
                  Detectados: {normalizeListInput(importText).length} Puestos
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-4 pt-6 border-t border-[#EEF2F7]">
                <button className="w-full sm:w-auto text-base font-bold rounded-xl px-6 py-4 border border-[#EEF2F7] bg-[#F6F8FB] text-slate-600 hover:bg-slate-200 transition" onClick={() => setImportOpen(false)} type="button" disabled={importing}>Cancelar</button>
                <button className={`w-full sm:w-auto text-base font-extrabold rounded-xl px-8 py-4 text-white shadow-lg transition-all hover:-translate-y-0.5 ${importMode === "replace" ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30" : "bg-gradient-to-r from-[#6A3DF0] to-[#7B4DFF] hover:shadow-[#6A3DF0]/30"}`} onClick={async () => {
                  const items = normalizeListInput(importText);
                  if(!items.length) return;
                  setImporting(true);
                  try {
                    await fetch("/api/admin/puestos/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, mode: importMode }) });
                    setImportOpen(false); setImportText(""); fetchPuestos();
                  } catch(e) {}
                  setImporting(false);
                }} disabled={importing || normalizeListInput(importText).length === 0}>
                  {importing ? "Procesando..." : "Importar Catálogo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}