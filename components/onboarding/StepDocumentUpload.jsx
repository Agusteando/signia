"use client";
import { useState, useRef } from "react";
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  CheckCircleIcon, 
  ArrowTopRightOnSquareIcon 
} from "@heroicons/react/24/outline";

export default function StepDocumentUpload({
  latestDoc,
  documentHistory,
  uploading,
  uploadError,
  uploadSuccess,
  uploadProgress,
  onUpload,
  accept = "application/pdf"
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center mt-4 px-2">
      {/* Error / Success Status Messages */}
      {uploadError && (
        <div className="mb-4 w-full max-w-md p-3 bg-red-50 text-red-700 text-sm font-semibold rounded-lg border border-red-200 text-center shadow-sm">
          {uploadError}
        </div>
      )}
      
      {uploadSuccess && (
        <div className="mb-4 w-full max-w-md p-3 bg-emerald-50 text-emerald-800 text-sm font-bold rounded-lg border border-emerald-200 text-center flex items-center justify-center gap-2 shadow-sm">
          <CheckCircleIcon className="w-6 h-6" />
          {uploadSuccess}
        </div>
      )}

      {/* 
        Current Document Card
        NOTE: We intentionally DO NOT use an <iframe> or <object> here.
        This prevents the browser from ever rendering "No se pudo cargar el PDF."
      */}
      {latestDoc && !uploading && !uploadSuccess && (
        <div className="mb-6 w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-inner">
            <CheckCircleIcon className="w-8 h-8" />
          </div>
          <h3 className="text-slate-800 font-extrabold text-lg mb-1">Documento guardado exitosamente</h3>
          <p className="text-slate-500 text-sm font-medium mb-5">
            Versión {latestDoc.version || 1} • Subido el {new Date(latestDoc.uploadedAt).toLocaleDateString("es-MX")}
          </p>
          
          <a 
            href={`${latestDoc.filePath}?v=${latestDoc.version || Date.now()}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 font-bold py-2.5 px-5 rounded-xl shadow-sm hover:bg-slate-100 hover:text-cyan-700 transition-colors focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          >
            Ver documento
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
          </a>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <form 
        onDragEnter={handleDrag} 
        onSubmit={(e) => e.preventDefault()}
        className="w-full max-w-md"
      >
        <input 
          ref={inputRef}
          type="file" 
          accept={accept} 
          onChange={handleChange} 
          className="hidden" 
          id="file-upload"
        />
        <label 
          htmlFor="file-upload"
          className={`relative flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
            dragActive 
              ? "border-cyan-500 bg-cyan-50 shadow-inner" 
              : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-cyan-400"
          } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center text-cyan-700">
              <CloudArrowUpIcon className="w-14 h-14 mb-3 animate-bounce" />
              <span className="font-extrabold text-lg">Subiendo archivo...</span>
              {uploadProgress !== null && (
                <span className="text-sm font-bold mt-1 bg-cyan-100 px-3 py-1 rounded-full">{uploadProgress}%</span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-500 p-6 text-center">
              <DocumentIcon className={`w-14 h-14 mb-3 transition-colors ${dragActive ? "text-cyan-500" : "text-slate-400"}`} />
              <span className="font-bold text-slate-700 text-base mb-1">
                Haz clic para seleccionar o arrastra tu archivo aquí
              </span>
              <span className="text-sm text-slate-500 font-medium">
                {accept.includes("pdf") ? "Solo archivos PDF (máx. 20MB)" : "Formatos permitidos: JPG, PNG, PDF"}
              </span>
              
              {/* If a document already exists, clarify that uploading a new one replaces it */}
              {latestDoc && (
                <div className="mt-4 inline-flex">
                  <span className="text-xs font-bold text-cyan-800 bg-cyan-100 px-3 py-1.5 rounded-lg">
                    Subir un nuevo archivo reemplazará el actual
                  </span>
                </div>
              )}
            </div>
          )}
        </label>
      </form>
    </div>
  );
}