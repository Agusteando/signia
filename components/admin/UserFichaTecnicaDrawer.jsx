"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  BuildingLibraryIcon,
  IdentificationIcon,
  KeyIcon,
  HomeIcon,
  CalendarDaysIcon,
  Bars3BottomLeftIcon,
  ClockIcon,
  ArrowDownOnSquareStackIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  UserIcon,
  ArrowDownLeftIcon,
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const FIELDS = [
  { key: "rfc", label: "RFC", icon: IdentificationIcon },
  { key: "curp", label: "CURP", icon: KeyIcon },
  { key: "domicilioFiscal", label: "Domicilio fiscal", icon: HomeIcon },
  { key: "nss", label: "NSS", icon: ShieldCheckIcon },
  { key: "fechaIngreso", label: "Fecha de ingreso", icon: CalendarDaysIcon },
  { key: "puesto", label: "Puesto", icon: Bars3BottomLeftIcon },
  { key: "horarioLaboral", label: "Horario laboral", icon: ClockIcon },
  { key: "plantelId", label: "Plantel asignado", icon: BuildingLibraryIcon },
  { key: "sustituyeA", label: "Sustituye a", icon: UserIcon },
  { key: "fechaBajaSustituido", label: "Quién fue baja el", icon: ArrowDownLeftIcon },
];

function classNames(...c) { return c.filter(Boolean).join(" "); }

