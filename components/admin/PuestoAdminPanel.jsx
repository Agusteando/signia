"use client";
import { useEffect, useMemo, useState } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon, DocumentDuplicateIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

function normalizeListInput(text) {
  if (!text) return [];
  return text
    .split(/\r?\n|,/g)
    .map(s => s.trim())
    .filter(Boolean);
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
    setLoading(true);
    setMsg(""); setErr("");
    try {
      const r = await fetch("/api/admin/puestos/list");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo cargar puestos");
      setPuestos(d.puestos || []);
    } catch (e) {
      setErr(e.message || "Error");
    }
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
      const r = await fetch("/api/admin/puestos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo crear");
      setNewName("");
      setMsg("Puesto agregado/activado");
      await fetchPuestos();
    } catch (e) {
      setErr(e.message || "Error");
    }
    setAdding(false);
  }

  async function toggleActive(p, next) {
    setSavingId(p.id);
    setErr(""); setMsg("");
    try {
      const r = await fetch(`/api/admin/puestos/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo cambiar estatus");
      setMsg(next ? "Activado" : "Desactivado");
      await fetchPuestos();
    } catch (e) {
      setErr(e.message || "Error");
    }
    setSavingId(null);
  }

  async function rename(p, newLabel) {
    const name = (newLabel || "").trim();
    if (!name || name === p.name) return;
    setSavingId(p.id);
    setErr(""); setMsg("");
    try {
      const r = await fetch(`/api/admin/puestos/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo renombrar");
      setMsg("Nombre actualizado");
      await fetchPuestos();
    } catch (e) {
      setErr(e.message || "Error");
    }
    setSavingId(null);
  }

  async function remove(p) {
    if (!confirm(`¿Eliminar el puesto "${p.name}"?`)) return;
    setSavingId(p.id);
    setErr(""); setMsg("");
    try {
      const r = await fetch(`/api/admin/puestos/${p.id}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo eliminar");
      setMsg(d.deactivated ? "Puesto desactivado" : "Puesto eliminado");
      await fetchPuestos();
    } catch (e) {
      setErr(e.message || "Error");
    }
    setSavingId(null);
  }

  async function doImport() {
    const items = normalizeListInput(importText);
    if (items.length === 0) {
      setErr("Agrega al menos un puesto");
      return;
    }
    setImporting(true);
    setErr(""); setMsg("");
    try {
      const r = await fetch("/api/admin/puestos/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, mode: importMode })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo importar");
      setMsg(importMode === "replace" ? "Lista reemplazada" : "Lista actualizada");
      setImportOpen(false);
      setImportText("");
      await fetchPuestos();
    } catch (e) {
      setErr(e.message || "Error");
    }
    setImporting(false);
  }

  function copyTemplate() {
    const sample = [
      "DIRECTOR ESCOLAR",
      "COORDINADOR PEDAGÓGICO",
      "DOCENTE",
      "ADMINISTRACIÓN"
    ].join("\n");
    setImportText(sample);
  }

  return (
    <div className="w-full card-elevated p-5">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="font-semibold text-slate-900 text-base">Catálogo de Puestos</h2>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar..."
            className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-1.5 text-sm w-[160px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-colors"
          />
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm rounded-lg shadow-sm font-medium transition"
            onClick={() => setImportOpen(true)}
            type="button"
          >
            <DocumentDuplicateIcon className="w-4 h-4 text-slate-400" />
            Importar
          </button>
          <button
            className="p-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 bg-white shadow-sm transition"
            onClick={fetchPuestos}
            type="button"
            title="Recargar"
          >
            <ArrowPathIcon className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </header>

      {(msg || err) && (
        <div className={`mb-3 text-center text-xs font-medium px-3 py-2 rounded-lg border ${err ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
          {err || msg}
        </div>
      )}

      <div className="w-full overflow-x-auto border border-slate-200/80 rounded-xl">
        {loading ? (
          <div className="text-center p-6 text-slate-500 font-medium text-sm">Cargando…</div>
        ) : (
          <table className="min-w-full table-auto text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 uppercase text-[10px] tracking-wider text-slate-500">
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Estatus</th>
                <th className="px-4 py-3 text-left font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-slate-50/50 border-b border-slate-200/60">
                <td className="px-4 py-2" colSpan={3}>
                  <form onSubmit={handleAdd} className="flex gap-2 items-center w-full max-w-sm">
                    <input
                      type="text"
                      placeholder="Agregar nuevo puesto…"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 w-full bg-white focus:ring-2 focus:ring-slate-900/5 transition outline-none shadow-sm"
                      maxLength={80}
                      disabled={adding}
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition shadow-sm"
                      disabled={adding || !newName.trim()}
                    >
                      <PlusIcon className="w-4 h-4" />
                      Agregar
                    </button>
                  </form>
                </td>
              </tr>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-slate-100/80 bg-white hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <InlineEditable
                      value={p.name}
                      onSave={(val) => rename(p, val)}
                      disabled={savingId === p.id}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ring-1 ring-inset ${p.active ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10" : "bg-slate-50 text-slate-600 ring-slate-500/10"}`}>
                      {p.active ? <CheckCircleIcon className="w-3 h-3" /> : <XMarkIcon className="w-3 h-3" />}
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <button
                        className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition shadow-sm border ${p.active ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"}`}
                        onClick={() => toggleActive(p, !p.active)}
                        disabled={savingId === p.id}
                      >
                        {p.active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition shadow-sm flex items-center gap-1"
                        onClick={() => remove(p)}
                        disabled={savingId === p.id}
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500 bg-white text-sm" colSpan={3}>No hay puestos que coincidan con la búsqueda.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg text-slate-900">Importar Puestos</h3>
              <button
                className="text-slate-400 hover:text-slate-900 rounded-full p-1.5 hover:bg-slate-100 transition"
                onClick={() => setImportOpen(false)}
                type="button"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Pega una lista de puestos, separados por líneas o comas.
            </p>
            <div className="flex flex-col gap-4">
              <textarea
                className="w-full min-h-[160px] rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-colors"
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Ejemplo:
DIRECTOR ESCOLAR
COORDINADOR PEDAGÓGICO"
              />
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Modo:</label>
                  <select
                    value={importMode}
                    onChange={e => setImportMode(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                  >
                    <option value="merge">Actualizar e integrar</option>
                    <option value="replace">Reemplazar todo</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    className="text-xs rounded-md px-3 py-1.5 border border-slate-200 hover:bg-slate-50 font-medium text-slate-700 transition"
                    onClick={copyTemplate}
                    type="button"
                  >
                    Usar plantilla
                  </button>
                  <span className="text-xs text-slate-500">
                    Puestos: <b className="text-slate-900">{normalizeListInput(importText).length}</b>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  className="text-sm font-medium rounded-lg px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                  onClick={() => setImportOpen(false)}
                  type="button"
                  disabled={importing}
                >
                  Cancelar
                </button>
                <button
                  className={`text-sm font-medium rounded-lg px-5 py-2 text-white shadow-sm transition ${importMode === "replace" ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-900 hover:bg-slate-800"}`}
                  onClick={doImport}
                  type="button"
                  disabled={importing || normalizeListInput(importText).length === 0}
                >
                  {importing ? "Procesando…" : importMode === "replace" ? "Reemplazar" : "Actualizar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InlineEditable({ value, onSave, disabled }) {
  const [v, setV] = useState(value);
  const [editing, setEditing] = useState(false);
  useEffect(() => setV(value), [value]);

  function submit() {
    if (v.trim() && v.trim() !== value) onSave(v.trim());
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-2">
      {editing ? (
        <>
          <input
            value={v}
            onChange={e => setV(e.target.value)}
            className="rounded-md border border-slate-200 px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-slate-900/5 bg-white shadow-sm"
            onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setV(value); setEditing(false); } }}
            maxLength={80}
            autoFocus
            disabled={disabled}
          />
          <button
            className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
            onClick={submit}
            disabled={disabled}
          >
            Guardar
          </button>
          <button
            className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            onClick={() => { setV(value); setEditing(false); }}
            disabled={disabled}
          >
            Cancelar
          </button>
        </>
      ) : (
        <>
          <span className="font-medium text-slate-900">{value}</span>
          <button
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            onClick={() => setEditing(true)}
            disabled={disabled}
            title="Editar nombre"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}