"use client";
import { useEffect, useMemo, useState } from "react";
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon, ClipboardIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";

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
      "INGLÉS",
      "ESPAÑOL",
      "EDUCACIÓN FÍSICA",
      "NUTRIÓLOGA",
      "PSICÓLOGO",
      "ADMINISTRACIÓN",
      "MANTENIMIENTO"
    ].join("\n");
    setImportText(sample);
  }

  return (
    <div id="puestos-admin" className="w-full bg-white border border-slate-200 shadow-sm rounded-xl p-5 mb-6">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 font-semibold text-slate-900 text-lg">
          Catálogo de Puestos
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar puesto..."
              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm w-[200px] focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"
              aria-label="Buscar puesto"
            />
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm rounded-md shadow-sm font-medium transition"
            onClick={() => setImportOpen(true)}
            type="button"
          >
            <ClipboardIcon className="w-4 h-4 text-slate-400" />
            Importar/pegar
          </button>
          <button
            className="flex items-center px-2 py-1.5 border border-slate-300 rounded-md text-sm hover:bg-slate-50 bg-white transition"
            onClick={fetchPuestos}
            type="button"
            title="Recargar"
          >
            <ArrowPathIcon className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </header>

      {(msg || err) && (
        <div className={`mb-3 text-center text-xs font-medium px-3 py-1.5 rounded-md border ${err ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
          {err || msg}
        </div>
      )}

      <div className="w-full overflow-x-auto border border-slate-200 rounded-xl">
        {loading ? (
          <div className="text-center p-6 text-slate-500 font-medium text-sm">Cargando…</div>
        ) : (
          <table className="min-w-full table-auto text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Estatus</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-slate-50 border-b border-slate-200">
                <td className="px-4 py-2" colSpan={3}>
                  <form onSubmit={handleAdd} className="flex gap-2 items-center w-full max-w-sm">
                    <input
                      type="text"
                      placeholder="Agregar nuevo puesto…"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="rounded-md border border-slate-300 px-3 py-1.5 w-full bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                      maxLength={80}
                      disabled={adding}
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium disabled:opacity-50 transition shadow-sm"
                      disabled={adding || !newName.trim()}
                    >
                      <PlusCircleIcon className="w-4 h-4" />
                      Agregar
                    </button>
                  </form>
                </td>
              </tr>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-slate-100 bg-white hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <InlineEditable
                      value={p.name}
                      onSave={(val) => rename(p, val)}
                      disabled={savingId === p.id}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${p.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {p.active ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <XMarkIcon className="w-3.5 h-3.5" />}
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <button
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${p.active ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50" : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"}`}
                        onClick={() => toggleActive(p, !p.active)}
                        disabled={savingId === p.id}
                      >
                        {p.active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-red-200 text-red-600 hover:bg-red-50 transition"
                        onClick={() => remove(p)}
                        disabled={savingId === p.id}
                      >
                        <TrashIcon className="w-4 h-4 inline mr-1" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500 bg-white" colSpan={3}>No hay puestos que coincidan con la búsqueda.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg text-slate-900">Importar lista de Puestos</h3>
              <button
                className="text-slate-400 hover:text-slate-600 rounded-full p-1.5 hover:bg-slate-100 transition"
                onClick={() => setImportOpen(false)}
                type="button"
                aria-label="Cerrar"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Pega una lista de puestos, separados por líneas o comas. Usa "Reemplazar todo" para sustituir la lista actual (los que no estén se desactivarán).
            </p>
            <div className="flex flex-col gap-3">
              <textarea
                className="w-full min-h-[180px] rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Ejemplo:
DIRECTOR ESCOLAR
COORDINADOR PEDAGÓGICO
DOCENTE"
              />
              <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Modo:</label>
                  <select
                    value={importMode}
                    onChange={e => setImportMode(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="merge">Actualizar e integrar (Merge)</option>
                    <option value="replace">Reemplazar todo</option>
                  </select>
                </div>
                <button
                  className="text-xs rounded-md px-3 py-1.5 border border-slate-300 hover:bg-slate-50 font-medium text-slate-700 transition"
                  onClick={copyTemplate}
                  type="button"
                >
                  Usar ejemplo
                </button>
                <span className="text-sm text-slate-600 ml-auto">
                  Puestos detectados: <b className="text-slate-900">{normalizeListInput(importText).length}</b>
                </span>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  className="text-sm font-medium rounded-md px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                  onClick={() => setImportOpen(false)}
                  type="button"
                  disabled={importing}
                >
                  Cancelar
                </button>
                <button
                  className={`text-sm font-medium rounded-md px-5 py-2 text-white shadow-sm transition ${importMode === "replace" ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
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
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setV(value); setEditing(false); } }}
            maxLength={80}
            autoFocus
            disabled={disabled}
          />
          <button
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
            onClick={submit}
            disabled={disabled}
          >
            Guardar
          </button>
          <button
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
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
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
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