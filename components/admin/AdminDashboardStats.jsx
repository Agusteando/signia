"use client";
import {
  UserGroupIcon,
  BuildingLibraryIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboardStats({ summary }) {
  return (
    <section className="w-full grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 gap-4">
      <div className="bg-white rounded-xl p-5 flex flex-col shadow-sm border border-slate-200 min-w-[120px]">
        <div className="flex flex-row items-center gap-2 text-slate-500 text-sm font-medium mb-3">
          <UserGroupIcon className="w-5 h-5 text-indigo-500" />
          Usuarios Signia
        </div>
        <div className="font-semibold text-2xl xs:text-3xl tracking-tight text-slate-900">{summary.userDocsCompleted}</div>
      </div>
      <div className="bg-white rounded-xl p-5 flex flex-col shadow-sm border border-slate-200 min-w-[120px]">
        <div className="flex flex-row items-center gap-2 text-slate-500 text-sm font-medium mb-3">
          <BuildingLibraryIcon className="w-5 h-5 text-blue-500" />
          Planteles
        </div>
        <div className="font-semibold text-2xl xs:text-3xl tracking-tight text-slate-900">{summary.totalPlanteles}</div>
      </div>
      <div className="bg-white rounded-xl p-5 flex flex-col shadow-sm border border-slate-200 min-w-[120px]">
        <div className="flex flex-row items-center gap-2 text-slate-500 text-sm font-medium mb-3">
          <ClipboardDocumentListIcon className="w-5 h-5 text-emerald-500" />
          Exp. Digitales
        </div>
        <div className="font-semibold text-2xl xs:text-3xl tracking-tight text-slate-900">{summary.percentDigitalExpedientes}%</div>
      </div>
      <div className="bg-white rounded-xl p-5 flex flex-col shadow-sm border border-slate-200 min-w-[120px]">
        <div className="flex flex-row items-center gap-2 text-slate-500 text-sm font-medium mb-3">
          <ShieldCheckIcon className="w-5 h-5 text-teal-500" />
          Exp. Finales
        </div>
        <div className="font-semibold text-2xl xs:text-3xl tracking-tight text-slate-900">{summary.percentFinalExpedientes}%</div>
      </div>
      <div className="bg-white rounded-xl p-5 flex flex-col shadow-sm border border-slate-200 min-w-[120px]">
        <div className="flex flex-row items-center gap-2 text-slate-500 text-sm font-medium mb-3">
          <DocumentPlusIcon className="w-5 h-5 text-purple-500" />
          Docs subidos
        </div>
        <div className="font-semibold text-2xl xs:text-3xl tracking-tight text-slate-900">{summary.totalDocuments}</div>
      </div>
    </section>
  );
}