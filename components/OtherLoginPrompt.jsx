"use client";
import Link from "next/link";
import { ShieldCheckIcon, ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/solid";

export default function OtherLoginPrompt({ forRole = "employee", className = "" }) {
  if (forRole === "admin") {
    return (
      <div className={`w-full text-center pt-6 mt-6 border-t border-[#EEF2F7] text-xs font-semibold text-slate-500 ${className}`}>
        <ArrowRightEndOnRectangleIcon className="w-4 h-4 inline mb-0.5 text-[#00A6A6] mr-1" />
        ¿Eres empleado o candidato?{" "}
        <Link href="/empleado" className="text-[#00A6A6] hover:text-[#0FB5C9] font-bold transition-colors">
          Ingresa aquí
        </Link>
      </div>
    );
  }
  return (
    <div className={`w-full text-center pt-6 mt-6 border-t border-[#EEF2F7] text-xs font-semibold text-slate-500 ${className}`}>
      <ShieldCheckIcon className="w-4 h-4 inline mb-0.5 text-[#6A3DF0] mr-1" />
      ¿Eres administrador autorizado?{" "}
      <Link href="/admin" className="text-[#6A3DF0] hover:text-[#7B4DFF] font-bold transition-colors">
        Acceso Workspace
      </Link>
    </div>
  );
}