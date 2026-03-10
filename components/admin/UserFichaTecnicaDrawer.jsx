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
      setTimeout(onClose, 1200);
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
    <div className="fixed inset-0 z-[70] bg-[#1F2937]/40 backdrop-blur-sm flex justify-end fade-in">
      <div className="w-full max-w-sm sm:max-w-md h-full bg-white shadow-[0_0_64px_rgba(0,0,0,0.1)] overflow-y-auto border-l border-[#EEF2F7] px-0 pt-0 relative flex flex-col">
        <button
          className="absolute right-5 top-6 text-slate-400 hover:text-[#6A3DF0] rounded-full p-2 bg-[#F6F8FB] hover:bg-[#EEF2F7] transition-all"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <XMarkIcon className="w-5 h-5 stroke-2" />
        </button>
        
        <div className="p-7 flex items-center gap-4 border-b border-[#EEF2F7] bg-[#F6F8FB] shrink-0 pt-8">
          <img
            src={user.picture || "/IMAGOTIPO-IECS-IEDIS.png"}
            width={64}
            height={64}
            alt=""
            className="rounded-full bg-white border-2 border-white shadow-md shrink-0 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = "/IMAGOTIPO-IECS-IEDIS.png"; }}
          />
          <div className="min-w-0">
            <div className="font-extrabold text-[#1F2937] leading-tight truncate text-lg">{user.name}</div>
            <div className="text-sm text-slate-500 font-medium truncate mb-1.5">{user.email}</div>
            <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-extrabold shadow-sm ${
              user.role === "employee" ? "bg-emerald-50 text-[#00A6A6] ring-1 ring-inset ring-[#00A6A6]/20" : "bg-white text-[#6A3DF0] ring-1 ring-inset ring-[#6A3DF0]/20"
            }`}>
              {user.role === "employee" ? "EMPLEADO ACTIVO" : "CANDIDATO"}
            </span>
          </div>
        </div>
        
        <form className="p-7 flex flex-col gap-5 flex-1" onSubmit={handleSave}>
          <h2 className="font-extrabold text-lg text-[#1F2937] tracking-tight">Ficha Técnica Operativa</h2>
          
          {isLoading || !ficha ? (
            <div className="text-[#00A6A6] font-bold py-10 text-sm text-center animate-pulse">Obteniendo datos estructurados...</div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-2 bg-[#F6F8FB] p-4 rounded-2xl border border-[#EEF2F7]">
                <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Completitud
                </span>
                <div className="flex-1">
                  <div className="w-full h-2.5 rounded-full bg-[#EEF2F7] overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        fichaPct > 90 ? "bg-[#00A6A6]" : fichaPct > 50 ? "bg-[#6A3DF0]" : "bg-amber-400"
                      }`}
                      style={{ width: `${fichaPct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] sm:text-xs font-extrabold text-[#1F2937]">{fichaPct}%</span>
              </div>
              
              <div className="grid grid-cols-1 gap-y-4">
                {FIELDS.map(f =>
                  <div key={f.key}>
                    <label className="font-bold text-xs text-[#1F2937] flex items-center gap-2 mb-2 ml-1">
                      <f.icon className="w-4 h-4 text-[#00A6A6] stroke-2" /> {f.label}
                    </label>
                    {f.key === "fechaIngreso" || f.key === "fechaBajaSustituido" ? (
                      <input
                        className="w-full rounded-xl border border-[#EEF2F7] px-4 py-3 text-sm bg-[#F6F8FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6] transition-all font-medium text-[#1F2937]"
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
                        className="w-full rounded-xl border border-[#EEF2F7] px-4 py-3 text-sm bg-[#F6F8FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6] transition-all font-bold text-[#1F2937] appearance-none"
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
                            "w-full inline-flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-all font-bold text-[#1F2937]",
                            canEdit && !isSaving ? "border-[#EEF2F7] bg-[#F6F8FB] hover:bg-white focus:bg-white focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6]" : "border-[#EEF2F7] bg-[#F6F8FB] text-slate-400 cursor-not-allowed"
                          )}
                          aria-haspopup="listbox"
                          aria-expanded={puestoOpen}
                          aria-controls="puesto-listbox"
                        >
                          <span className="truncate text-left">
                            {ficha.puesto
                              ? ficha.puesto
                              : (puestosLoading ? "Cargando catálogo..." : "Seleccionar de la lista...")}
                          </span>
                          <ChevronUpDownIcon className="w-5 h-5 text-[#00A6A6] stroke-2" />
                        </button>

                        {ficha.puesto && isPuestoOutOfCatalog && (
                          <div className="mt-2 text-[11px] font-bold flex items-start gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <ExclamationTriangleIcon className="w-4 h-4 shrink-0 stroke-2" />
                            <span>
                              Puesto fuera del catálogo oficial activo. Reemplazar si es necesario.
                            </span>
                          </div>
                        )}

                        {puestoOpen && (
                          <div className="absolute z-10 mt-2 w-full bg-white border border-[#EEF2F7] rounded-xl shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] overflow-hidden">
                            <div className="p-3 border-b border-[#EEF2F7] bg-[#F6F8FB]">
                              <div className="relative">
                                <MagnifyingGlassIcon className="w-4 h-4 text-[#00A6A6] absolute left-3 top-2.5" />
                                <input
                                  ref={puestoInputRef}
                                  value={puestoFilter}
                                  onChange={e => { setPuestoFilter(e.target.value); setPuestoActiveIndex(0); }}
                                  onKeyDown={handlePuestoKeyDown}
                                  placeholder="Buscar puesto..."
                                  className="w-full pl-9 pr-8 py-2 rounded-lg border border-[#EEF2F7] text-sm bg-white focus:outline-none focus:border-[#00A6A6] focus:ring-2 focus:ring-[#00A6A6]/30 font-medium"
                                />
                                {puestoFilter && (
                                  <button
                                    type="button"
                                    className="absolute right-2 top-2 p-1 rounded-md hover:bg-[#EEF2F7] transition"
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
                              className="max-h-56 overflow-auto py-2"
                            >
                              {puestosFiltered.length === 0 && (
                                <li className="px-4 py-3 text-xs font-bold text-slate-400 text-center">Sin resultados coincidentes</li>
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
                                      "px-4 py-2.5 cursor-pointer flex items-center justify-between text-sm transition-colors",
                                      active ? "bg-[#F6F8FB]" : "",
                                      selected ? "font-extrabold text-[#6A3DF0] bg-[#6A3DF0]/5" : "text-[#1F2937] hover:bg-[#F6F8FB] font-medium"
                                    )}
                                    onMouseEnter={() => setPuestoActiveIndex(idx)}
                                    onClick={() => {
                                      setFicha(f => ({ ...f, puesto: p.name }));
                                      closePuestoDropdown();
                                      puestoButtonRef.current?.focus();
                                    }}
                                  >
                                    <span className="truncate">{p.name}</span>
                                    {selected && <CheckCircleIcon className="w-5 h-5 text-[#6A3DF0] stroke-2" />}
                                  </li>
                                );
                              })}
                            </ul>
                            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#EEF2F7] bg-[#F6F8FB]">
                              <button
                                type="button"
                                className="text-xs font-bold px-4 py-2 rounded-lg bg-white border border-[#EEF2F7] hover:bg-slate-50 text-slate-500 transition shadow-sm"
                                onClick={() => { setPuestoFilter(""); closePuestoDropdown(); puestoButtonRef.current?.focus(); }}
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                className="text-xs font-bold px-4 py-2 rounded-lg bg-white border border-[#EEF2F7] hover:bg-slate-50 text-slate-500 transition shadow-sm"
                                onClick={() => {
                                  setFicha(f => ({ ...f, puesto: "" }));
                                  setPuestoFilter("");
                                  closePuestoDropdown();
                                  puestoButtonRef.current?.focus();
                                }}
                                disabled={!canEdit || isSaving}
                              >
                                Limpiar Valor
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        className="w-full rounded-xl border border-[#EEF2F7] px-4 py-3 text-sm bg-[#F6F8FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A6A6]/30 focus:border-[#00A6A6] transition-all font-medium text-[#1F2937]"
                        name={f.key}
                        value={ficha[f.key]}
                        onChange={handleChange}
                        disabled={!canEdit || isSaving}
                      />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-[#EEF2F7]">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white border border-[#EEF2F7] hover:bg-[#F6F8FB] hover:border-[#6A3DF0]/30 text-[#6A3DF0] font-extrabold shadow-sm transition-all text-sm disabled:opacity-60"
                  onClick={downloadFichaPdf}
                  disabled={pdfDownloading || isSaving}
                >
                  <ArrowDownTrayIcon className="w-5 h-5 stroke-2" />
                  {pdfDownloading ? "Exportando PDF..." : "Descargar Ficha en PDF"}
                </button>
                <button
                  type="button"
                  className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white border border-[#EEF2F7] hover:bg-[#F6F8FB] hover:border-[#00A6A6]/30 text-[#00A6A6] font-extrabold shadow-sm transition-all text-sm disabled:opacity-60 ${zipQueued ? "cursor-wait" : ""}`}
                  onClick={downloadTodoZip}
                  disabled={zipDownloading || zipQueued || isSaving}
                >
                  <ArrowDownOnSquareStackIcon className="w-5 h-5 stroke-2" />
                  {zipDownloading ? "Empaquetando Documentos..." : zipQueued ? "En cola segura…" : "Exportar Expediente Completo (ZIP)"}
                </button>
              </div>
              
              {error && (
                <div className="px-4 py-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2 border border-rose-100 shadow-sm mt-2">
                  <ExclamationTriangleIcon className="w-5 h-5 shrink-0 stroke-2" /> {error}
                </div>
              )}
              {success && (
                <div className="px-4 py-3 rounded-xl bg-emerald-50 text-[#00A6A6] text-xs font-bold flex items-center gap-2 border border-[#00A6A6]/20 shadow-sm mt-2">
                  <CheckCircleIcon className="w-5 h-5 shrink-0 stroke-2" /> {success}
                </div>
              )}
              
              {!canEdit && (
                <div className="mt-4 text-xs text-slate-400 font-bold tracking-widest uppercase text-center bg-[#F6F8FB] p-3 rounded-xl">Modo Lectura</div>
              )}
              {canEdit && (
                <button
                  type="submit"
                  className="mt-4 py-4 rounded-xl w-full bg-gradient-to-r from-[#6A3DF0] to-[#7B4DFF] text-white font-extrabold shadow-lg shadow-[#6A3DF0]/30 text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none"
                  disabled={isSaving}
                >
                  {isSaving ? "Aplicando cambios..." : "Guardar Ficha Técnica"}
                </button>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}