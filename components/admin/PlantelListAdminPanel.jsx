"use client";
import { useEffect, useState, useRef } from "react";
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export default function PlantelListAdminPanel() {
  const [planteles, setPlanteles] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addLabel, setAddLabel] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const addInputRef = useRef();

  async function fetchPlanteles() {
    setMsg("Cargando...");
    try {
      const res = await fetch("/api/admin/planteles/list", { credentials: "same-origin" });
      if (!res.ok) throw new Error("No se pudo cargar planteles.");
      const list = await res.json();
      setPlanteles(list);
      setDataLoaded(true);
      setMsg("");
    } catch (e) {
      setMsg("No se pudo actualizar.");
      setDataLoaded(true);
    }
  }

  useEffect(() => {
    fetchPlanteles();
  }, []);

  async function handleAddPlantel(e) {
    e.preventDefault();
    if (addName.trim().length < 2) {
      setMsg("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if ((addLabel || "").trim().length < 2) {
      setMsg("La etiqueta debe tener al menos 2 caracteres.");
      return;
    }
    setAddLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/planteles/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName.trim(), label: addLabel.trim() }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudo agregar plantel");
      }
      setAddOpen(false);
      setAddName("");
      setAddLabel("");
      setMsg("Plantel agregado correctamente.");
      await fetchPlanteles();
    } catch (e) {
      setMsg(e.message || "Error al agregar");
    } finally {
      setAddLoading(false);
    }
  }

  function handleEditOpen(id, name, label) {
    setEditId(id);
    setEditName(name || "");
    setEditLabel(label || "");
  }
  function handleEditCancel() {
    setEditId(null);
    setEditName("");
    setEditLabel("");
  }
  async function handleEditSubmit(e) {
    e.preventDefault();
    if ((editName || "").trim().length < 2) return setMsg("Nombre interno inválido.");
    if ((editLabel || "").trim().length < 2) return setMsg("Etiqueta inválida.");
    setEditLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/planteles/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: editName.trim(), label: editLabel.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudo renombrar plantel");
      }
      setMsg("Plantel actualizado.");
      setEditId(null); setEditName(""); setEditLabel("");
      await fetchPlanteles();
    } catch (e) {
      setMsg(e.message || "Error al renombrar");
    } finally {
      setEditLoading(false);
    }
  }
  function handleDeleteTry(id) {
    setDeleteId(id);
    setMsg("Confirma para borrar (acción irreversible)");
  }
  function handleDeleteCancel() {
    setDeleteId(null); setMsg("");
  }
  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleteLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/planteles/${deleteId}`, {
        method: "DELETE",
        credentials: "same-origin"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudo borrar plantel");
      }
      setMsg("Plantel eliminado.");
      setDeleteId(null);
      await fetchPlanteles();
    } catch (e) {
      setMsg(e.message || "Error al borrar");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div id="plantel-list-admin" className="w-full bg-white border border-slate-200 shadow-sm rounded-xl p-5 mb-6">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 font-semibold text-slate-900 text-lg">
          <span>Administrar Planteles</span>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 transition text-white text-sm rounded-md shadow-sm font-medium"
            onClick={() => setAddOpen(true)}
            type="button"
            aria-label="Agregar nuevo plantel"
          >
            <PlusCircleIcon className="w-4 h-4 text-white" /> Nuevo Plantel
          </button>
        </div>
        <button className="p-1.5 rounded-md hover:bg-slate-100 transition" aria-label="Recargar" onClick={fetchPlanteles} title="Refrescar">
          <ArrowPathIcon className="w-4 h-4 text-slate-500" />
        </button>
      </header>
      
      {msg && (
        <div className="mb-4 text-center text-sm font-medium px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">{msg}</div>
      )}
      
      <div className="w-full overflow-x-auto border border-slate-200 rounded-xl">
        {!dataLoaded ? (
          <div className="text-center p-8 text-slate-500 font-medium text-sm bg-slate-50">Cargando datos&hellip;</div>
        ) : (
          <table className="min-w-full table-auto text-xs sm:text-sm bg-white">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Nombre interno</th>
                <th className="px-4 py-3 text-left font-semibold">Nombre comercial</th>
                <th className="px-4 py-3 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planteles.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-600">{p.id}</td>
                  <td className="px-4 py-3 font-mono text-slate-800">
                    {editId === p.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        disabled={editLoading}
                        autoFocus
                        style={{ minWidth: 120 }}
                        maxLength={80}
                        aria-label="Nuevo nombre del plantel"
                      />
                    ) : (
                      p.name
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {editId === p.id ? (
                      <form onSubmit={handleEditSubmit} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={editLabel ?? ""}
                          onChange={e => setEditLabel(e.target.value)}
                          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          disabled={editLoading}
                          style={{ minWidth: 140 }}
                          maxLength={100}
                          aria-label="Nueva etiqueta"
                        />
                        <button
                          type="submit"
                          disabled={editLoading || !(editLabel || "").trim()}
                          className="bg-indigo-600 text-white py-1.5 px-3 rounded-md shadow-sm text-xs font-medium hover:bg-indigo-700 transition"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          className="py-1.5 px-3 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition"
                          onClick={handleEditCancel}
                          disabled={editLoading}
                        >
                          Cancelar
                        </button>
                      </form>
                    ) : (
                      p.label || ""
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-1.5">
                    <button
                      onClick={() => handleEditOpen(p.id, p.name, p.label)}
                      className="hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 p-1.5 rounded-md transition"
                      title="Editar plantel"
                      aria-label="Editar"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTry(p.id)}
                      className="hover:bg-red-50 text-slate-400 hover:text-red-600 p-1.5 rounded-md transition"
                      title="Eliminar plantel"
                      aria-label="Eliminar"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    {deleteId === p.id && (
                      <span className="ml-3 flex gap-2 items-center bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                        <button
                          onClick={handleDeleteConfirm}
                          disabled={deleteLoading}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md font-medium text-xs shadow-sm transition"
                          type="button"
                        >
                          Sí, Borrar
                        </button>
                        <button
                          onClick={handleDeleteCancel}
                          className="text-xs font-medium px-2 py-1 text-slate-600 hover:text-slate-900 transition"
                          type="button"
                        >
                          Cancelar
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {addOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl px-7 py-8 max-w-sm w-full shadow-2xl border border-slate-200 flex flex-col items-center">
            <h3 className="font-semibold text-lg text-slate-900 mb-4">Agregar Nuevo Plantel</h3>
            <form onSubmit={handleAddPlantel} className="w-full flex flex-col items-stretch gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nombre interno (administrativo)</label>
                <input
                  ref={addInputRef}
                  type="text"
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  maxLength={80}
                  required
                  autoFocus
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  disabled={addLoading}
                  placeholder="Ej: centro_21_marzo"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nombre comercial</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  maxLength={100}
                  required
                  value={addLabel}
                  onChange={e => setAddLabel(e.target.value)}
                  disabled={addLoading}
                  placeholder="Ej: Plantel 21 de Marzo"
                />
              </div>
              <div className="flex gap-3 justify-end items-center mt-2">
                <button
                  type="button"
                  disabled={addLoading}
                  className="text-sm font-medium px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                  onClick={() => { setAddOpen(false); setAddName(""); setAddLabel(""); }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md px-5 py-2 shadow-sm transition disabled:opacity-50"
                  disabled={addLoading || !(addName || "").trim() || !(addLabel || "").trim()}
                >
                  {addLoading ? "Guardando..." : "Crear Plantel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}