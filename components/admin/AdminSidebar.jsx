"use client";
import {
  UserGroupIcon,
  Cog8ToothIcon,
  TableCellsIcon,
  XMarkIcon,
  Bars3Icon,
  ChartPieIcon
} from "@heroicons/react/24/outline";

const navs = [
  { id: "hr-insights", label: "Analítica RRHH", icon: ChartPieIcon },
  { id: "user-management", label: "Usuarios y Docs", icon: UserGroupIcon },
  { id: "plantel-progress", label: "Reportes", icon: TableCellsIcon },
  { id: "settings", label: "Configuración", icon: Cog8ToothIcon },
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const header = (
    <div className="px-6 py-6 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">S</div>
      <span className="font-bold text-white text-lg tracking-tight">Signia Admin</span>
      {setMobileOpen && (
        <button aria-label="Cerrar" onClick={() => setMobileOpen(false)} className="ml-auto text-slate-400 hover:text-white md:hidden">
          <XMarkIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );

  const navLinks = navs.map((n) => (
    <a
      key={n.id}
      href={`#${n.id}`}
      onClick={() => setMobileOpen && setMobileOpen(false)}
      className="flex items-center gap-3 px-3 py-2.5 my-0.5 rounded-lg font-medium text-sm transition-colors text-slate-400 hover:bg-slate-800 hover:text-white group"
    >
      <n.icon className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition" />
      {n.label}
    </a>
  ));

  return (
    <>
      {/* Sidebar Fija usando h-screen y sticky top-0, para no afectar el scroll de la página principal */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-slate-950 border-r border-slate-800 shrink-0 sticky top-0 z-50">
        {header}
        <div className="px-4 py-2 flex-1">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 px-2">Workspace</div>
          <nav className="flex flex-col gap-1">{navLinks}</nav>
        </div>
      </aside>
      
      {mobileOpen && (
        <div className="fixed z-50 inset-0 flex">
          <div className="bg-slate-900/50 backdrop-blur-sm w-full h-full absolute inset-0" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-64 bg-slate-950 border-r border-slate-800 shadow-2xl h-full flex flex-col">
            {header}
            <div className="px-4 py-2 flex-1">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 px-2">Workspace</div>
              <nav className="flex flex-col gap-1 overflow-y-auto">{navLinks}</nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AdminMobileSidebarToggle({ onClick }) {
  return (
    <button
      aria-label="Abrir menú"
      onClick={onClick}
      className="fixed z-40 bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl rounded-full p-3.5 md:hidden transition-transform active:scale-95"
    >
      <Bars3Icon className="w-6 h-6" />
    </button>
  );
}