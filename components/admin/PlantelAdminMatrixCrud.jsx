"use client";
import { useEffect, useState, useMemo } from "react";
import {
  ShieldCheckIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { ShieldExclamationIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export default function GestorAccesosAdmin() {
  const [data, setData] = useState({ admins: [], planteles: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToRevoke, setUserToRevoke] = useState(null);
  
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("admin");
  const [formPlanteles, setFormPlanteles] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plantel-admin-matrix", { credentials: "same-origin" });
      if (res.ok) {
        const d = await res.json();
        setData({ admins: d.admins || [], planteles: d.planteles || [] });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const filteredAdmins = useMemo(() => {
    if (!search.trim()) return data.admins;
    const q = search.trim().toLowerCase();
    return data.admins.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));
  }, [data.admins, search]);

  const openAddModal = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("admin");
    setFormPlanteles(new Set());
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormPlanteles(new Set(user.plantelesAdmin.map(p => p.id)));
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const togglePlantel = (id) => {
    setFormPlanteles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => setFormPlanteles(new Set(data.planteles.map(p => p.id)));
  const handleDeselectAll = () => setFormPlanteles(new Set());

  const handleSaveUser = async () => {
    setIsSaving(true);
    setErrorMsg("");
    try {
      if (editingUser) {
        const res = await fetch("/api/admin/plantel-admin-matrix", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingUser.id,
            role: formRole,
            plantelIds: Array.from(formPlanteles)
          })
        });
        if (!res.ok) throw new Error((await res.json()).error || "Error al actualizar");
      } else {
        const res = await fetch("/api/admin/plantel-admin-matrix/add-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            role: formRole,
            plantelIds: Array.from(formPlanteles)
          })
        });
        if (!res.ok) throw new Error((await res.json()).error || "Error al agregar");
      }
      setIsModalOpen(false);
      await fetchMatrix();
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevoke = async () => {
    setIsSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/admin/plantel-admin-matrix/remove-admin?id=${userToRevoke.id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error al revocar");
      setIsRevokeModalOpen(false);
      setUserToRevoke(null);
      await fetchMatrix();
    } catch(e) {
      setErrorMsg(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="plantel-admin-matrix-crud" className="w-full bg-white border border-slate-200 shadow-sm rounded-xl p-4 sm:p-5 mb-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
            Accesos y Permisos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Controla quiénes administran qué planteles.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
            <input 
              placeholder="Buscar..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-48 transition-all" 
            />
          </div>
          <button 
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm w-full sm:w-auto shrink-0" 
            onClick={openAddModal}
          >
             <UserPlusIcon className="w-4 h-4" />
             Nuevo Acceso
          </button>
        </div>
      </header>

      <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-indigo-800">
        <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-600" />
        <p>
          Únicamente los usuarios listados a continuación tienen el privilegio de acceder a este panel.
        </p>
      </div>
      
      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
        <table className="min-w-[600px] w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
            <tr>
              <th className="px-3 py-2.5 w-1/3">Administrador</th>
              <th className="px-3 py-2.5 w-1/5">Rol</th>
              <th className="px-3 py-2.5 w-1/3">Planteles Asignados</th>
              <th className="px-3 py-2.5 text-right">Opciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr><td colSpan="4" className="text-center py-6 text-slate-500 font-medium">Cargando...</td></tr>
            ) : filteredAdmins.length === 0 ? (
               <tr><td colSpan="4" className="text-center py-6 text-slate-500 font-medium">No se encontraron cuentas activas.</td></tr>
            ) : (
               filteredAdmins.map((user) => (
                 <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                   <td className="px-3 py-2">
                     <div className="flex items-center gap-2.5">
                       <img 
                         src={user.picture || '/IMAGOTIPO-IECS-IEDIS.png'} 
                         alt="" 
                         width={28} 
                         height={28} 
                         className="rounded-full bg-slate-100 object-cover shrink-0 border border-slate-200 shadow-sm"
                         onError={(e) => { e.target.onerror = null; e.target.src = "/IMAGOTIPO-IECS-IEDIS.png"; }}
                       />
                       <div className="min-w-0">
                         <div className="font-semibold text-slate-900 truncate text-xs">{user.name}</div>
                         <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                       </div>
                     </div>
                   </td>
                   <td className="px-3 py-2">
                     {user.role === 'superadmin' ? (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-purple-200">
                          <ShieldCheckIcon className="w-3.5 h-3.5"/> Superadmin
                        </span>
                     ) : (
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-indigo-200">
                          <ShieldExclamationIcon className="w-3.5 h-3.5"/> Admin Local
                        </span>
                     )}
                   </td>
                   <td className="px-3 py-2">
                     {user.role === 'superadmin' ? (
                        <span className="text-[10px] text-slate-500 font-medium">Acceso global</span>
                     ) : (
                        <div className="flex flex-wrap gap-1">
                          {user.plantelesAdmin.map(p => (
                             <span key={p.id} className="bg-white text-slate-700 px-1.5 py-0.5 rounded-md text-[10px] font-medium border border-slate-200">{p.name}</span>
                          ))}
                          {user.plantelesAdmin.length === 0 && <span className="text-[10px] text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200">Sin planteles</span>}
                        </div>
                     )}
                   </td>
                   <td className="px-3 py-2 text-right">
                     <button onClick={() => openEditModal(user)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium mr-1.5 px-2 py-1 rounded-md hover:bg-indigo-50 transition">
                       Editar
                     </button>
                     <button onClick={() => { setUserToRevoke(user); setIsRevokeModalOpen(true); }} className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition">
                       Revocar
                     </button>
                   </td>
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
               <h3 className="font-semibold text-base text-slate-900">
                 {editingUser ? "Configurar Permisos" : "Conceder Autorización"}
               </h3>
               <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 outline-none rounded-full p-1 hover:bg-slate-100 transition">
                 <XMarkIcon className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
               {errorMsg && (
                 <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 font-medium">
                   {errorMsg}
                 </div>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre</label>
                   <input 
                      value={formName} 
                      onChange={(e) => setFormName(e.target.value)} 
                      className="w-full border border-slate-300 bg-white rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition shadow-sm" 
                      placeholder="Ej. Juan Pérez" 
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo</label>
                   <input 
                      value={formEmail} 
                      onChange={(e) => setFormEmail(e.target.value)} 
                      disabled={!!editingUser}
                      className="w-full border border-slate-300 bg-white rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition shadow-sm disabled:opacity-60 disabled:bg-slate-100" 
                      placeholder="usuario@casitaiedis.edu.mx" 
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Nivel</label>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div onClick={() => setFormRole('admin')} className={`border p-3 rounded-xl cursor-pointer transition-all ${formRole==='admin' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-300'}`}>
                      <div className="font-semibold text-indigo-900 flex items-center gap-1.5 mb-1 text-sm">
                        <ShieldExclamationIcon className="w-4 h-4 text-indigo-600" />
                        Administrador
                      </div>
                      <div className="text-[11px] text-slate-500 leading-relaxed">Limitado a planteles autorizados.</div>
                    </div>
                    <div onClick={() => setFormRole('superadmin')} className={`border p-3 rounded-xl cursor-pointer transition-all ${formRole==='superadmin' ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-slate-200 bg-white hover:border-purple-300'}`}>
                       <div className="font-semibold text-purple-900 flex items-center gap-1.5 mb-1 text-sm">
                         <ShieldCheckIcon className="w-4 h-4 text-purple-600" />
                         Superadmin
                       </div>
                       <div className="text-[11px] text-slate-500 leading-relaxed">Acceso a todo el sistema.</div>
                    </div>
                 </div>
               </div>
               
               {formRole === 'admin' && (
                  <div className="pt-1">
                     <div className="flex items-center justify-between mb-1.5">
                       <label className="block text-sm font-medium text-slate-700">Asignación de Planteles</label>
                       <div className="flex gap-2">
                          <button type="button" onClick={handleSelectAll} className="text-[10px] font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded">Todos</button>
                          <button type="button" onClick={handleDeselectAll} className="text-[10px] font-medium text-slate-600 hover:text-slate-800 bg-slate-200 px-2 py-0.5 rounded">Ninguno</button>
                       </div>
                     </div>
                     <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-1.5 space-y-0.5 bg-white shadow-inner">
                        {data.planteles.map(p => (
                           <label key={p.id} className="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded-md cursor-pointer transition-colors border border-transparent">
                              <input 
                                type="checkbox" 
                                checked={formPlanteles.has(p.id)} 
                                onChange={() => togglePlantel(p.id)} 
                                className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                              />
                              <span className="text-xs font-medium text-slate-800">{p.name}</span>
                           </label>
                        ))}
                     </div>
                  </div>
               )}
            </div>
            
            <div className="px-5 py-3 border-t border-slate-100 bg-white flex justify-end gap-2.5">
               <button onClick={closeModal} className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition border border-transparent">Cancelar</button>
               <button 
                 onClick={handleSaveUser} 
                 disabled={isSaving || !formEmail.trim() || !formName.trim()} 
                 className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 transition-colors shadow-sm"
               >
                 {isSaving ? "Guardando..." : "Guardar Accesos"}
               </button>
            </div>
          </div>
        </div>
      )}

      {isRevokeModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-100">
             <div className="p-5 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
                   <ExclamationTriangleIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">¿Revocar privilegios?</h3>
                <p className="text-xs text-slate-600 mb-3">
                  Se anularán los derechos de <b>{userToRevoke?.name}</b> de forma inmediata.
                </p>
                <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                  La cuenta volverá al rol estándar. Los expedientes se conservarán intactos.
                </p>
                
                {errorMsg && <div className="mt-3 text-xs text-red-700 font-medium bg-red-50 p-2 rounded-md w-full">{errorMsg}</div>}
             </div>
             <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex gap-2">
               <button onClick={() => { setIsRevokeModalOpen(false); setErrorMsg(""); }} className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md w-full transition shadow-sm">
                 Cancelar
               </button>
               <button onClick={handleRevoke} disabled={isSaving} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md w-full disabled:opacity-50 transition shadow-sm">
                 {isSaving ? "Ejecutando..." : "Sí, Revocar"}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}