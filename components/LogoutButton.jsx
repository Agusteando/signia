"use client";

import { useRouter } from "next/navigation";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function LogoutButton({ className = "" }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!session?.user) return null;

  const handleLogout = async (e) => {
    e.preventDefault();
    setLoading(true);

    const role = session?.user?.role;
    if (role === "admin" || role === "superadmin") {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {}
      setTimeout(() => {
        router.replace("/admin");
        router.refresh();
      }, 100);
    } else {
      await signOut({ callbackUrl: "/empleado" });
    }
    setLoading(false);
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#6A3DF0] to-[#7B4DFF] text-white font-bold text-sm shadow-md shadow-[#6A3DF0]/20 hover:shadow-lg hover:shadow-[#6A3DF0]/30 hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-4 focus:ring-[#7B4DFF]/50 outline-none disabled:opacity-70 disabled:transform-none ${className}`}
      style={{ minWidth: 0 }}
      onClick={handleLogout}
      disabled={loading}
      title="Cerrar sesión"
    >
      <ArrowRightOnRectangleIcon className="w-5 h-5 stroke-2" />
      <span className="hidden xs:inline">Cerrar sesión</span>
    </button>
  );
}