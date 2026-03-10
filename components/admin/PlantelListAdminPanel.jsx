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
    setMsg("Sincronizando...");
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
    <div className="w-full bg-white border border-[#EEF2F7] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] rounded-3xl p-8 fade-in">
      <header className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <h2 className="font-extrabold text-[#1F2937] text-xl tracking-tight">Estructura Organizacional (Planteles)</h2>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#00A6A6] to-[#0FB5C9] hover:shadow-lg hover:shadow-[#00A6A6]/30 hover:-translate-y-0.5 text-white text-sm rounded-xl font-bold transition-all shadow-md focus:outline-none focus:ring-4 ring-[#0FB5C9]/50" onClick={() => setAddOpen(true)} type="button">
            <PlusIcon className="w-5 h-5 stroke-2" /> Nuevo Plantel
          </button>
          <button className="p-3 rounded-xl border border-[#EEF2F7] bg-[#F6F8FB] hover:bg-white text-slate-500 hover:text-[#6A3DF0] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#6A3DF0]/30" onClick={fetchPlanteles} title="Refrescar">
            <ArrowPathIcon className="w-5 h-5 stroke-2" />
          </button>
        </div>
      </header>
      
      {msg && (
        <div className="mb-6 text-center text-sm font-bold px-5 py-4 bg-[#F6F8FB] border border-[#EEF2F7] rounded-xl text-[#00A6A6] shadow-sm fade-in">{msg}</div>
      )}
      
      <div className="w-full overflow-x-auto border border-[#EEF2F7] rounded-2xl shadow-inner bg-[#F6F8FB]/50">
        {!dataLoaded ? (
          <div className="text-center p-12 text-[#00A6A6] font-extrabold text-base animate-pulse">Sincronizando estructura...</div>
        ) : (
          <table className="min-w-full table-auto text-sm border-collapse">
            <thead>
              <tr className="bg-[#F6F8FB] border-b border-[#EEF2F7] uppercase text-[11px] tracking-widest text-slate-400">
                <th className="px-6 py-5 text-left font-bold">ID Lógico</th>
                <th className="px-6 py-5 text-left font-bold">Base de Datos (Key)</th>
                <th className="px-6 py-5 text-left font-bold w-1/2">Nombre Comercial</th>
                <th className="px-6 py-5 text-right font-bold pr-8">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planteles.map((p) => (
                <tr key={p.id} className="border-b border-[#EEF2F7] hover:bg-white transition-colors">
                  <td className="px-6 py-5 font-extrabold text-slate-400">#{p.id}</td>
                  <td className="px-6 py-5 font-mono text-[#6A3DF0] font-bold tracking-tight">
                    {editId === p.id ? (
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full rounded-xl border border-[#EEF2F7] px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#6A3DF0]/30 font-mono shadow-sm" disabled={editLoading} autoFocus minWidth={180} />
                    ) : p.name}
                  </td>
                  <td className="px-6 py-5 font-extrabold text-[#1F2937] text-base">
                    {editId === p.id ? (
                      <form onSubmit={handleEditSubmit} className="flex gap-3 items-center">
                        <input type="text" value={editLabel ?? ""} onChange={e => setEditLabel(e.target.value)} className="w-full rounded-xl border border-[#EEF2F7] px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 font-bold shadow-sm" disabled={editLoading} minWidth={240} />
                        <button type="submit" disabled={editLoading} className="bg-[#00A6A6] text-white py-3 px-5 rounded-xl shadow-md text-sm font-bold hover:bg-[#0FB5C9] transition">Guardar</button>
                        <button type="button" className="py-3 px-5 rounded-xl bg-[#F6F8FB] text-slate-500 hover:text-[#1F2937] border border-[#EEF2F7] text-sm font-bold transition" onClick={()=>setEditId(null)}>Cancelar</button>
                      </form>
                    ) : p.label || ""}
                  </td>
                  <td className="px-6 py-5 text-right pr-6 relative">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setEditId(p.id); setEditName(p.name); setEditLabel(p.label); }} className="hover:bg-[#F6F8FB] text-slate-400 hover:text-[#00A6A6] p-2.5 rounded-xl transition-all shadow-sm border border-transparent hover:border-[#EEF2F7]" aria-label="Editar">
                        <PencilSquareIcon className="w-5 h-5 stroke-2" />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="hover:bg-rose-50 text-slate-400 hover:text-rose-600 p-2.5 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100" aria-label="Eliminar">
                        <TrashIcon className="w-5 h-5 stroke-2" />
                      </button>
                    </div>
                    {deleteId === p.id && (
                      <div className="absolute right-12 top-2 bg-white border border-rose-200 shadow-2xl p-6 rounded-3xl z-10 flex flex-col gap-4 animate-fade-in w-72 text-left">
                        <span className="text-sm font-extrabold text-rose-600">¿Eliminar este plantel?</span>
                        <span className="text-xs text-slate-500 font-medium">Esta acción es irreversible y requiere reasignar a todos los empleados de este plantel primero.</span>
                        <div className="flex flex-col gap-2 mt-2">
                          <button onClick={handleDeleteConfirm} disabled={deleteLoading} className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all">Eliminar Definitivamente</button>
                          <button onClick={()=>setDeleteId(null)} className="bg-[#F6F8FB] px-5 py-3 text-sm font-bold text-slate-500 hover:text-[#1F2937] rounded-xl transition-all border border-[#EEF2F7]">Cancelar</button>
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
        <div className="fixed inset-0 z-50 bg-[#1F2937]/50 backdrop-blur-md flex items-center justify-center p-4 fade-in">
          <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl border border-[#EEF2F7]">
            <h3 className="font-extrabold text-2xl text-[#1F2937] mb-8">Crear Nuevo Plantel</h3>
            <form onSubmit={handleAddPlantel} className="flex flex-col gap-6">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-widest">Clave de Sistema (ID Lógico)</label>
                <input ref={addInputRef} type="text" className="w-full rounded-xl border border-[#EEF2F7] bg-[#F6F8FB] px-5 py-4 text-base font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 transition-colors" maxLength={80} required autoFocus value={addName} onChange={e => setAddName(e.target.value)} disabled={addLoading} placeholder="Ej: p_21_marzo" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-widest">Nombre Comercial (Público)</label>
                <input type="text" className="w-full rounded-xl border border-[#EEF2F7] bg-[#F6F8FB] px-5 py-4 text-base font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 transition-colors text-[#1F2937]" maxLength={100} required value={addLabel} onChange={e => setAddLabel(e.target.value)} disabled={addLoading} placeholder="Ej: Plantel 21 de Marzo" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4 pt-6 border-t border-[#EEF2F7]">
                <button type="button" disabled={addLoading} className="text-sm font-bold px-6 py-4 rounded-xl bg-[#F6F8FB] border border-[#EEF2F7] hover:bg-slate-200 text-slate-600 transition w-full sm:w-auto" onClick={() => { setAddOpen(false); setAddName(""); setAddLabel(""); }}>Cancelar</button>
                <button type="submit" className="bg-gradient-to-r from-[#00A6A6] to-[#0FB5C9] hover:shadow-lg hover:shadow-[#00A6A6]/30 hover:-translate-y-0.5 text-white text-sm font-extrabold rounded-xl px-8 py-4 shadow-md transition-all disabled:opacity-50 disabled:transform-none w-full sm:w-auto" disabled={addLoading || !(addName).trim()}>
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