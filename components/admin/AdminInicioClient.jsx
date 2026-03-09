"use client";
import { useState } from "react";
import AdminSidebar, { AdminMobileSidebarToggle } from "@/components/admin/AdminSidebar";

export default function AdminInicioClient({
  children,
  showSidebar
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex min-h-screen w-full pt-[68px]">
        {showSidebar && (
          <>
            <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
            <AdminMobileSidebarToggle onClick={() => setMobileOpen(true)} />
          </>
        )}
        <main className="flex-1 w-full min-w-0 max-w-full flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}