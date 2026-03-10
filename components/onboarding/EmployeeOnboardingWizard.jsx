"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { ArrowLeftCircleIcon, ArrowRightCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { stepsExpediente } from "../stepMetaExpediente";
import OnboardingStepper from "./OnboardingStepper";
import StepPlantelSelection from "./StepPlantelSelection";
import StepDigitalPhoto from "./StepDigitalPhoto";
import StepDocumentUpload from "./StepDocumentUpload";
import StepExpedienteSummary from "./StepExpedienteSummary";
import StepSummary from "./StepSummary";
import WelcomeApproved from "./WelcomeApproved";
import { getStatusMeta } from "@/lib/expedienteStatus";

const iconMap = {
  IdentificationIcon:     require("@heroicons/react/24/solid").IdentificationIcon,
  DocumentTextIcon:       require("@heroicons/react/24/solid").DocumentTextIcon,
  BriefcaseIcon:          require("@heroicons/react/24/solid").BriefcaseIcon,
  ShieldCheckIcon:        require("@heroicons/react/24/solid").ShieldCheckIcon,
  AcademicCapIcon:        require("@heroicons/react/24/solid").AcademicCapIcon,
  UserCircleIcon:         require("@heroicons/react/24/solid").UserCircleIcon,
  UserGroupIcon:          require("@heroicons/react/24/solid").UserGroupIcon,
  ReceiptRefundIcon:      require("@heroicons/react/24/solid").ReceiptRefundIcon,
  UserPlusIcon:           require("@heroicons/react/24/solid").UserPlusIcon,
  CheckCircleIcon:        require("@heroicons/react/24/solid").CheckCircleIcon,
};

function isUserExpedienteDigitalComplete(stepStatus) {
  return stepsExpediente
    .filter(s => !s.adminUploadOnly && !s.isPlantelSelection)
    .every(step => stepStatus?.[step.key]?.checklist?.fulfilled);
}

