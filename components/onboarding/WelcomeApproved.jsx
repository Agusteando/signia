import Image from "next/image";

export default function WelcomeApproved({ user, onRequestBypass }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[430px] w-full fade-in px-4 pb-8">
      <div
        className="max-w-xl w-full bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_24px_64px_-12px_rgba(106,61,240,0.12)] border border-[#EEF2F7] p-10 md:p-14 flex flex-col items-center relative overflow-hidden mt-12"
      >
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6A3DF0] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00A6A6] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 pointer-events-none"></div>
        
        <Image
          src="/signia.png"
          alt="Signia"
          width={180}
          height={60}
          priority
          className="object-contain mb-8 drop-shadow-sm"
        />
        <div className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] text-center leading-tight mb-4 tracking-tight">
          ¡Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A3DF0] to-[#00A6A6]">Signia Analytics</span>!
        </div>
        <div className="text-base sm:text-lg text-slate-500 text-center mb-8 font-medium max-w-md leading-relaxed">
          Tu expediente laboral digital ha sido completado y verificado exitosamente por administración.
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full items-center justify-center relative z-10">
          <a
            href="/expediente/funciones"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00A6A6] to-[#0FB5C9] text-white font-extrabold shadow-lg shadow-[#00A6A6]/20 hover:shadow-xl hover:shadow-[#00A6A6]/30 transition-all hover:-translate-y-0.5 text-sm flex items-center justify-center tracking-wide"
          >
            📋 Funciones Operativas
          </a>
          <a
            href="https://casitaiedis.edu.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#EEF2F7] text-[#1F2937] font-extrabold shadow-sm hover:shadow-md hover:bg-[#F6F8FB] transition-all hover:-translate-y-0.5 text-sm flex items-center justify-center tracking-wide"
          >
            🌐 Portal Institucional
          </a>
        </div>
        
        {typeof onRequestBypass === "function" && (
          <div className="w-full flex flex-col items-center justify-center mt-10 pt-8 border-t border-[#EEF2F7]">
            <span className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-3">Actualización de Expediente</span>
            <button
              className="px-6 py-2.5 rounded-xl bg-[#F6F8FB] hover:bg-white border border-[#EEF2F7] hover:border-[#6A3DF0]/30 text-[#6A3DF0] font-bold shadow-sm transition-all text-sm w-full sm:w-auto focus:outline-none focus:ring-4 ring-[#6A3DF0]/20"
              onClick={onRequestBypass}
              type="button"
            >
              📝 Subir o actualizar documentos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}