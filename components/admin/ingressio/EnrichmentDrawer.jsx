"use client";
import { useState } from "react";
import { XMarkIcon, ShieldCheckIcon, DocumentDuplicateIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function EnrichmentDrawer({ open, match, onClose, onEnrichSuccess }) {
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState("");

  if (!open || !match) return null;

  const inc = match.ingressioEmp;
  const sig = match.signiaUser || {};

  const fieldsToCompare = [
    { key: "name", label: "Nombre", signia: sig.name, ingressio: inc.NombreCompleto },
    { key: "curp", label: "CURP", signia: sig.curp, ingressio: inc.CURP },
    { key: "rfc", label: "RFC", signia: sig.rfc, ingressio: inc.RFC },
    { key: "nss", label: "NSS", signia: sig.nss, ingressio: inc.NIN },
    { key: "email", label: "Correo", signia: sig.email, ingressio: inc.Correo },
    { key: "puesto", label: "Puesto", signia: sig.puesto, ingressio: inc.ClavePuesto || inc.ID_Puesto },
    { key: "isActive", label: "Activo", signia: sig.isActive ? "Sí" : "No", ingressio: inc.EsActivo ? "Sí" : "No" },
  ];

  const handleApply = async () => {
    if (!match.signiaUser) {
      setError("No se puede enriquecer un registro sin un enlace a un usuario de Signia.");
      return;
    }
    setEnriching(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ingressio/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signiaUserId: sig.id,
          ingressioId: inc.ID_Empleado,
          payload: {
            curp: inc.CURP,
            rfc: inc.RFC,
            nss: inc.NIN,
            puesto: inc.ClavePuesto || inc.ID_Puesto,
            ingressioId: inc.ID_Empleado
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fallo al enriquecer");
      onEnrichSuccess();
    } catch (e) {
      setError(e.message);
    }
    setEnriching(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-fade-in relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition">
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheckIcon className="w-6 h-6 text-indigo-600" /> Confirmar Enlace de Identidad
          </h2>
          <p className="text-sm text-slate-500 mt-1">Revisa las diferencias entre Ingressio y Signia antes de fusionar los datos.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Score de Confianza</span>
              <span className="text-3xl font-black text-indigo-600">{match.confidence}%</span>
            </div>
            <div className="text-sm text-indigo-700 text-right font-medium max-w-[50%]">
              Razón: {match.reason}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Campo</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 border-l border-slate-200 bg-white">Valor en Signia</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 border-l border-slate-200 bg-indigo-50/50">Valor Ingressio (Entrante)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fieldsToCompare.map((f, i) => {
                  const s = f.signia || "—";
                  const c = f.ingressio || "—";
                  const conflict = s !== "—" && c !== "—" && String(s).toLowerCase() !== String(c).toLowerCase();

                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-600">{f.label}</td>
                      <td className={`px-4 py-3 border-l border-slate-200 ${conflict ? 'text-amber-700 bg-amber-50/30' : 'text-slate-800'}`}>{s}</td>
                      <td className={`px-4 py-3 border-l border-slate-200 bg-indigo-50/10 ${conflict ? 'font-bold text-indigo-700' : 'text-slate-800'}`}>
                        {c}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-3 font-semibold">
              <ExclamationCircleIcon className="w-5 h-5" /> {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-white flex items-center justify-between">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">
            Cancelar
          </button>
          <button 
            onClick={handleApply}
            disabled={enriching || !match.signiaUser}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <DocumentDuplicateIcon className="w-5 h-5" />
            {enriching ? "Aplicando..." : "Confirmar Match y Enriquecer"}
          </button>
        </div>
      </div>
    </div>
  );
}