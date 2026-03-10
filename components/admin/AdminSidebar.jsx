"use client";
import {
  UserGroupIcon,
  Cog8ToothIcon,
  TableCellsIcon,
  XMarkIcon,
  Bars3Icon,
  ChartPieIcon,
  ArrowsRightLeftIcon
} from "@heroicons/react/24/outline";

const navs = [
  { id: "hr-insights", label: "Analítica RRHH", icon: ChartPieIcon, isHash: true },
  { id: "user-management", label: "Usuarios y Docs", icon: UserGroupIcon, isHash: true },
  { id: "plantel-progress", label: "Reportes", icon: TableCellsIcon, isHash: true },
  { id: "ingressio", label: "Ingressio Sync", icon: ArrowsRightLeftIcon, href: "/admin/ingressio", isHash: false },
  { id: "settings", label: "Configuración", icon: Cog8ToothIcon, isHash: true },
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const header = (
    <div className="px-6 py-5 flex items-center gap-3 border-b border-slate-200/60">
      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold shadow-sm">
        S
      </div>
      <span className="font-semibold text-slate-900 text-[17px] tracking-tight">Signia</span>
      {setMobileOpen && (
        <button aria-label="Cerrar" onClick={() => setMobileOpen(false)} className="ml-auto text-slate-400 hover:text-slate-900 md:hidden transition-colors">
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  const navLinks = navs.map((n) => {
    const href = n.isHash ? `/admin/inicio#${n.id}` : n.href;
    return (
      <a
        key={n.id}
        href={href}
        onClick={() => setMobileOpen && setMobileOpen(false)}
        className="flex items-center gap-3 px-3 py-2 my-0.5 rounded-lg font-medium text-sm transition-all text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 group"
      >
        <n.icon className="w-[18px] h-[18px] text-slate-400 group-hover:text-slate-700 transition-colors" />
        {n.label}
      </a>
    );
  });

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-slate-200/80 shrink-0 sticky top-0 z-50">
        {header}
        <div className="px-3 py-4 flex-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Workspace</div>
          <nav className="flex flex-col gap-0.5">{navLinks}</nav>
        </div>
      </aside>
      
      {mobileOpen && (
        <div className="fixed z-50 inset-0 flex">
          <div className="bg-slate-900/20 backdrop-blur-sm w-full h-full absolute inset-0 transition-opacity" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-64 bg-white border-r border-slate-200 shadow-2xl h-full flex flex-col">
            {header}
            <div className="px-3 py-4 flex-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Workspace</div>
              <nav className="flex flex-col gap-0.5 overflow-y-auto">{navLinks}</nav>
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
      className="fixed z-40 bottom-6 right-6 bg-slate-900 text-white shadow-lg rounded-full p-3.5 md:hidden transition-transform active:scale-95"
    >
      <Bars3Icon className="w-6 h-6" />
    </button>
  );
}