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
    <section className="w-full grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <div className="bg-white rounded-xl p-3 sm:p-5 flex flex-col shadow-sm border border-slate-200 min-w-[110px]">
        <div className="flex flex-row items-center gap-1.5 sm:gap-2 text-slate-500 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
          <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0" />
          <span className="truncate">Usuarios Signia</span>
        </div>
        <div className="font-semibold text-xl sm:text-3xl tracking-tight text-slate-900">{summary.userDocsCompleted}</div>
      </div>
      <div className="bg-white rounded-xl p-3 sm:p-5 flex flex-col shadow-sm border border-slate-200 min-w-[110px]">
        <div className="flex flex-row items-center gap-1.5 sm:gap-2 text-slate-500 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
          <BuildingLibraryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
          <span className="truncate">Planteles</span>
        </div>
        <div className="font-semibold text-xl sm:text-3xl tracking-tight text-slate-900">{summary.totalPlanteles}</div>
      </div>
      <div className="bg-white rounded-xl p-3 sm:p-5 flex flex-col shadow-sm border border-slate-200 min-w-[110px]">
        <div className="flex flex-row items-center gap-1.5 sm:gap-2 text-slate-500 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
          <ClipboardDocumentListIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
          <span className="truncate">% Digitales</span>
        </div>
        <div className="font-semibold text-xl sm:text-3xl tracking-tight text-slate-900">{summary.percentDigitalExpedientes}%</div>
      </div>
      <div className="bg-white rounded-xl p-3 sm:p-5 flex flex-col shadow-sm border border-slate-200 min-w-[110px]">
        <div className="flex flex-row items-center gap-1.5 sm:gap-2 text-slate-500 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
          <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 shrink-0" />
          <span className="truncate">% Finales</span>
        </div>
        <div className="font-semibold text-xl sm:text-3xl tracking-tight text-slate-900">{summary.percentFinalExpedientes}%</div>
      </div>
      <div className="bg-white rounded-xl p-3 sm:p-5 flex flex-col shadow-sm border border-slate-200 min-w-[110px]">
        <div className="flex flex-row items-center gap-1.5 sm:gap-2 text-slate-500 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
          <DocumentPlusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 shrink-0" />
          <span className="truncate">Docs subidos</span>
        </div>
        <div className="font-semibold text-xl sm:text-3xl tracking-tight text-slate-900">{summary.totalDocuments}</div>
      </div>
    </section>
  );
}