"use client";
import { useMemo, useState } from "react";

export default function HRInsightsDashboard({ users = [], planteles = [] }) {
  const [hoveredUser, setHoveredUser] = useState(null);

  // Filter active employees with pictures for the bubble map
  const activeAvatars = useMemo(() => {
    return users
      .filter(u => u.isActive && u.role === "employee" && u.picture)
      .slice(0, 36); 
  }, [users]);

  // Calculate distinct floating positions for the bubbles using a radial distribution pattern
  const bubbles = useMemo(() => {
    return activeAvatars.map((user, i) => {
      const angle = (i / activeAvatars.length) * Math.PI * 2;
      const radius = 25 + Math.random() * 22; // Distance from center
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      
      const delay = Math.random() * -10; 
      const duration = 4 + Math.random() * 4;
      const size = 36 + Math.random() * 24; 

      return { user, x, y, delay, duration, size };
    });
  }, [activeAvatars]);

  return (
    <div className="relative w-full h-[450px] bg-gradient-to-br from-[#1F2937] to-[#0a0f18] rounded-3xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col items-center justify-center p-6 fade-in border border-[#1F2937]">
      
      {/* Abstract Map Background Grid */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none select-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #00A6A6 1px, transparent 0)`,
          backgroundSize: `32px 32px`
        }}
      ></div>
      
      {/* Ambient Glows */}
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-[#6A3DF0] rounded-full filter blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-[#00A6A6] rounded-full filter blur-[120px] opacity-20 pointer-events-none"></div>

      {/* Animated Sonar Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[200px] h-[200px] border-[2px] border-[#6A3DF0]/30 rounded-full" style={{ animation: 'pulse-ring 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
        <div className="absolute w-[350px] h-[350px] border border-[#00A6A6]/20 rounded-full" style={{ animation: 'pulse-ring 5s cubic-bezier(0.4, 0, 0.6, 1) infinite 1.5s' }}></div>
      </div>

      {/* Centered Logo */}
      <div className="relative z-30 w-36 h-36 bg-white/10 backdrop-blur-md rounded-full shadow-[0_0_60px_rgba(106,61,240,0.4)] flex items-center justify-center border border-white/20 p-5">
         <img src="/signia.png" alt="Signia" className="w-full h-auto object-contain brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
      </div>

      {/* Animated Floating Bubbles */}
      <div className="absolute inset-0 z-20">
        {bubbles.map((b, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredUser(b.user)}
            onMouseLeave={() => setHoveredUser(null)}
            className="absolute rounded-full border-2 border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)] overflow-hidden bg-[#1F2937] hover:border-[#00A6A6] hover:z-50 hover:scale-125 transition-transform duration-300 cursor-pointer"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              transform: 'translate(-50%, -50%)',
              animation: `float-bubble ${b.duration}s ease-in-out infinite alternate`,
              animationDelay: `${b.delay}s`
            }}
          >
            <img src={b.user.picture} alt={b.user.name} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
          </div>
        ))}
      </div>

      {/* Interactive Tooltip */}
      {hoveredUser && (
        <div className="absolute top-8 right-8 z-50 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl border border-white flex items-center gap-4 animate-fade-in pointer-events-none">
          <img src={hoveredUser.picture} className="w-12 h-12 rounded-full border-2 border-[#6A3DF0] object-cover" />
          <div>
            <p className="font-extrabold text-[#1F2937] leading-tight">{hoveredUser.name}</p>
            <p className="text-xs font-bold text-[#00A6A6] tracking-wide">{hoveredUser.puesto || "Colaborador Activo"}</p>
          </div>
        </div>
      )}

      {/* Overlay Data */}
      <div className="absolute bottom-8 left-8 z-30">
        <h3 className="text-white font-extrabold text-2xl tracking-tight drop-shadow-md">Ecosistema Signia</h3>
        <p className="text-white/70 text-sm font-medium tracking-wide">Densidad organizacional en tiempo real</p>
      </div>

      <div className="absolute bottom-8 right-8 z-30 flex items-center gap-3">
        <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-bold text-sm shadow-lg">
          <span className="text-[#00A6A6]">{users.filter(u=>u.role==="employee").length}</span> Empleados
        </div>
        <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-bold text-sm shadow-lg">
          <span className="text-[#6A3DF0]">{planteles.length}</span> Planteles
        </div>
      </div>
    </div>
  );
}