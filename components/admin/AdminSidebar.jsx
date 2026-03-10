"use client";
import {
  UserGroupIcon,
  Cog8ToothIcon,
  TableCellsIcon,
  XMarkIcon,
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
    <div className="px-6 py-7 flex items-center justify-center border-b border-[#EEF2F7] bg-white relative">
      <img src="/signia.png" alt="Signia Analytics" className="w-32 h-auto object-contain" style={{ maxWidth: '120px' }} />
      {setMobileOpen && (
        <button aria-label="Cerrar" onClick={() => setMobileOpen(false)} className="absolute right-4 top-5 text-slate-400 hover:text-[#1F2937] md:hidden transition-colors p-2">
          <XMarkIcon className="w-6 h-6" />
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
        className="flex items-center gap-3 px-4 py-3 my-1 rounded-xl font-bold text-[14px] transition-all text-slate-500 hover:bg-[#F6F8FB] hover:text-[#6A3DF0] group border border-transparent hover:border-[#EEF2F7]"
      >
        <n.icon className="w-[20px] h-[20px] text-slate-400 group-hover:text-[#6A3DF0] transition-colors" />
        {n.label}
      </a>
    );
  });

  return (
    <>
      <aside className="hidden md:flex flex-col w-[280px] h-screen bg-white border-r border-[#EEF2F7] shrink-0 sticky top-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {header}
        <div className="px-4 py-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4">Workspace</div>
            <nav className="flex flex-col gap-1">{navLinks}</nav>
          </div>
        </div>
      </aside>
      
      {mobileOpen && (
        <div className="fixed z-50 inset-0 flex md:hidden">
          <div className="bg-[#1F2937]/40 backdrop-blur-sm w-full h-full absolute inset-0 transition-opacity" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-[280px] bg-white border-r border-[#EEF2F7] shadow-2xl h-full flex flex-col">
            {header}
            <div className="px-4 py-6 flex-1 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4">Workspace</div>
              <nav className="flex flex-col gap-1">{navLinks}</nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}