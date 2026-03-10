"use client";
import { useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { stepsExpediente } from "../stepMetaExpediente";

function getStepLabel(key) {
  const step = stepsExpediente.find(s => s.key === key);
  return step?.label || key.replace(/_/g, " ");
}

export function getMissingChecklistKeys(role, checklist = [], isActive = true) {
  if (!isActive || role !== "candidate") return [];
  const requiredKeys = stepsExpediente
    .filter(s => !s.adminUploadOnly && !s.isPlantelSelection)
    .map(s => s.key);
  const fulfilledTypes = checklist.filter(i => i.fulfilled).map(i => i.type);
  return requiredKeys.filter(key => !fulfilledTypes.includes(key));
}

export default function StatusBadgeWithTooltip({ role, readyForApproval, checklist = [], isActive = true }) {
  const [show, setShow] = useState(false);

  if (role === "employee") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 font-extrabold text-[#00A6A6] rounded-lg text-[11px] shadow-sm ring-1 ring-inset ring-[#00A6A6]/20">
        <CheckCircleIcon className="w-4 h-4 stroke-2" />Empleado
      </span>
    );
  }
  if (readyForApproval) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F6F8FB] border border-[#EEF2F7] font-extrabold text-[#6A3DF0] rounded-lg text-[11px] shadow-sm ring-1 ring-inset ring-[#6A3DF0]/20">
        <CheckCircleIcon className="w-4 h-4 stroke-2" />Listo para aprobar
      </span>
    );
  }

  const missingKeys = getMissingChecklistKeys(role, checklist, isActive);
  return (
    <span
      className="relative inline-block"
      tabIndex={0}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      onTouchStart={e => { e.stopPropagation(); setShow(s => !s); }}
    >
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] rounded-lg font-extrabold cursor-pointer select-none transition-colors hover:bg-amber-100 shadow-sm ring-1 ring-inset ring-amber-500/20">
        <ExclamationCircleIcon className="w-4 h-4 stroke-2" />
        Incompleto
      </span>
      {show && missingKeys.length > 0 && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-white border border-[#EEF2F7] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.15)] rounded-2xl p-4 text-xs fade-in">
          <div className="font-extrabold text-[#1F2937] mb-2 flex items-center gap-1.5">
            <XCircleIcon className="w-4 h-4 text-amber-500" /> Documentos Faltantes
          </div>
          <ul className="flex flex-col gap-1.5 text-slate-500 font-medium">
            {missingKeys.map(k => (
              <li key={k} className="flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span> 
                <span className="leading-tight">{getStepLabel(k)}</span>
              </li>
            ))}
          </ul>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-[#EEF2F7] transform rotate-45"></div>
        </div>
      )}
    </span>
  );
}