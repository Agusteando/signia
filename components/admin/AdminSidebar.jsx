"use client";
import {
  UserGroupIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  Cog8ToothIcon,
  TableCellsIcon,
  XMarkIcon,
  Bars3Icon,
  PencilSquareIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const navs = [
  { id: "user-management", label: "Usuarios", icon: UserGroupIcon },
  { id: "plantel-progress", label: "Progreso", icon: TableCellsIcon },
  { id: "puestos-admin", label: "Puestos", icon: Squares2X2Icon },
  { id: "plantel-list-admin", label: "Planteles", icon: BuildingOffice2Icon },
  { id: "plantel-signature-names", label: "Firmas por Plantel", icon: PencilSquareIcon },
  { id: "plantel-admin-matrix-crud", label: "Admins x Plantel", icon: ShieldCheckIcon },
];

const NAVBAR_HEIGHT = 68;

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const iconSize = "w-5 h-5";
  const labelStyle = "text-sm font-medium";

  const header = (
    <header className="flex items-center gap-2 mb-2 px-5 pt-6 pb-2">
      <span className="font-extrabold text-slate-900 tracking-tight text-xl select-none">
        Admin
      </span>
      {setMobileOpen &&
        <button aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} className="ml-auto text-slate-400 hover:text-slate-600 md:hidden">
          <XMarkIcon className="w-6 h-6" />
        </button>
      }
    </header>
  );

  const navLinks = navs.map((n) => (
    <a
      key={n.id}
      href={`#${n.id}`}
      onClick={() => setMobileOpen && setMobileOpen(false)}
      className="flex items-center gap-3 px-3 py-2.5 my-0.5 rounded-md font-medium text-sm transition-colors hover:bg-slate-100 text-slate-600 hover:text-indigo-600 group"
      tabIndex={0}
    >
      <n.icon className={`${iconSize} text-slate-400 group-hover:text-indigo-600 transition shrink-0`} />
      <span className={labelStyle}>{n.label}</span>
    </a>
  ));

  const footer = (
    <footer className="flex flex-col items-stretch py-4 px-4 mt-auto border-t border-slate-200">
      <a 
        href="/admin" 
        className="text-sm py-2 px-4 font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center justify-center gap-2"
      >
        <Cog8ToothIcon className="w-5 h-5 text-slate-500" />
        Configuración
      </a>
    </footer>
  );

  return (
    <>
      <aside 
        className="hidden md:flex flex-col sticky z-40 bg-white border-r border-slate-200 shadow-sm shrink-0"
        style={{
          top: `${NAVBAR_HEIGHT}px`,
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          width: '14rem'
        }}
      >
        <div className="flex flex-col items-stretch w-full h-full">
          {header}
          <div className="px-5 py-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Panel de Control</div>
          </div>
          <nav className="flex-1 flex flex-col px-3">{navLinks}</nav>
          {footer}
        </div>
      </aside>
      
      {mobileOpen && (
        <div className="fixed z-50 inset-0 flex" style={{ top: NAVBAR_HEIGHT }}>
          <div className="bg-slate-900/50 backdrop-blur-sm w-full h-full absolute inset-0" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-64 bg-white border-r border-slate-200 shadow-2xl h-full flex flex-col">
            {header}
            <div className="px-5 py-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Panel de Control</div>
            </div>
            <nav className="flex-1 flex flex-col px-3 gap-1 overflow-y-auto">{navLinks}</nav>
            {footer}
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