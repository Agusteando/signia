"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import { SparklesIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/solid";

export default function HRInsightsDashboard({ users, planteles }) {
  // Generate random stable positions for avatar bubbles
  const avatarBubbles = useMemo(() => {
    const validUsers = users.filter(u => u.picture && u.isActive).slice(0, 14);
    return validUsers.map((user, i) => {
      const size = Math.random() > 0.6 ? 56 : 40;
      const animation = i % 3 === 0 ? 'animate-float' : i % 2 === 0 ? 'animate-float-delayed' : 'animate-float-slow';
      return {
        ...user,
        size,
        animation,
        top: `${15 + Math.random() * 60}%`,
        left: `${10 + Math.random() * 75}%`,
      };
    });
  }, [users]);

  const completionRate = Math.round((users.filter(u => u.fullyCompleted).length / (users.length || 1)) * 100);

  return (
    <div className="card-signia bg-white w-full p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-10">
      
      {/* Background Gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-signia-purple opacity-[0.08] blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-signia-teal opacity-[0.08] blur-[100px] rounded-full pointer-events-none" />

      {/* Left Content */}
      <div className="relative z-10 w-full lg:w-5/12 flex flex-col">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00A6A6]/10 text-[#00A6A6] text-xs font-bold w-fit mb-6">
          <SparklesIcon className="w-4 h-4" /> Inteligencia de Red
        </div>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          Conectando el talento <br/> en todo <span className="text-gradient-signia">IECS-IEDIS</span>
        </h2>
        <p className="text-slate-500 font-medium text-base mb-8">
          Actualmente gestionas un ecosistema de {users.length} colaboradores distribuidos en {planteles.length} planteles. El {completionRate}% tiene su expediente completamente normalizado.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-signia-purple/30 hover:bg-white transition-all cursor-default group">
            <span className="block text-3xl font-black text-slate-900 group-hover:text-signia-purple transition-colors">{users.filter(u=>u.role==='employee').length}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Empleados Activos</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-signia-teal/30 hover:bg-white transition-all cursor-default group">
            <span className="block text-3xl font-black text-slate-900 group-hover:text-signia-teal transition-colors">{planteles.length}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Centros de Trabajo</span>
          </div>
        </div>
      </div>

      {/* Right Content: Avatar Constellation */}
      <div className="relative z-10 w-full lg:w-7/12 h-[320px] lg:h-[380px] bg-slate-50/50 border border-white/50 rounded-3xl shadow-inner overflow-hidden">
        {/* Center Anchor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full shadow-xl border border-slate-100 flex items-center justify-center z-20">
          <Image src="/signia.png" alt="Signia" width={50} height={50} className="object-contain" />
        </div>
        
        {/* Floating Employee Bubbles */}
        {avatarBubbles.map((bubble, i) => (
          <div 
            key={i} 
            className={`absolute z-10 group cursor-crosshair ${bubble.animation}`}
            style={{ top: bubble.top, left: bubble.left }}
          >
            <div 
              className="rounded-full overflow-hidden border-2 border-white shadow-lg transition-transform group-hover:scale-125 group-hover:border-signia-purple group-hover:z-30"
              style={{ width: bubble.size, height: bubble.size }}
            >
              <img src={bubble.picture} alt={bubble.name} className="w-full h-full object-cover" />
            </div>
            
            {/* Tooltip Drilldown */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-40">
              <p className="font-bold">{bubble.name}</p>
              <p className="text-slate-300 font-medium">{bubble.puesto || 'Sin puesto asignado'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}