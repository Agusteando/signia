import HeroSection from "@/components/HeroSection";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative w-full h-full min-h-screen flex flex-col bg-[#F6F8FB] overflow-hidden">
      {/* Ambient background glow elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6A3DF0] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00A6A6] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-[#EEF2F7] shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <Image
            src="/signia.png"
            alt="Signia"
            width={130}
            height={40}
            priority
            className="object-contain drop-shadow-sm"
          />
          <span className="hidden sm:block text-xs font-bold text-[#00A6A6] tracking-widest uppercase">
            Plataforma de Talento
          </span>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center pt-24 relative z-10 px-4">
        <HeroSection />
      </main>
    </div>
  );
}