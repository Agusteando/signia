"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import LogoutButton from "@/components/LogoutButton";
import { useState, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function UserTopNav() {
  const { data: session } = useSession();
  const user = session?.user;
  const [open, setOpen] = useState(false);
  const popRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (!popRef.current) return;
      if (!popRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handler);
    window.addEventListener("touchstart", handler);
    return () => {
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("touchstart", handler);
    };
  }, [open]);

  if (!user) return null;

  const nameParts = (user.name || "").trim().split(" ");
  const shortName =
    nameParts.length >= 3
      ? nameParts.slice(0, 2).join(" ") + " " + nameParts[2]
      : nameParts.join(" ");
  const avatarSrc = user.picture || "/IMAGOTIPO-IECS-IEDIS.png";

  return (
    <>
      <nav className="
        fixed top-0 left-0 z-50 w-full
        bg-white/80 backdrop-blur-2xl border-b border-[#EEF2F7]
        shadow-[0_4px_24px_-8px_rgba(0,0,0,0.04)]
        flex items-center
        h-[64px] sm:h-[76px]
        px-4 sm:px-8
        justify-between
      ">
        <div className="flex items-center min-w-0">
          <Image
            src="/signia.png"
            alt="Signia"
            width={120}
            height={40}
            priority
            className="w-[80px] sm:w-[120px] h-auto object-contain drop-shadow-sm"
            draggable={false}
          />
        </div>
        <div className="flex-1 flex min-w-0 md:hidden justify-center">
          <span
            className="font-extrabold text-[#1F2937] text-sm xs:text-base leading-tight
                       truncate max-w-[140px] xs:max-w-[200px] text-center"
            title={user.name}
          >
            {shortName}
          </span>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            aria-label="Cuenta"
            title="Cuenta"
            className="
              block md:hidden relative focus:outline-none
              w-10 h-10 xs:w-11 xs:h-11 rounded-full p-0 shadow-sm
              bg-[#F6F8FB] border-2 border-white
              flex items-center justify-center focus:ring-4 focus:ring-[#6A3DF0]/30
              hover:scale-105 transition-transform"
            onClick={() => setOpen((s) => !s)}
          >
            <Image
              src={avatarSrc}
              alt={user.name}
              width={48} height={48}
              className="rounded-full object-cover bg-white w-full h-full"
              draggable={false}
            />
          </button>
          <div className="hidden md:flex flex-row items-center gap-4">
            <div className="flex flex-col items-end justify-center min-w-0">
              <span className="
                font-extrabold text-[#1F2937] leading-tight text-sm
                max-w-[260px] truncate
              ">
                {user.name}
              </span>
              <span className="
                text-[11px] font-bold text-[#00A6A6]
                leading-tight truncate max-w-[220px]"
                >
                WORKSPACE OPERATIVO
              </span>
            </div>
            <Image
              src={avatarSrc}
              alt={user.name}
              width={44} height={44}
              className="rounded-full object-cover bg-white border-2 border-[#F6F8FB] shadow-sm w-11 h-11"
              draggable={false}
            />
            <LogoutButton className="
              ml-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#6A3DF0] to-[#7B4DFF]
              text-white shadow-md shadow-[#6A3DF0]/20 border-0 hover:shadow-lg hover:shadow-[#6A3DF0]/30 hover:-translate-y-0.5
              transition-all duration-300
            " />
          </div>
        </div>
      </nav>
      
      {open && (
        <div className="fixed inset-0 z-[60] bg-[#1F2937]/40 backdrop-blur-sm flex items-start justify-end md:hidden">
          <div className="
            w-full max-w-xs ml-auto mt-[70px] xs:mt-[80px] mr-4
            bg-white rounded-3xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] border border-[#EEF2F7]
            flex flex-col items-center px-6 py-8 gap-4 fade-in
          " ref={popRef}>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="absolute top-4 right-4 bg-[#F6F8FB] hover:bg-[#EEF2F7] rounded-full p-2 transition-colors text-slate-500 hover:text-[#1F2937]"
            >
              <XMarkIcon className="w-5 h-5 stroke-2" />
            </button>
            <Image
              src={avatarSrc}
              alt={user.name}
              width={80}
              height={80}
              className="rounded-full object-cover border-4 border-white shadow-md bg-white mt-2"
              draggable={false}
            />
            <div className="w-full text-lg font-extrabold text-[#1F2937] text-center break-words leading-tight">{user.name}</div>
            <div className="w-full text-xs font-bold text-[#00A6A6] tracking-widest uppercase text-center break-all">Workspace Operativo</div>
            <LogoutButton className="
              w-full justify-center text-sm py-3.5 px-6 rounded-xl mt-4
              bg-gradient-to-r from-[#6A3DF0] to-[#7B4DFF]
              font-bold text-white shadow-md shadow-[#6A3DF0]/20 border-0
              hover:shadow-lg transition-all
            " />
          </div>
        </div>
      )}
    </>
  );
}