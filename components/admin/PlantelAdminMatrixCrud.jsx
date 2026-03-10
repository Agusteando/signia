"use client";
import { useState, useEffect } from "react";
import { PlusIcon, XMarkIcon, ShieldCheckIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function PlantelAdminMatrixCrud() {
  const [data, setData] = useState({ admins: [], planteles: [] });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  
  const [open, setOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", role: "admin", plantelIds: [] });
  const [adding, setAdding] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/plantel-admin-matrix");
      if (r.ok) setData(await r.json());
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function toggleAssign(adminId, plantelId, currentStatus) {
    try {
      await fetch("/api/admin/plantel-admin-matrix/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, plantelId, assigned: !currentStatus })
      });
      loadData();
    } catch {}
  }

  async function createAdmin(e) {
    e.preventDefault();
    setAdding(true); setMsg("");
    try {
      const r = await fetch("/api/admin/plantel-admin-matrix/add-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin)
      });
      if (!r.ok) throw new Error((await r.json()).error);
      setMsg("Administrador guardado exitosamente.");
      setOpen(false);
      setNewAdmin({ name: "", email: "", role: "admin", plantelIds: [] });
      loadData();
    } catch(e) {
      setMsg(e.message || "Error al guardar");
    }
    setAdding(false);
    setTimeout(()=>setMsg(""), 3000);
  }

  async function removeAdmin(id) {
    if(!confirm("¿Revocar privilegios de administrador para este usuario? Se degradará a empleado normal.")) return;
    try {
      await fetch(`/api/admin/plantel-admin-matrix/remove-admin?id=${id}`, { method: "DELETE" });
      loadData();
    } catch {}
  }

  return (
    <div className="w-full bg-white border border-[#EEF2F7] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] rounded-3xl p-8 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
        <h2 className="font-extrabold text-[#1F2937] text-xl tracking-tight">Accesos y Privilegios</h2>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#6A3DF0] to-[#7B4DFF] hover:shadow-lg hover:shadow-[#6A3DF0]/30 hover:-translate-y-0.5 text-white text-sm rounded-xl font-bold transition-all shadow-md focus:outline-none focus:ring-4 ring-[#7B4DFF]/50 w-full sm:w-auto justify-center">
          <PlusIcon className="w-5 h-5 stroke-2" /> Nuevo Administrador
        </button>
      </div>

      {msg && (
        <div className="mb-6 px-6 py-4 rounded-xl bg-emerald-50 border border-[#00A6A6]/20 text-[#00A6A6] text-sm font-bold flex items-center gap-3 shadow-sm">
          <CheckCircleIcon className="w-6 h-6 stroke-2"/> {msg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#6A3DF0] font-extrabold text-base bg-[#F6F8FB] rounded-2xl border border-[#EEF2F7] animate-pulse">Verificando permisos de seguridad...</div>
      ) : (
        <div className="overflow-x-auto border border-[#EEF2F7] rounded-3xl shadow-inner bg-[#F6F8FB]/50">
          <table className="min-w-full table-auto text-sm border-collapse">
            <thead>
              <tr className="bg-[#F6F8FB] border-b border-[#EEF2F7] uppercase text-[11px] tracking-widest text-slate-400">
                <th className="px-6 py-5 text-left font-bold min-w-[200px]">Identidad de Administrador</th>
                <th className="px-6 py-5 text-left font-bold w-[160px]">Nivel de Rol</th>
                <th className="px-6 py-5 text-left font-bold min-w-[300px]">Planteles Asignados (Scope)</th>
                <th className="px-6 py-5 text-right font-bold pr-8">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.admins.map(a => (
                <tr key={a.id} className="border-b border-[#EEF2F7] hover:bg-white transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-extrabold text-[#1F2937] text-base mb-0.5">{a.name}</div>
                    <div className="text-xs text-slate-500 font-medium">{a.email}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-4 py-1.5 rounded-xl text-xs font-extrabold ring-1 ring-inset shadow-sm ${
                      a.role === "superadmin" ? "bg-purple-50 text-[#6A3DF0] ring-[#6A3DF0]/20" : "bg-emerald-50 text-[#00A6A6] ring-[#00A6A6]/20"
                    }`}>
                      {a.role === "superadmin" ? "SUPERADMIN" : "ADMIN"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {a.role === "superadmin" ? (
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest bg-[#F6F8FB] px-4 py-2 rounded-xl border border-[#EEF2F7]">Acceso Total (Todos)</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {data.planteles.map(p => {
                          const assigned = a.plantelesAdmin.some(x => x.id === p.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => toggleAssign(a.id, p.id, assigned)}
                              className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border transition-all shadow-sm ${
                                assigned ? "bg-[#00A6A6] text-white border-[#00A6A6] hover:bg-[#0FB5C9]" : "bg-white text-slate-500 border-[#EEF2F7] hover:bg-[#F6F8FB] hover:text-[#1F2937]"
                              }`}
                            >
                              {p.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right pr-6">
                    <button onClick={() => removeAdmin(a.id)} className="text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-sm hover:shadow-md hover:shadow-rose-600/30">
                      Revocar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-[#1F2937]/50 backdrop-blur-md flex items-center justify-center p-4 fade-in">
          <div className="bg-white rounded-3xl p-10 w-full max-w-2xl border border-[#EEF2F7] shadow-2xl">
            <h3 className="font-extrabold text-2xl text-[#1F2937] mb-8 flex items-center gap-3">
              <div className="p-3 bg-[#F6F8FB] rounded-xl text-[#6A3DF0]">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              Nuevo Acceso Administrativo
            </h3>
            <form onSubmit={createAdmin} className="flex flex-col gap-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Nombre completo</label>
                <input required value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} className="w-full rounded-xl border border-[#EEF2F7] bg-[#F6F8FB] px-5 py-4 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6A3DF0]/30 font-bold text-[#1F2937] transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Correo institucional</label>
                <input required type="email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="w-full rounded-xl border border-[#EEF2F7] bg-[#F6F8FB] px-5 py-4 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6A3DF0]/30 font-bold text-[#1F2937] transition" placeholder="nombre@casitaiedis.edu.mx" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Nivel de Seguridad (Rol)</label>
                <select value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value, plantelIds: e.target.value === 'superadmin' ? [] : newAdmin.plantelIds})} className="w-full rounded-xl border border-[#EEF2F7] bg-[#F6F8FB] px-5 py-4 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6A3DF0]/30 font-extrabold text-[#1F2937] transition cursor-pointer appearance-none">
                  <option value="admin">Administrador de Plantel (Scope Limitado)</option>
                  <option value="superadmin">Superadmin (Acceso Global Total)</option>
                </select>
              </div>
              {newAdmin.role === "admin" && (
                <div className="bg-[#F6F8FB] p-6 rounded-2xl border border-[#EEF2F7]">
                  <label className="text-xs font-bold text-[#6A3DF0] uppercase tracking-widest mb-4 block">Planteles Permitidos</label>
                  <div className="flex flex-col gap-4 max-h-56 overflow-y-auto pr-2">
                    {data.planteles.map(p => (
                      <label key={p.id} className="flex items-center gap-4 cursor-pointer group bg-white p-3 rounded-xl border border-[#EEF2F7] hover:border-[#00A6A6]/30 transition-colors shadow-sm">
                        <input type="checkbox" checked={newAdmin.plantelIds.includes(p.id)} onChange={e => {
                          const ids = e.target.checked ? [...newAdmin.plantelIds, p.id] : newAdmin.plantelIds.filter(id => id !== p.id);
                          setNewAdmin({...newAdmin, plantelIds: ids});
                        }} className="w-6 h-6 accent-[#00A6A6] border-[#EEF2F7] rounded cursor-pointer" />
                        <span className="text-sm font-extrabold text-slate-600 group-hover:text-[#1F2937] transition">{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4 pt-6 border-t border-[#EEF2F7]">
                <button type="button" onClick={() => setOpen(false)} className="px-6 py-4 rounded-xl font-bold text-slate-600 bg-[#F6F8FB] border border-[#EEF2F7] hover:bg-slate-200 transition w-full sm:w-auto">Cancelar</button>
                <button type="submit" disabled={adding} className="px-8 py-4 rounded-xl font-extrabold text-white bg-gradient-to-r from-[#6A3DF0] to-[#7B4DFF] hover:shadow-lg hover:shadow-[#6A3DF0]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 shadow-md w-full sm:w-auto">
                  {adding ? "Guardando Identidad..." : "Crear Administrador"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}