"use client";
import { useEffect, useState, useRef } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

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
      if (!res.ok) throw new Error("Error.");
      const list = await res.json();
      setPlanteles(list);
      setDataLoaded(true);
      setMsg("");
    } catch (e) {
      setMsg("Error de conexión.");
      setDataLoaded(true);
    }
  }

  useEffect(() => { fetchPlanteles(); }, []);

  async function handleAddPlantel(e) {
    e.preventDefault();
    if (addName.trim().length < 2) return;
    setAddLoading(true); setMsg("");
    try {
      const res = await fetch("/api/admin/planteles/list", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName.trim(), label: addLabel.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setAddOpen(false); setAddName(""); setAddLabel("");
      setMsg("Plantel creado exitosamente.");
      await fetchPlanteles();
    } catch (e) { setMsg(e.message); } 
    finally { setAddLoading(false); setTimeout(()=>setMsg(""),3000); }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditLoading(true); setMsg("");
    try {
      const res = await fetch(`/api/admin/planteles/${editId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), label: editLabel.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMsg("Plantel actualizado.");
      setEditId(null); await fetchPlanteles();
    } catch (e) { setMsg(e.message); } 
    finally { setEditLoading(false); setTimeout(()=>setMsg(""),3000); }
  }

  async function handleDeleteConfirm() {
    setDeleteLoading(true); setMsg("");
    try {
      const res = await fetch(`/api/admin/planteles/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setMsg("Plantel borrado."); setDeleteId(null); await fetchPlanteles();
    } catch (e) { setMsg(e.message); } 
    finally { setDeleteLoading(false); setTimeout(()=>setMsg(""),4000); }
  }

  return (
    <div className="w-full bg-white border border-[#EEF2F7] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] rounded-2xl p-7 fade-in">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="font-extrabold text-[#1F2937] text-lg tracking-tight">Estructura Organizacional (Planteles)</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00A6A6] to-[#0FB5C9] hover:shadow-lg hover:shadow-[#00A6A6]/30 hover:-translate-y-0.5 text-white text-sm rounded-xl font-bold transition-all shadow-md focus:outline-none focus:ring-4 ring-[#0FB5C9]/50" onClick={() => setAddOpen(true)} type="button">
            <PlusIcon className="w-4 h-4 stroke-2" /> Nuevo Plantel
          </button>
          <button className="p-2 rounded-xl border border-[#EEF2F7] bg-[#F6F8FB] hover:bg-white text-slate-500 hover:text-[#6A3DF0] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#6A3DF0]/30" onClick={fetchPlanteles} title="Refrescar">
            <ArrowPathIcon className="w-5 h-5 stroke-2" />
          </button>
        </div>
      </header>
      
      {msg && (
        <div className="mb-5 text-center text-xs font-bold px-4 py-3 bg-[#F6F8FB] border border-[#EEF2F7] rounded-xl text-[#00A6A6] shadow-sm">{msg}</div>
      )}
      
      <div className="w-full overflow-x-auto border border-[#EEF2F7] rounded-2xl shadow-inner bg-[#F6F8FB]/50">
        {!dataLoaded ? (
          <div className="text-center p-8 text-[#00A6A6] font-bold text-sm animate-pulse">Sincronizando estructura...</div>
        ) : (
          <table className="min-w-full table-auto text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#F6F8FB] border-b border-[#EEF2F7] uppercase text-[10px] tracking-widest text-slate-400">
                <th className="px-5 py-4 text-left font-bold">ID Ref</th>
                <th className="px-5 py-4 text-left font-bold">Base de Datos (Key)</th>
                <th className="px-5 py-4 text-left font-bold">Nombre Público</th>
                <th className="px-5 py-4 text-left font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planteles.map((p) => (
                <tr key={p.id} className="border-b border-[#EEF2F7] hover:bg-white transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-400">#{p.id}</td>
                  <td className="px-5 py-4 font-mono text-[#6A3DF0] font-bold tracking-tight">
                    {editId === p.id ? (
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="rounded-lg border border-[#EEF2F7] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#6A3DF0]/30 font-mono shadow-sm" disabled={editLoading} autoFocus />
                    ) : p.name}
                  </td>
                  <td className="px-5 py-4 font-extrabold text-[#1F2937]">
                    {editId === p.id ? (
                      <form onSubmit={handleEditSubmit} className="flex gap-2 items-center">
                        <input type="text" value={editLabel ?? ""} onChange={e => setEditLabel(e.target.value)} className="rounded-lg border border-[#EEF2F7] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 font-bold shadow-sm" disabled={editLoading} style={{ minWidth: 160 }} />
                        <button type="submit" disabled={editLoading} className="bg-[#00A6A6] text-white py-2 px-4 rounded-lg shadow-sm text-xs font-bold hover:bg-[#0FB5C9] transition">OK</button>
                        <button type="button" className="py-2 px-4 rounded-lg bg-[#F6F8FB] text-slate-500 hover:text-[#1F2937] text-xs font-bold transition" onClick={()=>setEditId(null)}>X</button>
                      </form>
                    ) : p.label || ""}
                  </td>
                  <td className="px-5 py-4 flex gap-2">
                    <button onClick={() => { setEditId(p.id); setEditName(p.name); setEditLabel(p.label); }} className="hover:bg-[#F6F8FB] text-slate-400 hover:text-[#00A6A6] p-2 rounded-xl transition shadow-sm border border-transparent hover:border-[#EEF2F7]" aria-label="Editar">
                      <PencilSquareIcon className="w-5 h-5 stroke-2" />
                    </button>
                    <button onClick={() => setDeleteId(p.id)} className="hover:bg-rose-50 text-slate-400 hover:text-rose-600 p-2 rounded-xl transition shadow-sm border border-transparent hover:border-rose-100" aria-label="Eliminar">
                      <TrashIcon className="w-5 h-5 stroke-2" />
                    </button>
                    {deleteId === p.id && (
                      <div className="absolute right-8 bg-white border border-rose-200 shadow-xl p-4 rounded-2xl z-10 flex flex-col gap-3 animate-fade-in">
                        <span className="text-xs font-bold text-rose-600">¿Eliminar definitivamente?</span>
                        <div className="flex gap-2">
                          <button onClick={handleDeleteConfirm} disabled={deleteLoading} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition">Borrar</button>
                          <button onClick={()=>setDeleteId(null)} className="bg-[#F6F8FB] px-4 py-2 text-xs font-bold text-slate-500 hover:text-[#1F2937] rounded-xl transition">Cancelar</button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {addOpen && (
        <div className="fixed inset-0 z-50 bg-[#1F2937]/40 backdrop-blur-sm flex items-center justify-center p-4 fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-[#EEF2F7]">
            <h3 className="font-extrabold text-xl text-[#1F2937] mb-6">Crear Nuevo Plantel</h3>
            <form onSubmit={handleAddPlantel} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-[#1F2937] mb-2 block uppercase tracking-wide ml-1">Clave de Sistema (ID Lógico)</label>
                <input ref={addInputRef} type="text" className="w-full rounded-xl border border-[#EEF2F7] bg-[#F6F8FB] px-4 py-3 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 transition-colors" maxLength={80} required autoFocus value={addName} onChange={e => setAddName(e.target.value)} disabled={addLoading} placeholder="Ej: p_21_marzo" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#1F2937] mb-2 block uppercase tracking-wide ml-1">Nombre Comercial (Público)</label>
                <input type="text" className="w-full rounded-xl border border-[#EEF2F7] bg-[#F6F8FB] px-4 py-3 text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 transition-colors text-[#1F2937]" maxLength={100} required value={addLabel} onChange={e => setAddLabel(e.target.value)} disabled={addLoading} placeholder="Ej: Plantel 21 de Marzo" />
              </div>
              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-[#EEF2F7]">
                <button type="button" disabled={addLoading} className="text-sm font-bold px-5 py-3 rounded-xl bg-[#F6F8FB] hover:bg-slate-200 text-slate-500 transition" onClick={() => { setAddOpen(false); setAddName(""); setAddLabel(""); }}>Cancelar</button>
                <button type="submit" className="bg-gradient-to-r from-[#00A6A6] to-[#0FB5C9] hover:shadow-lg hover:shadow-[#00A6A6]/30 hover:-translate-y-0.5 text-white text-sm font-extrabold rounded-xl px-6 py-3 shadow-md transition-all disabled:opacity-50 disabled:transform-none" disabled={addLoading || !(addName).trim()}>
                  {addLoading ? "Creando..." : "Crear Plantel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}