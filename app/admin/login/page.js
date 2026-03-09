"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ShieldCheckIcon, ArrowRightEndOnRectangleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import OtherLoginPrompt from "@/components/OtherLoginPrompt";

const GSI_CLIENT_ID = process.env.NEXT_PUBLIC_GSI_CLIENT_ID;

export default function AdminLogin() {
  const router = useRouter();
  const gsiInitialized = useRef(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    function handleCredentialResponse(response) {
      if (!response || !response.credential) {
        alert("No se recibió credencial de Google, intenta de nuevo.");
        return;
      }
      setIsAuthenticating(true);
      fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            alert(data.error || "Acceso denegado");
            setIsAuthenticating(false);
            return;
          }
          router.replace("/admin/inicio");
        })
        .catch(() => {
          alert("Error de red");
          setIsAuthenticating(false);
        });
    }

    if (!window.google?.accounts?.id) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client?hl=es";
      script.async = true;
      script.defer = true;
      script.onload = initializeGIS;
      document.body.appendChild(script);
    } else {
      initializeGIS();
    }

    function initializeGIS() {
      if (!window.google?.accounts?.id || gsiInitialized.current) return;
      window.google.accounts.id.initialize({
        client_id: GSI_CLIENT_ID,
        callback: handleCredentialResponse,
        ux_mode: "popup",
        auto_select: false,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("g_id_signin"),
        {
          type: "standard",
          shape: "rectangular",
          theme: "outline",
          text: "sign_in_with",
          size: "large",
          logo_alignment: "left",
          width: 260,
          locale: "es",
        }
      );
      gsiInitialized.current = true;
    }

    return () => {
      gsiInitialized.current = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md mx-auto relative bg-white dark:bg-slate-900 shadow-xl rounded-2xl px-6 py-10 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 mb-8 select-none">
          <div className="relative w-16 h-16">
            <Image
              src="/IMAGOTIPO-IECS-IEDIS.png"
              alt="IECS-IEDIS"
              fill
              className="object-contain bg-white rounded-xl shadow-sm border border-slate-100"
              priority
            />
          </div>
          <span className="font-fredoka font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight">IECS-IEDIS</span>
        </div>
        
        <div className="flex flex-col items-center text-center mb-8">
          <span className="inline-flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white tracking-tight select-none">
            <ShieldCheckIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Acceso Administrativo
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Panel de control exclusivo para administradores autorizados.
          </p>
        </div>
        
        <div className="w-full flex flex-col items-center justify-center min-h-[50px] mb-4 relative">
          <div id="g_id_signin" className={`w-full flex flex-col items-center ${isAuthenticating ? 'hidden' : ''}`}></div>
          {isAuthenticating && (
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <ArrowPathIcon className="w-6 h-6 text-indigo-600 animate-spin" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Autenticando de forma segura...</span>
            </div>
          )}
        </div>
        
        <div className="w-full text-center text-xs mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <ArrowRightEndOnRectangleIcon className="w-4 h-4 inline mr-1 mb-0.5 text-indigo-500 dark:text-indigo-400" />
          Acceso mediante Google Workspace.
        </div>
        
        <OtherLoginPrompt forRole="admin" className="mt-4" />
      </div>
    </div>
  );
}