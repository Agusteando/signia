import { cookies } from "next/headers";
import { getSessionFromCookies } from "@/lib/auth";
import prisma from "@/lib/prisma";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import AdminDashboardStats from "@/components/admin/AdminDashboardStats";
import PlantelAdminMatrix from "@/components/admin/PlantelAdminMatrix";
import PlantelListAdminPanelClient from "@/components/admin/PlantelListAdminPanelClient";
import PlantelProgressPanel from "@/components/admin/PlantelProgressPanel";
import PlantelAdminMatrixCrudClient from "@/components/admin/PlantelAdminMatrixCrudClient";
import AdminInicioClient from "@/components/admin/AdminInicioClient";
import HRInsightsDashboard from "@/components/admin/HRInsightsDashboard";
import { stepsExpediente } from "@/components/stepMetaExpediente";
import PlantelSignatureNamesPanel from "@/components/admin/PlantelSignatureNamesPanel";
import PuestoAdminPanelClient from "@/components/admin/PuestoAdminPanelClient";

const userChecklistKeys = stepsExpediente.filter(
  s => !s.adminUploadOnly && !s.isPlantelSelection
).map(s => s.key);

function isUserExpedienteDigitalComplete(userChecklist) {
  return userChecklistKeys.every(key =>
    userChecklist.some(item => item.type === key && item.fulfilled)
  );
}