export default function EmployeeOnboardingWizard({ user: userProp, mode = "expediente" }) {
  const [user, setUser] = useState(userProp);
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [stepStatus, setStepStatus] = useState({});
  const [stepHistory, setStepHistory] = useState({});
  const [planteles, setPlanteles] = useState([]);

  const userSteps = useMemo(
    () =>
      stepsExpediente.filter(s => !s.adminUploadOnly)
      .concat([{ key: "__expediente_summary__", label: "Resumen de expediente", description: "" }]),
    []
  );
  const totalSteps = userSteps.length;

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [savingPlantel, setSavingPlantel] = useState(false);
  const successTimeout = useRef();

  const [bypassWelcome, setBypassWelcome] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBypassWelcome(window.sessionStorage.getItem("expedienteWizardBypass") === "true");
    }
  }, [userProp.id]);
  
  function handleBypassClick() {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("expedienteWizardBypass", "true");
      setBypassWelcome(true);
    }
  }
  
  function handleBypassExit() {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("expedienteWizardBypass");
      setBypassWelcome(false);
    }
    setCurrentStep(0);
  }

  useEffect(() => {
    async function fetchPlanteles() {
      try {
        const res = await fetch("/api/planteles/list");
        const p = res.ok ? await res.json() : [];
        setPlanteles(Array.isArray(p) ? p : []);
      } catch {}
    }
    fetchPlanteles();
  }, []);

  async function fetchExpedienteSteps() {
    setLoadingData(true);
    setFetchError("");
    try {
      const res = await fetch(`/api/expediente/steps/${user.id}`);
      if (!res.ok) throw new Error("No se pudo leer los datos del expediente.");
      const { stepHistory: history, stepStatus: status } = await res.json();
      setStepHistory(history && typeof history === "object" ? history : {});
      setStepStatus(status && typeof status === "object" ? status : {});
    } catch (err) {
      setFetchError(err.message || "Error de conexión.");
      setStepHistory({});
      setStepStatus({});
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    fetchExpedienteSteps();
  }, [user.id]);

  async function savePlantelCurpRfcEmail({
    plantelId, curp, rfc, email, onSuccess, onError
  }) {
    setSavingPlantel(true);
    setFetchError("");
    try {
      let userPatchOk = true;
      if (user.plantelId !== parseInt(plantelId)) {
        const pRes = await fetch("/api/me/plantel", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plantelId }),
        });
        userPatchOk = pRes.ok;
        if (!userPatchOk) {
          const pdata = await pRes.json();
          setFetchError(pdata?.error || "No se pudo seleccionar plantel.");
          setSavingPlantel(false);
          if (onError) onError(pdata?.error);
          return;
        }
      }
      
      if (
        String((user.rfc || "")).trim().toUpperCase() !== (rfc || "").trim().toUpperCase() ||
        String((user.curp || "")).trim().toUpperCase() !== (curp || "").trim().toUpperCase()
      ) {
        const cRes = await fetch("/api/me/curp-rfc", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ curp, rfc }),
        });
        if (!cRes.ok) {
          const data = await cRes.json();
          setFetchError(data?.error || "No se pudo actualizar RFC/CURP.");
          setSavingPlantel(false);
          if (onError) onError(data?.error);
          return;
        }
      }
      
      if ((user.email || "").trim() !== (email || "").trim()) {
        const eRes = await fetch("/api/me/email", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!eRes.ok) {
          const edata = await eRes.json();
          setFetchError(edata?.error || "No se pudo actualizar correo electrónico.");
          setSavingPlantel(false);
          if (onError) onError(edata?.error);
          return;
        }
      }
      
      setUser(u => ({
        ...u,
        plantelId: parseInt(plantelId, 10),
        rfc: rfc.trim().toUpperCase(),
        curp: curp.trim().toUpperCase(),
        email: email.trim()
      }));
      setSavingPlantel(false);
      await fetchExpedienteSteps();
      if (onSuccess) onSuccess();
    } catch {
      setFetchError("No se pudo conectar.");
      setSavingPlantel(false);
      if (onError) onError("No se pudo conectar.");
    }
  }

  async function handlePhotoUpload(file) {
    setUploading(true); setUploadError(""); setUploadSuccess(""); setUploadProgress(0);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/documents/${user.id}/foto_digital/upload`, true);
    xhr.onload = function () {
      setUploading(false); setUploadProgress(null);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status !== 200) {
          console.error("[Upload Photo] Server error:", xhr.status, data);
          let errMsg = data.error || `Error HTTP ${xhr.status}`;
          if (data.details) errMsg += ` (Detalles: ${data.details})`;
          setUploadError(errMsg);
        } else {
          setUploadSuccess("¡Fotografía cargada! Ya puedes avanzar.");
          if (data.avatarUrl) setUser(u => ({ ...u, picture: data.avatarUrl }));
          clearTimeout(successTimeout.current);
          successTimeout.current = setTimeout(() => setUploadSuccess(""), 4000);
          fetchExpedienteSteps();
        }
      } catch (err) {
        console.error("[Upload Photo] Failed to parse JSON response:", xhr.responseText, err);
        setUploadError(`Error inesperado del servidor HTTP ${xhr.status}.`);
      }
    };
    xhr.onerror = function (err) {
      console.error("[Upload Photo] XHR network error:", err);
      setUploading(false); setUploadProgress(null); 
      setUploadError("Fallo de red al intentar subir la fotografía. Verifica tu conexión.");
    };
    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };
    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  }

  async function handleFileUpload(file, key) {
    setUploading(true); setUploadError(""); setUploadSuccess(""); setUploadProgress(0);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/documents/${user.id}/${key}/upload`, true);
    xhr.onload = function () {
      setUploading(false); setUploadProgress(null);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status !== 200) {
          console.error("[Upload Document] Server error:", xhr.status, data);
          let errMsg = data.error || `Error HTTP ${xhr.status}`;
          if (data.details) errMsg += ` (Detalles: ${data.details})`;
          setUploadError(errMsg);
        } else {
          setUploadSuccess("¡Archivo subido! Puedes avanzar al siguiente paso.");
          clearTimeout(successTimeout.current);
          successTimeout.current = setTimeout(() => setUploadSuccess(""), 4000);
          fetchExpedienteSteps();
        }
      } catch (err) {
        console.error("[Upload Document] Failed to parse JSON response:", xhr.responseText, err);
        setUploadError(`Error inesperado del servidor HTTP ${xhr.status}.`);
      }
    };
    xhr.onerror = function (err) {
      console.error("[Upload Document] XHR network error:", err);
      setUploading(false); setUploadProgress(null); 
      setUploadError("Fallo de red al intentar subir el archivo. Verifica tu conexión.");
    };
    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };
    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  }

  const expedienteCompleto =
    user &&
    user.role === "employee" &&
    isUserExpedienteDigitalComplete(stepStatus);

  const steps = userSteps;
  const step = steps[currentStep];
  const status = (step.key && stepStatus?.[step.key]) ? stepStatus[step.key] : {};
  const historyDocs = (step.key && stepHistory?.[step.key]) ? stepHistory[step.key] : [];
  const latestDoc = historyDocs.length ? historyDocs[0] : null;

  function isCurrentStepFulfilled(curStep) {
    if (!curStep || !curStep.key) return false;
    if (curStep.key === "plantel") {
      return planteles.length > 0 && !!user.plantelId && user.rfc && user.curp && user.email;
    }
    if (curStep.key === "foto_digital") {
      return !!(stepStatus && stepStatus.foto_digital && stepStatus.foto_digital.checklist && stepStatus.foto_digital.checklist.fulfilled);
    }
    if (curStep.key === "__expediente_summary__") {
      return true;
    }
    const st = stepStatus && stepStatus[curStep.key];
    if (!st) return false;
    return !!(st.checklist && st.checklist.fulfilled);
  }

  const canGoNext = currentStep < totalSteps - 1 && isCurrentStepFulfilled(step) && !uploading && !savingPlantel;
  const canGoPrev = currentStep > 0 && !uploading && !savingPlantel;

  if (loadingData)
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 fade-in">
        <div className="w-10 h-10 border-4 border-[#00A6A6] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-[#1F2937] text-lg font-extrabold tracking-tight">Sincronizando expediente...</span>
      </div>
    );

  if (fetchError)
    return (
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-red-200 flex flex-col items-center justify-center p-10 mt-10">
        <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
        <span className="text-red-700 font-bold text-center">{fetchError}</span>
      </div>
    );

  if (expedienteCompleto && !bypassWelcome) {
    return <WelcomeApproved user={user} onRequestBypass={handleBypassClick} />;
  }

  const showEmpNotCompleteBanner = user && user.role === "employee" && !expedienteCompleto;

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[620px] relative fade-in px-4 sm:px-6">
      
      <div className="w-full max-w-3xl mx-auto mb-6 bg-white/80 backdrop-blur-2xl border border-[#EEF2F7] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.04)] rounded-3xl p-4 mt-6">
        <OnboardingStepper
          steps={steps}
          activeStep={currentStep}
          onStepChange={(idx) => setCurrentStep(idx)}
          stepStatus={stepStatus || {}}
          allowFreeJump={true}
        />
        {bypassWelcome && (
          <div className="flex justify-center w-full mt-4 pt-4 border-t border-[#EEF2F7]">
            <button
              type="button"
              className="flex items-center justify-center gap-2 font-bold text-[#6A3DF0] hover:text-[#7B4DFF] text-sm bg-[#F6F8FB] hover:bg-white px-5 py-2.5 rounded-xl border border-[#EEF2F7] hover:border-[#6A3DF0]/30 transition-all shadow-sm w-full sm:w-auto"
              onClick={handleBypassExit}
            >
              <XCircleIcon className="w-5 h-5" />
              Finalizar actualización y volver al inicio
            </button>
          </div>
        )}
      </div>

      <section className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] border border-[#EEF2F7] relative overflow-hidden flex flex-col items-center pt-10 pb-24 px-6 sm:px-12">
        
        {showEmpNotCompleteBanner && (
          <div className="w-full mb-8 text-center px-5 py-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-sm shadow-sm flex items-start gap-3">
            <XCircleIcon className="w-6 h-6 text-amber-500 shrink-0" />
            <div className="text-left">
              Eres empleado(a) activo, pero tu expediente digital requiere atención.
              <span className="block text-amber-700 font-medium text-xs mt-1">Por favor, concluye la entrega de todos los documentos requeridos.</span>
            </div>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          {step.iconKey && iconMap[step.iconKey] && (
            <div className="w-16 h-16 bg-[#F6F8FB] rounded-2xl flex items-center justify-center border border-[#EEF2F7] shadow-inner mb-5 text-[#00A6A6]">
              {(() => {
                const Icon = iconMap[step.iconKey];
                return <Icon className="h-8 w-8 md:h-10 md:w-10 stroke-2" />;
              })()}
            </div>
          )}
          {step.key !== "__expediente_summary__" &&
            <div className="flex flex-col items-center max-w-lg">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F2937] mb-2 leading-tight">
                {step.label}
              </div>
              <div className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                {step.description}
              </div>
            </div>
          }
        </div>
        
        {step.key === "plantel" ? (
          <StepPlantelSelection
            plantelId={user.plantelId}
            rfc={user.rfc}
            curp={user.curp}
            email={user.email}
            planteles={planteles}
            loading={loadingData}
            error={fetchError}
            onSave={savePlantelCurpRfcEmail}
            saving={savingPlantel}
          />
        ) : step.key === "foto_digital" ? (
          <StepDigitalPhoto
            picture={user.picture}
            onUpload={handlePhotoUpload}
            uploading={uploading}
            uploadError={uploadError}
            uploadSuccess={uploadSuccess}
          />
        ) : step.key === "__expediente_summary__" ? (
          <StepExpedienteSummary stepStatus={stepStatus} user={user} />
        ) : (
          <StepDocumentUpload
            latestDoc={latestDoc}
            documentHistory={historyDocs}
            uploading={uploading}
            uploadError={uploadError}
            uploadSuccess={uploadSuccess}
            uploadProgress={uploadProgress}
            onUpload={(file) => handleFileUpload(file, step.key)}
            accept={step.accept || "application/pdf"}
          />
        )}
        
        <div className="absolute bottom-0 left-0 w-full flex justify-between items-center px-6 sm:px-12 py-5 bg-[#F6F8FB] border-t border-[#EEF2F7]">
          <button
            className={`px-5 py-2.5 rounded-xl font-bold text-sm bg-white border border-[#EEF2F7] text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 ${!canGoPrev ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={!canGoPrev}
          >
            <ArrowLeftCircleIcon className="w-5 h-5" />
            Atrás
          </button>
          
          <button
            className={`px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00A6A6] to-[#0FB5C9] text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 ${!canGoNext ? "opacity-50 grayscale cursor-not-allowed" : "hover:-translate-y-0.5"}`}
            disabled={!canGoNext}
            onClick={() => { if (canGoNext) setCurrentStep(currentStep + 1); }}
          >
            <span>Siguiente</span>
            <ArrowRightCircleIcon className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}