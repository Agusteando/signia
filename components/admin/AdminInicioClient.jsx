"use client";
import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function AdminInicioClient({ children, showSidebar }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#F6F8FB] text-[#1F2937] font-sans flex flex-row">
      {showSidebar && (
        <>
          <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          
          {/* Mobile Toggle Button integrated directly to prevent hook issues */}
          <button
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(true)}
            className="fixed z-40 bottom-6 right-6 bg-gradient-to-br from-[#6A3DF0] to-[#7B4DFF] text-white shadow-xl shadow-[#6A3DF0]/30 rounded-full p-4 md:hidden transition-all active:scale-95 focus:outline-none focus:ring-4 ring-[#7B4DFF]/50"
          >
            <Bars3Icon className="w-6 h-6 stroke-2" />
          </button>
        </>
      )}
      <main className="flex-1 min-w-0 flex flex-col relative min-h-screen">
        {children}
      </main>
    </div>
  );
}