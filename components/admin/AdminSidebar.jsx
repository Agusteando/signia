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
import Image from "next/image";

const navs = [
  { id: "hr-insights", label: "Analítica General", icon: ChartPieIcon, isHash: true },
  { id: "user-management", label: "Directorio & Expedientes", icon: UserGroupIcon, isHash: true },
  { id: "plantel-progress", label: "Progreso Operativo", icon: TableCellsIcon, isHash: true },
  { id: "ingressio", label: "Sincronización Ingressio", icon: ArrowsRightLeftIcon, href: "/admin/ingressio", isHash: false },
  { id: "settings", label: "Configuración Signia", icon: Cog8ToothIcon, isHash: true },
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const header = (
    <div className="px-6 py-6 flex items-center justify-between gap-3">
      <Image 
        src="/signia.png" 
        alt="Signia" 
        width={120} 
        height={40} 
        className="object-contain drop-shadow-sm" 
        priority 
      />
      {setMobileOpen && (
        <button 
          aria-label="Cerrar" 
          onClick={() => setMobileOpen(false)} 
          className="text-slate-400 hover:text-slate-900 md:hidden transition-colors"
        >
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
        className="group relative flex items-center gap-3 px-4 py-3 my-1 rounded-xl font-semibold text-sm transition-all text-slate-500 hover:text-[#6A3DF0] hover:bg-[#6A3DF0]/5 overflow-hidden"
      >
        {/* Active/Hover line indicator */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#6A3DF0] to-[#00A6A6] scale-y-0 group-hover:scale-y-100 transition-transform origin-left rounded-r-md" />
        <n.icon className="w-5 h-5 text-slate-400 group-hover:text-[#6A3DF0] transition-colors" />
        {n.label}
      </a>
    );
  });

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[280px] h-screen bg-[#F6F8FB] border-r border-slate-200/60 shrink-0 sticky top-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
        {header}
        <div className="px-4 py-2 flex-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4">Workspace</div>
          <nav className="flex flex-col">{navLinks}</nav>
        </div>
        
        {/* Brand footer watermark */}
        <div className="p-6 opacity-30 pointer-events-none">
          <Image src="/IMAGOTIPO-IECS-IEDIS.png" width={140} height={40} alt="IECS" className="grayscale" />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed z-50 inset-0 flex md:hidden">
          {/* Backdrop blur */}
          <div 
            className="bg-slate-900/40 backdrop-blur-sm w-full h-full absolute inset-0 transition-opacity" 
            onClick={() => setMobileOpen(false)} 
          />
          {/* Drawer menu */}
          <div className="relative z-10 w-[280px] bg-[#F6F8FB] border-r border-slate-200 shadow-2xl h-full flex flex-col">
            {header}
            <div className="px-4 py-2 flex-1 overflow-y-auto">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4">Workspace</div>
              <nav className="flex flex-col gap-0.5">{navLinks}</nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------
// EXPORT RESTORED: AdminMobileSidebarToggle
// Styled with the new Signia brand gradients
// ----------------------------------------------------
export function AdminMobileSidebarToggle({ onClick }) {
  return (
    <button
      aria-label="Abrir menú"
      onClick={onClick}
      className="fixed z-40 bottom-6 right-6 bg-gradient-to-r from-[#6A3DF0] to-[#00A6A6] text-white shadow-[0_8px_24px_rgba(106,61,240,0.4)] rounded-full p-3.5 md:hidden transition-transform active:scale-95 hover:shadow-[0_12px_28px_rgba(106,61,240,0.5)]"
    >
      <Bars3Icon className="w-6 h-6" />
    </button>
  );
}