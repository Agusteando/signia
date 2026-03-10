"use client";
import { useRef, useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

export default function OnboardingStepper({
  steps = [],
  activeStep = 0,
  onStepChange,
  stepStatus = {},
  allowFreeJump = true,
  className = ""
}) {
  const totalSteps = steps.length;
  const [touch, setTouch] = useState(null);
  const stepperRef = useRef();

  useEffect(() => {
    function handler(e) {
      if (
        document.activeElement &&
        stepperRef.current &&
        stepperRef.current.contains(document.activeElement)
      ) {
        if (e.key === "ArrowLeft" && activeStep > 0) {
          onStepChange(activeStep - 1);
          e.preventDefault();
        }
        if (e.key === "ArrowRight" && activeStep < totalSteps - 1) {
          onStepChange(activeStep + 1);
          e.preventDefault();
        }
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeStep, totalSteps, onStepChange]);

  function handleTouchStart(e) {
    if (!e?.touches?.[0]) return;
    setTouch({ startX: e.touches[0].clientX, startT: Date.now() });
  }
  function handleTouchEnd(e) {
    if (!touch || !e.changedTouches?.[0]) return;
    const dx = e.changedTouches[0].clientX - touch.startX;
    const dt = Date.now() - touch.startT;
    if (Math.abs(dx) > 64 && dt < 600) {
      if (dx > 0 && activeStep > 0) {
        onStepChange(activeStep - 1);
      } else if (dx < 0 && activeStep < totalSteps - 1) {
        onStepChange(activeStep + 1);
      }
    }
    setTouch(null);
  }

  function getColor(key, idx) {
    if (
      stepStatus?.[key]?.checklist?.fulfilled ||
      stepStatus?.[key]?.signature?.status === "signed" ||
      stepStatus?.[key]?.signature?.status === "completed"
    ) return "#00A6A6"; 
    if (
      stepStatus?.[key]?.signature?.status === "rejected" ||
      stepStatus?.[key]?.checklist?.status === "rejected"
    ) return "#E11D48"; 
    return "#EEF2F7"; 
  }

  return (
    <nav
      aria-label="Pasos del proceso"
      className={`w-full flex flex-col items-center select-none relative ${className}`}
      tabIndex={0}
      ref={stepperRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full flex flex-row items-center justify-center gap-2 xs:gap-6 md:gap-8 relative mt-0 mb-3 z-20">
        <button
          type="button"
          aria-label={activeStep === 0 ? "Inicio" : "Paso anterior"}
          disabled={activeStep === 0}
          onClick={() => onStepChange(activeStep - 1)}
          className={`flex items-center justify-center rounded-xl border border-[#EEF2F7] bg-white shadow-sm p-1.5 xs:p-2 md:p-3 transition-all focus:ring-4 ring-[#00A6A6]/30 outline-none ${activeStep === 0 ? " opacity-30 pointer-events-none" : "hover:bg-[#F6F8FB] hover:border-[#00A6A6]/50 hover:shadow-md"}`}
          tabIndex={0}
        >
          <ChevronLeftIcon className="w-6 h-6 xs:w-7 xs:h-7 md:w-8 md:h-8 text-[#00A6A6]" />
        </button>
        <div className="grow w-4 xs:w-5 md:w-7"></div>
        <div className="grow flex items-center justify-center"></div>
        <div className="grow w-4 xs:w-5 md:w-7"></div>
        <button
          type="button"
          aria-label={activeStep === totalSteps-1 ? "Ultimo paso" : "Paso siguiente"}
          disabled={activeStep === totalSteps - 1}
          onClick={() => onStepChange(activeStep + 1)}
          className={`flex items-center justify-center rounded-xl border border-[#EEF2F7] bg-white shadow-sm p-1.5 xs:p-2 md:p-3 transition-all focus:ring-4 ring-[#00A6A6]/30 outline-none ${activeStep === totalSteps-1 ? " opacity-30 pointer-events-none" : "hover:bg-[#F6F8FB] hover:border-[#00A6A6]/50 hover:shadow-md"}`}
          tabIndex={0}
        >
          <ChevronRightIcon className="w-6 h-6 xs:w-7 xs:h-7 md:w-8 md:h-8 text-[#00A6A6]" />
        </button>
      </div>
      <div className="flex flex-row items-center gap-1.5 xs:gap-2 md:gap-3 mt-1 mb-2">
        {steps.map((step, idx) => (
          <button
            key={step.key}
            type="button"
            className={`
              w-5 h-5 xs:w-6 xs:h-6 md:w-8 md:h-8 rounded-full border-2 transition-all duration-300
              flex items-center justify-center
              ${idx === activeStep
                ? "bg-white"
                : "bg-white hover:scale-110"
              }
            `}
            tabIndex={0}
            aria-label={`Paso ${idx+1}`}
            style={{
              boxShadow: idx === activeStep ? "0 0 0 4px rgba(106,61,240,0.15)" : undefined,
              borderColor: idx === activeStep ? "#6A3DF0" : getColor(step.key, idx),
            }}
            disabled={!allowFreeJump && idx !== activeStep}
            onClick={() => onStepChange(idx)}
          >
            <div style={{
              width: idx === activeStep ? "50%" : "60%",
              height: idx === activeStep ? "50%" : "60%",
              background: idx === activeStep ? "#6A3DF0" : getColor(step.key, idx),
              borderRadius: "50%",
              transition: "all .3s cubic-bezier(.55,1.4,.8,1)",
              margin: "auto"
            }}/>
          </button>
        ))}
      </div>
      <div className="text-[11px] xs:text-xs text-slate-400 mt-1 mb-2 font-bold tracking-widest uppercase">
        Paso <span className="font-extrabold text-[#6A3DF0] text-sm leading-none">{activeStep+1}</span> <span className="lowercase">de</span> {totalSteps}
      </div>
    </nav>
  );
}