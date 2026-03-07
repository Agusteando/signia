"use client";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
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
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToRevoke, setUserToRevoke] = useState(null);
  
  // Form states
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
    <section className="w-full bg-white border border-slate-200 shadow-sm rounded-2xl p-4 md:p-6 mb-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            Gestión de Accesos y Permisos
          </h2>
          <p className="text-sm text-slate-500 mt-1">Controla qué usuarios tienen acceso al panel de administración y sus permisos.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              placeholder="Buscar administrador..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64 transition-all" 
            />
          </div>
          <button 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm w-full sm:w-auto" 
            onClick={openAddModal}
          >
             <UserPlusIcon className="w-5 h-5" />
             Nuevo Acceso
          </button>
        </div>
      </header>

      {/* Regla de negocio de visualización rápida para los usuarios */}
      <div className="mb-5 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3 text-sm text-blue-800">
        <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
        <p>
          <strong>Nota de Seguridad:</strong> Solamente los usuarios listados a continuación tienen permiso para ingresar al Panel de Signia. 
          Si un empleado intenta acceder y no está en esta lista, su ingreso será denegado automáticamente por protección.
        </p>
      </div>
      
      {/* Table Data Render */}
      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
        <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="p-4 md:w-1/3">Usuario Autorizado</th>
              <th className="p-4 md:w-1/4">Rol y Nivel</th>
              <th className="p-4 md:w-1/3">Planteles Asignados</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr><td colSpan="4" className="text-center p-8 text-slate-500 font-medium">Cargando administradores...</td></tr>
            ) : filteredAdmins.length === 0 ? (
               <tr><td colSpan="4" className="text-center p-8 text-slate-500 font-medium">No se encontraron registros.</td></tr>
            ) : (
               filteredAdmins.map((user) => (
                 <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                   <td className="p-4">
                     <div className="flex items-center gap-3">
                       <Image src={user.picture || '/IMAGOTIPO-IECS-IEDIS.png'} alt={user.name} width={36} height={36} className="rounded-full bg-slate-200 object-cover shrink-0 border border-slate-200" />
                       <div className="min-w-0">
                         <div className="font-bold text-slate-800 truncate">{user.name}</div>
                         <div className="text-xs text-slate-500 truncate">{user.email}</div>
                       </div>
                     </div>
                   </td>
                   <td className="p-4">
                     {user.role === 'superadmin' ? (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-bold border border-purple-200">
                          <ShieldCheckIcon className="w-4 h-4"/> Superadmin
                        </span>
                     ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-200">
                          <ShieldExclamationIcon className="w-4 h-4"/> Admin
                        </span>
                     )}
                   </td>
                   <td className="p-4">
                     {user.role === 'superadmin' ? (
                        <span className="text-xs text-slate-500 italic">Acceso ilimitado y global</span>
                     ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {user.plantelesAdmin.map(p => (
                             <span key={p.id} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">{p.name}</span>
                          ))}
                          {user.plantelesAdmin.length === 0 && <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded">Sin planteles - Restringido</span>}
                        </div>
                     )}
                   </td>
                   <td className="p-4 text-right">
                     <button onClick={() => openEditModal(user)} className="text-sm text-blue-600 hover:text-blue-800 font-semibold mr-4 px-2 py-1 rounded hover:bg-blue-50 transition">
                       Editar Permisos
                     </button>
                     <button onClick={() => { setUserToRevoke(user); setIsRevokeModalOpen(true); }} className="text-sm text-red-600 hover:text-red-800 font-semibold px-2 py-1 rounded hover:bg-red-50 transition">
                       Revocar
                     </button>
                   </td>
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Edit / Add Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-lg text-slate-800">
                 {editingUser ? "Editar Permisos de Usuario" : "Otorgar Acceso Administrativo"}
               </h3>
               <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 outline-none">
                 <XMarkIcon className="w-6 h-6" />
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
               {errorMsg && (
                 <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100 font-medium">
                   {errorMsg}
                 </div>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre Completo</label>
                   <input 
                      value={formName} 
                      onChange={(e) => setFormName(e.target.value)} 
                      className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" 
                      placeholder="Ej. Juan Pérez" 
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Institucional</label>
                   <input 
                      value={formEmail} 
                      onChange={(e) => setFormEmail(e.target.value)} 
                      disabled={!!editingUser}
                      className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-60 disabled:cursor-not-allowed" 
                      placeholder="usuario@casitaiedis.edu.mx" 
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Nivel de Acceso</label>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div onClick={() => setFormRole('admin')} className={`border p-4 rounded-xl cursor-pointer transition-all ${formRole==='admin' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <div className="font-bold text-blue-900 flex items-center gap-2 mb-1">
                        <ShieldExclamationIcon className="w-5 h-5 text-blue-600" />
                        Administrador
                      </div>
                      <div className="text-xs text-slate-500 leading-tight">Acceso delimitado. Solo puede operar dentro de los planteles que se le asignen.</div>
                    </div>
                    <div onClick={() => setFormRole('superadmin')} className={`border p-4 rounded-xl cursor-pointer transition-all ${formRole==='superadmin' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                       <div className="font-bold text-purple-900 flex items-center gap-2 mb-1">
                         <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
                         Superadmin
                       </div>
                       <div className="text-xs text-slate-500 leading-tight">Acceso global y totalitario. Visibilidad sobre todo el sistema y configuraciones.</div>
                    </div>
                 </div>
               </div>
               
               {formRole === 'admin' && (
                  <div className="animate-fade-in pt-1">
                     <div className="flex items-center justify-between mb-2">
                       <label className="block text-sm font-semibold text-slate-700">Seleccionar Planteles de Acción</label>
                       <div className="flex gap-2">
                          <button type="button" onClick={handleSelectAll} className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-100 px-2 py-1 rounded">Marcar Todos</button>
                          <button type="button" onClick={handleDeselectAll} className="text-[11px] font-bold text-slate-600 hover:text-slate-800 bg-slate-200 px-2 py-1 rounded">Ninguno</button>
                       </div>
                     </div>
                     <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50 shadow-inner">
                        {data.planteles.map(p => (
                           <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                              <input 
                                type="checkbox" 
                                checked={formPlanteles.has(p.id)} 
                                onChange={() => togglePlantel(p.id)} 
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                              />
                              <span className="text-sm font-medium text-slate-800">{p.name}</span>
                           </label>
                        ))}
                     </div>
                  </div>
               )}
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
               <button onClick={closeModal} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition">Cancelar</button>
               <button 
                 onClick={handleSaveUser} 
                 disabled={isSaving || !formEmail.trim() || !formName.trim()} 
                 className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
               >
                 {isSaving ? "Guardando..." : "Guardar Accesos"}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Revoke Access Warning */}
      {isRevokeModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-100">
             <div className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                   <ExclamationTriangleIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">¿Revocar Permisos?</h3>
                <p className="text-sm text-slate-500 mb-1">
                  Se removerán los privilegios de administrador de <b>{userToRevoke?.name}</b> de manera inmediata.
                </p>
                <p className="text-xs text-slate-400">
                  Su cuenta regresará a ser un empleado estándar y no podrá ingresar a este panel. El historial de expedientes de esta persona no se borrará.
                </p>
                
                {errorMsg && <div className="mt-3 text-sm text-red-600 font-bold bg-red-50 p-2 rounded">{errorMsg}</div>}
             </div>
             <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
               <button onClick={() => { setIsRevokeModalOpen(false); setErrorMsg(""); }} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg w-full transition">
                 Cancelar
               </button>
               <button onClick={handleRevoke} disabled={isSaving} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg w-full disabled:opacity-50 transition shadow-sm">
                 {isSaving ? "Revocando..." : "Sí, Revocar"}
               </button>
             </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.25s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  );
}