export default async function AdminInicioPage({ searchParams }) {
  const cookiesStore = await cookies();
  const session = await getSessionFromCookies(cookiesStore);

  if (!session || !["admin", "superadmin"].includes(session.role)) {
    return (
      <div className="p-10 text-center text-red-700 font-bold min-h-screen bg-[#F6F8FB] flex items-center justify-center">
        No autorizado. Inicia sesión como administrador en el Workspace de Signia.
      </div>
    );
  }

  // Auto-promote logic
  await prisma.user.updateMany({
    where: { role: "candidate", isActive: true, fechaIngreso: { not: null } },
    data: { role: "employee", isApproved: true }
  });

  let planteles = await prisma.plantel.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, label: true, direccion: true, administracion: true, coordinacionGeneral: true }
  });

  let scopedPlantelIds, plantelesScoped;
  if (session.role === "superadmin") {
    scopedPlantelIds = planteles.map(p => p.id);
    plantelesScoped = planteles;
  } else {
    scopedPlantelIds = Array.isArray(session.plantelesAdminIds) ? session.plantelesAdminIds.map(Number).filter(n => !isNaN(n)) : [];
    plantelesScoped = planteles.filter(p => scopedPlantelIds.includes(p.id));
  }

  let usersRaw = await prisma.user.findMany({
    where: { role: { in: ["employee", "candidate"] }, ...(session.role === "admin" ? { plantelId: { in: scopedPlantelIds } } : {}) },
    select: { id: true, name: true, email: true, picture: true, role: true, isApproved: true, plantelId: true, isActive: true, evaId: true, pathId: true, curp: true, puesto: true, fechaIngreso: true, fechaBajaSustituido: true, createdAt: true, updatedAt: true },
    orderBy: { name: "asc" }
  });
  
  const userIds = usersRaw.map(u => u.id);
  
  const allChecklist = await prisma.checklistItem.findMany({
    where: { userId: { in: userIds }, required: true },
    select: { id: true, userId: true, fulfilled: true, type: true }
  });
  const byUserChecklist = {};
  for (const c of allChecklist) (byUserChecklist[c.userId] ||= []).push(c);

  const allDocs = await prisma.document.findMany({
    where: { userId: { in: userIds } },
    select: { id: true, userId: true, type: true, status: true, filePath: true, version: true, uploadedAt: true }
  });
  const byUserDocsLatest = {};
  const projByUser = {};
  for (const doc of allDocs.sort((a, b) => (b.version || 1) - (a.version || 1))) {
    if (!byUserDocsLatest[doc.userId]) byUserDocsLatest[doc.userId] = {};
    if (!byUserDocsLatest[doc.userId][doc.type]) byUserDocsLatest[doc.userId][doc.type] = doc;
    if (doc.type === "proyectivos" && doc.status === "ACCEPTED") projByUser[doc.userId] = true;
  }

  const activeEmployees = usersRaw.filter(u => u.role === "employee" && u.isActive);
  let completedActiveEmployees = 0;
  
  activeEmployees.forEach(u => {
    if (isUserExpedienteDigitalComplete(byUserChecklist[u.id] || []) && !!projByUser[u.id]) {
      completedActiveEmployees++;
    }
  });

  const incompleteActiveEmployees = activeEmployees.length - completedActiveEmployees;

  let admins = [];
  if (session.role === "superadmin") {
    admins = await prisma.user.findMany({
      where: { role: { in: ["admin", "superadmin"] } },
      include: { plantelesAdmin: { select: { id: true } } },
      orderBy: { name: "asc" }
    });
  }

  const users = usersRaw.map(u => {
    const checklistByType = {};
    (byUserChecklist[u.id] || []).forEach(it => { checklistByType[it.type] = it; });
    return {
      ...u,
      checklistByType,
      hasProyectivos: !!(byUserDocsLatest[u.id] || {}).proyectivos,
      hasProyectivosAccepted: !!projByUser[u.id],
    };
  });

  const usedPlantelIds = new Set(users.map(u => u.plantelId).filter(Boolean));
  const filteredPlanteles = plantelesScoped.filter(p => usedPlantelIds.has(p.id));
  const plantelProgressData = filteredPlanteles.map(p => {
    const employees = users.filter(u => u.plantelId === p.id);
    const userDocsGood = employees.filter(u => isUserExpedienteDigitalComplete(byUserChecklist[u.id] || [])).length;
    const expedientesFinal = employees.filter(u => isUserExpedienteDigitalComplete(byUserChecklist[u.id] || []) && !!projByUser[u.id]).length;
    return {
      ...p,
      employees,
      progress: {
        total: employees.length,
        userDocsCompleted: userDocsGood,
        expedientesValidados: expedientesFinal,
        percentDigitalExpedientes: employees.length ? Math.round((userDocsGood / employees.length) * 100) : 0,
        percentFinalExpedientes: employees.length ? Math.round((expedientesFinal / employees.length) * 100) : 0
      }
    };
  });

  return (
    <AdminInicioClient session={session} showSidebar={session.role === "superadmin"}>
      <div className="flex-1 w-full relative pb-24 bg-[#F6F8FB] min-h-screen">
        
        <div className="glass-panel sticky top-0 z-40 px-6 sm:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6A3DF0] to-[#7B4DFF] flex items-center justify-center shadow-md shadow-[#6A3DF0]/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2937] leading-none">
                Signia Analytics
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Control operativo y auditoría de talento</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-[1600px] mx-auto w-full px-6 sm:px-10 py-8 flex flex-col gap-10">
          
          <AdminDashboardStats
            summary={{
              totalActiveEmployees: activeEmployees.length,
              completedActiveEmployees,
              incompleteActiveEmployees,
              totalActiveCandidates: usersRaw.filter(u => u.role === "candidate" && u.isActive).length
            }}
            users={users}
          />

          {session.role === "superadmin" && (
            <section id="hr-insights" className="scroll-mt-28">
              <HRInsightsDashboard users={users} planteles={filteredPlanteles} />
            </section>
          )}

          <section id="user-management" className="scroll-mt-28 fade-in" style={{ animationDelay: '100ms' }}>
            <UserManagementPanel
              users={users}
              planteles={filteredPlanteles}
              adminRole={session.role}
              plantelesPermittedIds={session.role === "superadmin" ? planteles.map(p => p.id) : scopedPlantelIds}
              canAssignPlantel={session.role === "superadmin"}
            />
          </section>

          <section id="plantel-progress" className="scroll-mt-28 fade-in" style={{ animationDelay: '200ms' }}>
            <PlantelProgressPanel planteles={plantelProgressData} />
          </section>
          
          {session.role === "superadmin" && (
            <section id="settings" className="pt-10 mt-6 scroll-mt-28 fade-in" style={{ animationDelay: '300ms' }}>
              <div className="mb-8 border-b border-[#EEF2F7] pb-4">
                <h2 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">Configuración del Workspace</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Administra catálogos, firmas de autoridades y permisos organizacionales.</p>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col gap-8 w-full">
                  <PuestoAdminPanelClient />
                  <PlantelSignatureNamesPanel />
                </div>
                <div className="flex flex-col gap-8 w-full">
                  <PlantelListAdminPanelClient initialPlanteles={planteles} />
                  <PlantelAdminMatrixCrudClient />
                </div>
                <div className="xl:col-span-2">
                  <PlantelAdminMatrix planteles={planteles} admins={admins} />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </AdminInicioClient>
  );
}