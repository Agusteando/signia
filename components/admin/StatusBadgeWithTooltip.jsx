"use client";
import { useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 font-medium text-emerald-700 rounded-md text-[11px]">
        <CheckCircleIcon className="w-3.5 h-3.5" />Empleado
      </span>
    );
  }
  if (readyForApproval) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 font-medium text-indigo-700 rounded-md text-[11px]">
        <CheckCircleIcon className="w-3.5 h-3.5" />Listo para aprobar
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] rounded-md font-medium cursor-pointer select-none transition hover:bg-amber-100">
        <ExclamationCircleIcon className="w-3.5 h-3.5" />
        Incompleto
      </span>
      {