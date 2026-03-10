import { cookies } from "next/headers";
import { getSessionFromCookies } from "@/lib/auth";
import prisma from "@/lib/prisma";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import AdminNav from "@/components/admin/AdminNav";
import AdminDashboardStats from "@/components/admin/AdminDashboardStats";
import PlantelAdminMatrix from "@/components/admin/PlantelAdminMatrix";
import PlantelListAdminPanelClient from "@/components/admin/PlantelListAdminPanelClient";
import PlantelProgressPanel from "@/components/admin/PlantelProgressPanel";
import PlantelAdminMatrixCrudClient from "@/components/admin/PlantelAdminMatrixCrudClient";
import AdminInicioClient from "@/components/admin/AdminInicioClient";
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
      <div className="p-10 text-center text-red-700 font-medium">
        No autorizado. Inicia sesión como administrador.
      </div>
    );
  }

  let planteles = await prisma.plantel.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, label: true, direccion: true, administracion: true, coordinacionGeneral: true }
  });

  let scopedPlantelIds, plantelesScoped;
  if (session.role === "superadmin") {
    scopedPlantelIds = planteles.map(p => p.id);
    plantelesScoped = planteles;
  } else {
    scopedPlantelIds = Array.isArray(session.plantelesAdminIds)
      ? session.plantelesAdminIds.map(Number).filter(n => !isNaN(n))
      : [];
    plantelesScoped = planteles.filter(p => scopedPlantelIds.includes(p.id));
  }

  let usersRaw = await prisma.user.findMany({
    where: {
      role: { in: ["employee", "candidate"] },
      ...(session.role === "admin" ? { plantelId: { in: scopedPlantelIds } } : {})
    },
    select: {
      id: true, name: true, email: true, picture: true, role: true, isApproved: true, plantelId: true, isActive: true,
      evaId: true, pathId: true,
    },
    orderBy: { name: "asc" }
  });
  const userIds = usersRaw.map(u => u.id);
  if (session.role === "admin") {
    usersRaw = usersRaw.filter(u => u.plantelId && scopedPlantelIds.includes(u.plantelId));
  }

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
  for (const doc of allDocs.sort((a, b) => (b.version || 1) - (a.version || 1))) {
    if (!byUserDocsLatest[doc.userId]) byUserDocsLatest[doc.userId] = {};
    if (!byUserDocsLatest[doc.userId][doc.type]) byUserDocsLatest[doc.userId][doc.type] = doc;
  }
  const projByUser = {};
  for (const d of allDocs) {
    if (d.type === "proyectivos" && d.status === "ACCEPTED") projByUser[d.userId] = true;
  }

  const totalUsers = usersRaw.length;
  let userDocsCompleted = 0;
  let expedientesValidados = 0;
  usersRaw.forEach(u => {
    const checklist = byUserChecklist[u.id] || [];
    const digitalComplete = isUserExpedienteDigitalComplete(checklist);
    if (digitalComplete) userDocsCompleted++;
    if (digitalComplete && !!projByUser[u.id]) expedientesValidados++;
  });
  const percentDigitalExpedientes = totalUsers === 0 ? 0 : Math.round((userDocsCompleted / totalUsers) * 100);
  const percentFinalExpedientes = totalUsers === 0 ? 0 : Math.round((expedientesValidados / totalUsers) * 100);
  const totalPlanteles = plantelesScoped.length;
  const totalDocuments = await prisma.document.count();

  let admins = [];
  if (session.role === "superadmin") {
    admins = await prisma.user.findMany({
      where: { role: { in: ["admin", "superadmin"] } },
      include: { plantelesAdmin: { select: { id: true } } },
      orderBy: { name: "asc" }
    });
  }

  const users = usersRaw.map(u => {
    const checklistItems = byUserChecklist[u.id] || [];
    const checklistByType = {};
    checklistItems.forEach(it => { checklistByType[it.type] = it; });
    const docsByType = byUserDocsLatest[u.id] || {};
    return {
      ...u,
      checklistByType,
      hasProyectivos: !!docsByType.proyectivos,
      documentsByType: docsByType,
      hasProyectivosAccepted: !!projByUser[u.id],
    };
  });

  const usedPlantelIds = new Set(users.map(u => u.plantelId).filter(Boolean));
  const filteredPlanteles = plantelesScoped.filter(p => usedPlantelIds.has(p.id));
  const plantelProgressData = filteredPlanteles.map(p => {
    const employees = users.filter(u => u.plantelId === p.id);
    const userDocsGood = employees.filter(u => isUserExpedienteDigitalComplete(byUserChecklist[u.id] || [])).length;
    const expedientesFinal = employees.filter(u =>
      isUserExpedienteDigitalComplete(byUserChecklist[u.id] || []) && !!projByUser[u.id]
    ).length;
    const percentDigital = employees.length === 0 ? 0 : Math.round((userDocsGood / employees.length) * 100);
    const percentFinal = employees.length === 0 ? 0 : Math.round((expedientesFinal / employees.length) * 100);
    return {
      ...p,
      employees,
      progress: {
        total: employees.length,
        userDocsCompleted: userDocsGood,
        expedientesValidados: expedientesFinal,
        percentDigitalExpedientes: percentDigital,
        percentFinalExpedientes: percentFinal
      }
    };
  });

  return (
    <AdminInicioClient session={session} showSidebar={session.role === "superadmin"}>
      {/* Fallback support for existing AdminNav */}
      <AdminNav session={session} />
      
      <div className="flex-1 w-full relative h-screen overflow-y-auto overflow-x-hidden font-sans">
        
        {/* Top Header */}
        <div className="glass-panel sticky top-0 z-40 px-6 sm:px-10 py-5">
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-0.5">Dashboard General</h1>
              <p className="text-sm text-slate-500 font-medium">Resumen y auditoría de expedientes laborales</p>
            </div>
            <AdminDashboardStats
              summary={{
                userDocsCompleted,
                totalUsers,
                totalPlanteles,
                percentDigitalExpedientes,
                percentFinalExpedientes,
                totalDocuments,
              }}
            />
          </div>
        </div>
        
        <div className="max-w-screen-2xl mx-auto w-full px-6 sm:px-10 py-8 flex flex-col gap-8">
          <section id="user-management">
            <UserManagementPanel
              users={users}
              planteles={filteredPlanteles}
              adminRole={session.role}
              plantelesPermittedIds={session.role === "superadmin" ? planteles.map(p => p.id) : scopedPlantelIds}
              canAssignPlantel={session.role === "superadmin"}
            />
          </section>

          <section id="plantel-progress">
            <PlantelProgressPanel planteles={plantelProgressData} />
          </section>
          
          {session.role === "superadmin" && (
            <section id="settings" className="border-t border-slate-200/80 pt-10 mt-4">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Configuración de Plataforma</h2>
                <p className="text-sm text-slate-500 mt-1">Administra catálogos, firmas de autoridades y permisos por plantel.</p>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col gap-6 w-full">
                  <PuestoAdminPanelClient />
                  <PlantelSignatureNamesPanel />
                </div>
                <div className="flex flex-col gap-6 w-full">
                  <PlantelListAdminPanelClient initialPlanteles={planteles} onRefresh={null} />
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