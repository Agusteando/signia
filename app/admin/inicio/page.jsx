import { cookies } from "next/headers";
import { getSessionFromCookies } from "@/lib/auth";
import prisma from "@/lib/prisma";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import AdminDashboardStats from "@/components/admin/AdminDashboardStats";
import PlantelProgressPanel from "@/components/admin/PlantelProgressPanel";
import AdminInicioClient from "@/components/admin/AdminInicioClient";
import HRInsightsDashboard from "@/components/admin/HRInsightsDashboard";
import { stepsExpediente } from "@/components/stepMetaExpediente";

const userChecklistKeys = stepsExpediente
  .filter((s) => !s.adminUploadOnly && !s.isPlantelSelection)
  .map((s) => s.key);

function isUserExpedienteDigitalComplete(userChecklist) {
  return userChecklistKeys.every((key) =>
    userChecklist.some((item) => item.type === key && item.fulfilled)
  );
}

export default async function AdminInicioPage() {
  const cookiesStore = await cookies();
  const session = await getSessionFromCookies(cookiesStore);

  if (!session || !["admin", "superadmin"].includes(session.role)) {
    return (
      <div className="p-10 text-center text-red-700 font-medium">
        No autorizado. Inicia sesión como administrador.
      </div>
    );
  }

  const planteles = await prisma.plantel.findMany({
    orderBy: { name: "asc" },
  });

  const scopedPlantelIds =
    session.role === "superadmin"
      ? planteles.map((p) => p.id)
      : (session.plantelesAdminIds ?? []).map(Number).filter(Number.isFinite);

  const usersRaw = await prisma.user.findMany({
    where: {
      role: { in: ["employee", "candidate"] },
      ...(session.role === "admin"
        ? { plantelId: { in: scopedPlantelIds } }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      picture: true,
      role: true,
      isApproved: true,
      plantelId: true,
      isActive: true,
      puesto: true,
    },
  });

  const allChecklist = await prisma.checklistItem.findMany({
    where: {
      userId: { in: usersRaw.map((u) => u.id) },
      required: true,
    },
  });

  const byUserChecklist = {};
  for (const c of allChecklist) {
    (byUserChecklist[c.userId] ||= []).push(c);
  }

  const users = usersRaw.map((u) => ({
    ...u,
    checklistByType: byUserChecklist[u.id] || [],
    hasProyectivos: true,
    fullyCompleted: isUserExpedienteDigitalComplete(byUserChecklist[u.id] || []),
  }));

  const activeEmployees = users.filter(
    (u) => u.role === "employee" && u.isActive
  );

  const activeCandidates = users.filter(
    (u) => u.role === "candidate" && u.isActive
  );

  const plantelesScoped = planteles
    .filter((p) => scopedPlantelIds.includes(p.id))
    .map((plantel) => {
      const plantelUsers = users.filter(
        (u) => u.plantelId === plantel.id && u.isActive
      );

      const plantelEmployees = plantelUsers.filter(
        (u) => u.role === "employee"
      );

      const plantelCandidates = plantelUsers.filter(
        (u) => u.role === "candidate"
      );

      const completedEmployees = plantelEmployees.filter(
        (u) => u.fullyCompleted
      );

      const incompleteEmployees = plantelEmployees.filter(
        (u) => !u.fullyCompleted
      );

      const total = plantelEmployees.length;
      const completed = completedEmployees.length;
      const incomplete = incompleteEmployees.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...plantel,
        users: plantelUsers,
        activeUsers: plantelUsers.length,
        activeEmployees: plantelEmployees.length,
        activeCandidates: plantelCandidates.length,
        completedEmployees: completed,
        incompleteEmployees: incomplete,

        total,
        completed,
        incomplete,
        percentage,

        progress: {
          total,
          completed,
          incomplete,
          percentage,
        },

        summary: {
          total,
          completed,
          incomplete,
          percentage,
        },

        stats: {
          total,
          completed,
          incomplete,
          percentage,
        },
      };
    });

  return (
    <AdminInicioClient session={session} showSidebar={true}>
      <div className="flex-1 w-full relative pb-24">
        <div className="glass-panel sticky top-0 z-40 px-6 sm:px-10 py-5">
          <div className="max-w-screen-2xl mx-auto flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
                Panel de Control{" "}
                <span className="text-gradient-signia">Signia</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Auditoría inteligente y gestión humana
              </p>
            </div>

            <AdminDashboardStats
              summary={{
                totalActiveEmployees: activeEmployees.length,
                completedActiveEmployees: activeEmployees.filter(
                  (u) => u.fullyCompleted
                ).length,
                incompleteActiveEmployees: activeEmployees.filter(
                  (u) => !u.fullyCompleted
                ).length,
                totalActiveCandidates: activeCandidates.length,
              }}
            />
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto w-full px-6 sm:px-10 py-8 flex flex-col gap-10">
          {session.role === "superadmin" && (
            <section id="hr-insights" className="animate-fade-in">
              <HRInsightsDashboard users={users} planteles={plantelesScoped} />
            </section>
          )}

          <section
            id="user-management"
            className="animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            <UserManagementPanel
              users={users}
              planteles={plantelesScoped}
              adminRole={session.role}
              plantelesPermittedIds={scopedPlantelIds}
              canAssignPlantel={session.role === "superadmin"}
            />
          </section>

          <section
            id="plantel-progress"
            className="animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <PlantelProgressPanel planteles={plantelesScoped} />
          </section>
        </div>
      </div>
    </AdminInicioClient>
  );
}