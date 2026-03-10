"use client";
import Image from "next/image";

export default function VisualPreview() {
  return (
    <div className="w-full max-w-[500px] h-[320px] xs:h-[380px] bg-gradient-to-br from-[#1F2937] to-[#0a0f18] rounded-3xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.2)] border border-[#EEF2F7] relative overflow-hidden flex items-center justify-center p-6 mx-auto group">
      
      {/* Abstract Map Background Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.1] pointer-events-none select-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #00A6A6 1px, transparent 0)`,
          backgroundSize: `24px 24px`
        }}
      ></div>
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#6A3DF0] mix-blend-screen filter blur-[100px] opacity-10 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-[#00A6A6] mix-blend-screen filter blur-[100px] opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      {/* Animated Radial Rings (Sonar effect) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[120px] h-[120px] border border-[#6A3DF0]/30 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
        <div className="absolute w-[220px] h-[220px] border border-[#00A6A6]/20 rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
      </div>

      {/* Centered Core Logo */}
      <div className="relative z-30 w-24 h-24 bg-white/10 backdrop-blur-md rounded-full shadow-[0_0_30px_rgba(106,61,240,0.3)] flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform duration-500">
         <Image src="/signia.png" alt="Signia" width={60} height={30} className="object-contain brightness-0 invert drop-shadow-md" />
      </div>

      {/* Floating UI Elements simulating documents and avatars */}
      <div className="absolute top-[15%] left-[20%] w-12 h-12 bg-white rounded-full border-[3px] border-[#00A6A6] shadow-lg animate-float" style={{ animationDelay: '0s' }}>
        <img src="https://i.pravatar.cc/100?img=1" className="w-full h-full rounded-full object-cover" alt="" />
      </div>
      <div className="absolute bottom-[25%] right-[15%] w-14 h-14 bg-white rounded-full border-[3px] border-[#6A3DF0] shadow-lg animate-float" style={{ animationDelay: '-1s', animationDuration: '5s' }}>
        <img src="https://i.pravatar.cc/100?img=5" className="w-full h-full rounded-full object-cover" alt="" />
      </div>
      <div className="absolute top-[30%] right-[25%] w-10 h-10 bg-white rounded-full border-[2px] border-[#0FB5C9] shadow-lg animate-float" style={{ animationDelay: '-2s', animationDuration: '3s' }}>
        <img src="https://i.pravatar.cc/100?img=9" className="w-full h-full rounded-full object-cover" alt="" />
      </div>
      <div className="absolute bottom-[20%] left-[25%] w-10 h-10 bg-white rounded-lg border border-slate-200 shadow-xl animate-float flex items-center justify-center" style={{ animationDelay: '-3s', animationDuration: '4s' }}>
        <svg className="w-5 h-5 text-[#6A3DF0]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      </div>

    </div>
  );
}