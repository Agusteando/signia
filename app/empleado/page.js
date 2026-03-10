"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRightEndOnRectangleIcon, CheckCircleIcon, KeyIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import OtherLoginPrompt from "@/components/OtherLoginPrompt";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setError("");
    setSuccess(null);

    try {
      const result = await signIn("login", {
        redirect: false,
        email: form.email,
        password: form.password,
        callbackUrl: "/expediente"
      });

      setPending(false);

      if (!result.ok) {
        setError(result.error || "Usuario o contraseña incorrectos.");
        return;
      }
      setSuccess("Inicio de sesión exitoso.");
      setTimeout(() => {
        router.replace(result.url || "/expediente");
      }, 800);
    } catch (err) {
      setPending(false);
      setError("No se pudo contactar el servidor.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F8FB] relative overflow-hidden p-4">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00A6A6] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#6A3DF0] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md mx-auto relative bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] rounded-3xl px-8 py-10 border border-white flex flex-col items-center z-10 fade-in">
        
        <div className="flex flex-col items-center gap-3 mb-8 select-none">
          <Image
            src="/signia.png"
            alt="Signia"
            width={160}
            height={50}
            className="object-contain drop-shadow-sm"
            priority
          />
        </div>
        
        <span className="mx-auto mb-1 text-center inline-flex items-center gap-2 font-extrabold text-xl text-[#1F2937] tracking-tight select-none">
          <ArrowRightEndOnRectangleIcon className="w-6 h-6 text-[#00A6A6]" />
          Acceso Operativo
        </span>
        <div className="text-slate-500 text-sm font-medium text-center mb-8">
          Workspace de empleados y talento.
        </div>
        
        <div className="w-full flex flex-col items-center gap-2">
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="off">
            <div>
              <label className="font-bold text-xs text-[#1F2937] ml-1 mb-1 block uppercase tracking-wide">Correo electrónico</label>
              <input
                className="w-full rounded-xl px-4 py-3 border border-[#EEF2F7] bg-[#F6F8FB] focus:bg-white focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6] transition-all text-sm font-medium text-[#1F2937] outline-none"
                type="email"
                name="email"
                autoComplete="email"
                autoFocus
                required
                placeholder="tu@correo.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="font-bold text-xs text-[#1F2937] ml-1 mb-1 block uppercase tracking-wide">Contraseña</label>
              <input
                className="w-full rounded-xl px-4 py-3 border border-[#EEF2F7] bg-[#F6F8FB] focus:bg-white focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6] transition-all text-sm font-medium text-[#1F2937] outline-none"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <button
              className="mt-4 py-3.5 rounded-xl bg-gradient-to-r from-[#00A6A6] to-[#0FB5C9] shadow-lg shadow-[#00A6A6]/20 text-white font-extrabold text-[15px] tracking-wide transition-all duration-300 hover:shadow-xl hover:shadow-[#00A6A6]/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none flex flex-row gap-2 items-center justify-center outline-none focus-visible:ring-4 ring-[#0FB5C9]/50"
              disabled={pending}
              type="submit"
            >
              <KeyIcon className="w-5 h-5 stroke-2" />
              {pending ? "Ingresando..." : "Acceder"}
            </button>
            {error &&
              <div className="mt-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-600 font-bold text-center shadow-sm">
                {error}
              </div>
            }
            {success &&
              <div className="mt-2 px-4 py-3 rounded-xl bg-emerald-50 border border-[#00A6A6]/20 text-xs text-[#00A6A6] font-bold text-center flex flex-row items-center gap-2 justify-center shadow-sm">
                <CheckCircleIcon className="w-5 h-5" /> {success}
              </div>
            }
          </form>
        </div>
        
        <div className="w-full text-center pt-6 mt-6 border-t border-[#EEF2F7] text-xs font-semibold text-slate-500">
          <a href="/forgot-password" className="text-[#00A6A6] hover:text-[#0FB5C9] transition-colors block mb-2">
            ¿Olvidaste tu contraseña?
          </a>
          ¿Aún no tienes cuenta?{" "}
          <a href="/register" className="text-[#00A6A6] hover:text-[#0FB5C9] font-bold transition-colors">Regístrate aquí</a>
        </div>
        
        <OtherLoginPrompt forRole="employee" />
      </div>
    </div>
  );
}