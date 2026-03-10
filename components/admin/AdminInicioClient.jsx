"use client";
import { useState } from "react";
import AdminSidebar, { AdminMobileSidebarToggle } from "@/components/admin/AdminSidebar";

export default function AdminInicioClient({ children, showSidebar }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Removidos los bloqueos de scroll "h-screen" y "overflow-hidden"
  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-row">
      {showSidebar && (
        <>
          <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          <AdminMobileSidebarToggle onClick={() => setMobileOpen(true)} />
        </>
      )}
      <main className="flex-1 min-w-0 flex flex-col relative min-h-screen">
        {children}
      </main>
    </div>
  );
}