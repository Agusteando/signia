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
          width: 280,
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F8FB] relative overflow-hidden p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6A3DF0] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-pulse pointer-events-none"></div>
      
      <div className="w-full max-w-lg mx-auto relative bg-white/80 backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] rounded-[2rem] px-10 py-14 border border-white flex flex-col items-center z-10 fade-in">
        
        <div className="flex flex-col items-center gap-4 mb-12 select-none">
          <Image
            src="/signia.png"
            alt="Signia"
            width={180}
            height={60}
            className="object-contain drop-shadow-sm"
            priority
          />
        </div>
        
        <div className="flex flex-col items-center text-center mb-10 w-full">
          <span className="inline-flex items-center justify-center gap-3 font-extrabold text-2xl text-[#1F2937] tracking-tight select-none">
            <div className="p-2.5 bg-[#F6F8FB] rounded-xl text-[#6A3DF0]">
              <ShieldCheckIcon className="w-8 h-8" />
            </div>
            Workspace Administrativo
          </span>
          <p className="text-slate-500 text-base mt-4 font-medium max-w-sm leading-relaxed">
            Panel de control avanzado y auditoría. Acceso exclusivo para directivos autorizados.
          </p>
        </div>
        
        <div className="w-full flex flex-col items-center justify-center min-h-[60px] mb-6 relative">
          <div id="g_id_signin" className={`w-full flex flex-col items-center ${isAuthenticating ? 'hidden' : ''}`}></div>
          {isAuthenticating && (
            <div className="flex flex-col items-center gap-4 bg-[#F6F8FB] w-full py-6 rounded-2xl border border-[#EEF2F7]">
              <ArrowPathIcon className="w-8 h-8 text-[#6A3DF0] animate-spin" />
              <span className="text-sm font-bold text-[#6A3DF0] tracking-wide">Autenticando conexión segura...</span>
            </div>
          )}
        </div>
        
        <div className="w-full text-center text-sm mt-6 pt-6 border-t border-[#EEF2F7] text-slate-400 font-medium flex items-center justify-center gap-2">
          <ArrowRightEndOnRectangleIcon className="w-5 h-5 text-[#00A6A6]" />
          Acceso protegido mediante Google Workspace.
        </div>
        
        <OtherLoginPrompt forRole="admin" className="mt-2" />
      </div>
    </div>
  );
}