export default function UserFichaTecnicaDrawer({
  open,
  user,
  planteles = [],
  canEdit = false,
  editablePlanteles = [],
  onClose,
  isSuperadmin = false
}) {
  const [ficha, setFicha] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [zipDownloading, setZipDownloading] = useState(false);
  const [zipQueued, setZipQueued] = useState(false);

  const [puestos, setPuestos] = useState([]);
  const [puestosLoading, setPuestosLoading] = useState(false);

  const [puestoOpen, setPuestoOpen] = useState(false);
  const [puestoFilter, setPuestoFilter] = useState("");
  const [puestoActiveIndex, setPuestoActiveIndex] = useState(-1);
  const puestoInputRef = useRef(null);
  const puestoListRef = useRef(null);
  const puestoButtonRef = useRef(null);
  const dropdownWrapperRef = useRef(null);

  useEffect(() => {
    if (!open || !user) return;
    async function loadFicha() {
      setIsLoading(true);
      setFicha(null);
      setSuccess(""); setError("");
      try {
        const res = await fetch(`/api/admin/user/${user.id}/ficha-tecnica-data`);
        const d = await res.json();
        if (!res.ok) { setError(d.error || "No se puede leer ficha."); setIsLoading(false); return; }
        const f = d.ficha || {};
        setFicha({
          rfc: f.rfc ?? "",
          curp: f.curp ?? "",
          domicilioFiscal: f.domicilioFiscal ?? "",
          nss: f.nss ?? "",
          fechaIngreso: f.fechaIngreso ? String(f.fechaIngreso).substring(0, 10) : "",
          puesto: f.puesto ?? "",
          horarioLaboral: f.horarioLaboral ?? "",
          plantelId: f.plantelId || "",
          sustituyeA: f.sustituyeA ?? "",
          fechaBajaSustituido: f.fechaBajaSustituido ? String(f.fechaBajaSustituido).substring(0, 10) : "",
        });
      } catch {
        setError("No se puede leer ficha.");
      }
      setIsLoading(false);
    }
    loadFicha();
  }, [open, user]);

  useEffect(() => {
    async function loadPuestos() {
      if (!open) return;
      setPuestosLoading(true);
      try {
        const r = await fetch("/api/admin/puestos/list?active=1", { cache: "no-store" });
        const d = await r.json();
        if (r.ok) setPuestos(d.puestos || []);
      } catch { }
      setPuestosLoading(false);
    }
    loadPuestos();
  }, [open]);

  function handleChange(e) {
    setFicha(f => ({ ...f, [e.target.name]: e.target.value }));
    setError(""); setSuccess("");
  }
  function handlePlantelChange(e) {
    setFicha(f => ({ ...f, plantelId: e.target.value }));
    setError(""); setSuccess("");
  }

  const filledCount = ficha
    ? FIELDS.filter(({ key }) => (ficha[key] && String(ficha[key]).trim() !== "")).length
    : 0;
  const fichaPct = Math.round((filledCount / FIELDS.length) * 100);

  async function handleSave(e) {
    e.preventDefault();
    setIsSaving(true);
    setSuccess("");
    setError("");
    try {
      const { sueldo, ...toSend } = ficha || {};
      const res = await fetch(`/api/admin/user/${user.id}/ficha-tecnica`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSend)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar");
        setIsSaving(false);
        return;
      }
      setSuccess("¡Ficha guardada exitosamente!");
      setIsSaving(false);
      setTimeout(onClose, 900);
    } catch (e) {
      setError("Error de red o servidor");
      setIsSaving(false);
    }
  }

  async function downloadFichaPdf() {
    setPdfDownloading(true);
    setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/admin/user/${user.id}/ficha-tecnica/pdf`);
      if (!res.ok) throw new Error((await res.text()).slice(0,140));
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `FichaTecnica_${user.name.replace(/\W+/g,"_")}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      setPdfDownloading(false);
    } catch (e) {
      setError("No se pudo descargar PDF");
      setPdfDownloading(false);
    }
  }

  async function downloadTodoZip() {
    setZipDownloading(true);
    setZipQueued(false);
    setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/admin/user/${user.id}/ficha-tecnica/zip`);
      if (res.status === 429) { setZipQueued(true); setZipDownloading(false); return; }
      if (!res.ok) throw new Error((await res.text()).slice(0,120));
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `Expediente_${user.name.replace(/\W+/g,"_")}.zip`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      setZipDownloading(false);
    } catch (e) {
      setError("No se pudo descargar ZIP");
      setZipDownloading(false);
    }
  }

  const puestosFiltered = useMemo(() => {
    const q = puestoFilter.trim().toLowerCase();
    const list = Array.isArray(puestos) ? puestos : [];
    if (!q) return list;
    return list.filter(p => p.name.toLowerCase().includes(q));
  }, [puestos, puestoFilter]);

  const isPuestoOutOfCatalog = useMemo(() => {
    const v = (ficha?.puesto || "").trim();
    if (!v) return false;
    return !puestos.some(p => p.name === v);
  }, [ficha?.puesto, puestos]);

  const closePuestoDropdown = useCallback(() => {
    setPuestoOpen(false);
    setPuestoActiveIndex(-1);
  }, []);

  function handlePuestoKeyDown(e) {
    if (!puestoOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setPuestoOpen(true);
        setTimeout(() => puestoInputRef.current?.focus(), 0);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      closePuestoDropdown();
      puestoButtonRef.current?.focus();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setPuestoActiveIndex(i => {
        const n = puestosFiltered.length;
        if (n === 0) return -1;
        return (i + 1) % n;
      });
      scrollActiveIntoView();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setPuestoActiveIndex(i => {
        const n = puestosFiltered.length;
        if (n === 0) return -1;
        return (i - 1 + n) % n;
      });
      scrollActiveIntoView();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const idx = puestoActiveIndex;
      if (idx >= 0 && idx < puestosFiltered.length) {
        const sel = puestosFiltered[idx];
        setFicha(f => ({ ...f, puesto: sel.name }));
        closePuestoDropdown();
        puestoButtonRef.current?.focus();
      }
      return;
    }
  }

  function scrollActiveIntoView() {
    const listEl = puestoListRef.current;
    if (!listEl) return;
    const idx = puestoActiveIndex;
    if (idx < 0) return;
    const itemEl = listEl.querySelector(`[data-index="${idx}"]`);
    if (itemEl && itemEl.scrollIntoView) {
      itemEl.scrollIntoView({ block: "nearest" });
    }
  }

  useEffect(() => {
    function onDocClick(e) {
      if (!puestoOpen) return;
      if (!dropdownWrapperRef.current?.contains(e.target)) {
        closePuestoDropdown();
      }
    }
    window.addEventListener("mousedown", onDocClick);
    return () => window.removeEventListener("mousedown", onDocClick);
  }, [puestoOpen, closePuestoDropdown]);

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-sm sm:max-w-md h-full bg-white shadow-2xl overflow-y-auto border-l border-slate-200 px-0 pt-0 relative flex flex-col">
        <button
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 rounded-full p-1.5 bg-slate-100 hover:bg-slate-200 transition"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
        
        <div className="p-5 flex items-center gap-3.5 border-b border-slate-100 shrink-0">
          <img
            src={user.picture || "/IMAGOTIPO-IECS-IEDIS.png"}
            width={48}
            height={48}
            alt=""
            className="rounded-full bg-slate-100 border border-slate-200 shadow-sm shrink-0 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = "/IMAGOTIPO-IECS-IEDIS.png"; }}
          />
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 leading-tight truncate text-sm sm:text-base">{user.name}</div>
            <div className="text-xs text-slate-500 truncate mb-1">{user.email}</div>
            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium border ${
              user.role === "employee" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}>
              {user.role === "employee" ? "Empleado" : "Candidato"}
            </span>
          </div>
        </div>
        
        <form className="p-5 flex flex-col gap-3.5 flex-1" onSubmit={handleSave}>
          <h2 className="font-semibold text-sm sm:text-base text-slate-900">Detalles de Ficha Técnica</h2>
          
          {isLoading || !ficha ? (
            <div className="text-slate-500 py-10 text-sm font-medium text-center">Cargando datos...</div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700">
                  Completitud
                </span>
                <div className="flex-1">
                  <div className="w-full h-1.5 rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        fichaPct > 90 ? "bg-emerald-500" : fichaPct > 50 ? "bg-indigo-500" : "bg-amber-400"
                      }`}
                      style={{ width: `${fichaPct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-slate-500">{fichaPct}%</span>
              </div>
              
              <div className="grid grid-cols-1 gap-y-3.5">
                {FIELDS.map(f =>
                  <div key={f.key}>
                    <label className="font-medium text-xs text-slate-600 flex items-center gap-1.5 mb-1.5">
                      <f.icon className="w-3.5 h-3.5 text-slate-400" /> {f.label}
                    </label>
                    {f.key === "fechaIngreso" || f.key === "fechaBajaSustituido" ? (
                      <input
                        className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                        name={f.key}
                        type="date"
                        value={ficha[f.key]}
                        onChange={handleChange}
                        disabled={!canEdit || isSaving}
                      />
                    ) : f.key === "plantelId" ? (
                      <select
                        name="plantelId"
                        value={ficha.plantelId || ""}
                        onChange={handlePlantelChange}
                        disabled={!canEdit || isSaving}
                        className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                      >
                        <option value="">Seleccionar plantel...</option>
                        {(canEdit ? editablePlanteles : planteles).map(p =>
                          <option key={p.id} value={p.id}>{p.name}</option>
                        )}
                      </select>
                    ) : f.key === "puesto" ? (
                      <div ref={dropdownWrapperRef} className="relative">
                        <button
                          type="button"
                          ref={puestoButtonRef}
                          onClick={() => {
                            if (!canEdit || isSaving) return;
                            setPuestoOpen(o => !o);
                            setPuestoFilter("");
                            setPuestoActiveIndex(-1);
                            setTimeout(() => puestoInputRef.current?.focus(), 0);
                          }}
                          onKeyDown={handlePuestoKeyDown}
                          disabled={!canEdit || isSaving || puestosLoading}
                          className={classNames(
                            "w-full inline-flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-sm shadow-sm transition",
                            canEdit && !isSaving ? "border-slate-300 bg-white hover:bg-slate-50 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" : "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                          )}
                          aria-haspopup="listbox"
                          aria-expanded={puestoOpen}
                          aria-controls="puesto-listbox"
                        >
                          <span className="truncate text-left text-slate-700">
                            {ficha.puesto
                              ? ficha.puesto
                              : (puestosLoading ? "Cargando catálogo..." : "Seleccionar de la lista...")}
                          </span>
                          <ChevronUpDownIcon className="w-4 h-4 text-slate-400" />
                        </button>

                        {ficha.puesto && isPuestoOutOfCatalog && (
                          <div className="mt-1.5 text-[10px] sm:text-[11px] flex items-start gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-1.5">
                            <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              Puesto no en catálogo activo. Reemplazar si es necesario.
                            </span>
                          </div>
                        )}

                        {puestoOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                            <div className="p-2 border-b border-slate-100 bg-slate-50">
                              <div className="relative">
                                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
                                <input
                                  ref={puestoInputRef}
                                  value={puestoFilter}
                                  onChange={e => { setPuestoFilter(e.target.value); setPuestoActiveIndex(0); }}
                                  onKeyDown={handlePuestoKeyDown}
                                  placeholder="Buscar..."
                                  className="w-full pl-8 pr-8 py-1.5 rounded-md border border-slate-300 text-sm bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                                {puestoFilter && (
                                  <button
                                    type="button"
                                    className="absolute right-2 top-1.5 p-1 rounded-md hover:bg-slate-100 transition"
                                    onClick={() => { setPuestoFilter(""); setPuestoActiveIndex(0); puestoInputRef.current?.focus(); }}
                                    aria-label="Limpiar"
                                  >
                                    <XMarkIcon className="w-4 h-4 text-slate-400" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <ul
                              id="puesto-listbox"
                              role="listbox"
                              ref={puestoListRef}
                              className="max-h-52 overflow-auto py-1"
                            >
                              {puestosFiltered.length === 0 && (
                                <li className="px-3 py-2 text-xs text-slate-500 text-center">Sin resultados</li>
                              )}
                              {puestosFiltered.map((p, idx) => {
                                const selected = ficha.puesto === p.name;
                                const active = puestoActiveIndex === idx;
                                return (
                                  <li
                                    key={p.id}
                                    role="option"
                                    aria-selected={selected}
                                    data-index={idx}
                                    className={classNames(
                                      "px-3 py-2 cursor-pointer flex items-center justify-between text-xs transition-colors",
                                      active ? "bg-slate-50" : "",
                                      selected ? "font-semibold text-indigo-700 bg-indigo-50/50" : "text-slate-700 hover:bg-slate-50"
                                    )}
                                    onMouseEnter={() => setPuestoActiveIndex(idx)}
                                    onClick={() => {
                                      setFicha(f => ({ ...f, puesto: p.name }));
                                      closePuestoDropdown();
                                      puestoButtonRef.current?.focus();
                                    }}
                                  >
                                    <span className="truncate">{p.name}</span>
                                    {selected && <CheckCircleIcon className="w-3.5 h-3.5 text-indigo-600" />}
                                  </li>
                                );
                              })}
                            </ul>
                            <div className="flex items-center justify-between gap-2 px-2.5 py-2 border-t border-slate-100 bg-slate-50">
                              <button
                                type="button"
                                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 transition"
                                onClick={() => { setPuestoFilter(""); closePuestoDropdown(); puestoButtonRef.current?.focus(); }}
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 transition"
                                onClick={() => {
                                  setFicha(f => ({ ...f, puesto: "" }));
                                  setPuestoFilter("");
                                  closePuestoDropdown();
                                  puestoButtonRef.current?.focus();
                                }}
                                disabled={!canEdit || isSaving}
                              >
                                Limpiar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                        name={f.key}
                        value={ficha[f.key]}
                        onChange={handleChange}
                        disabled={!canEdit || isSaving}
                      />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2.5 mt-5 pt-5 border-t border-slate-100 pb-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium shadow-sm transition text-xs sm:text-sm disabled:opacity-60"
                  onClick={downloadFichaPdf}
                  disabled={pdfDownloading || isSaving}
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  {pdfDownloading ? "Exportando..." : "Descargar Ficha PDF"}
                </button>
                <button
                  type="button"
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium shadow-sm transition text-xs sm:text-sm disabled:opacity-60 ${zipQueued ? "cursor-wait" : ""}`}
                  onClick={downloadTodoZip}
                  disabled={zipDownloading || zipQueued || isSaving}
                >
                  <ArrowDownOnSquareStackIcon className="w-4 h-4" />
                  {zipDownloading ? "Empaquetando ZIP..." : zipQueued ? "En cola…" : "Descargar Expediente ZIP"}
                </button>
              </div>
              
              {error && (
                <div className="px-3 py-2 rounded-md bg-red-50 text-red-700 text-xs font-medium flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="px-3 py-2 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 shrink-0 text-emerald-600" /> {success}
                </div>
              )}
              
              {!canEdit && (
                <div className="mt-2 text-[11px] text-slate-500 font-medium text-center bg-slate-50 p-1.5 rounded-md">Modo lectura</div>
              )}
              {canEdit && (
                <button
                  type="submit"
                  className="mt-2 py-2 rounded-md w-full bg-indigo-600 text-white font-medium shadow-sm text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  disabled={isSaving}
                >
                  {isSaving ? "Guardando..." : "Guardar Ficha Técnica"}
                </button>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}