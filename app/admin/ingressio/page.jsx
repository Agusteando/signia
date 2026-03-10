import { cookies } from "next/headers";
import { getSessionFromCookies } from "@/lib/auth";
import AdminInicioClient from "@/components/admin/AdminInicioClient";
import IngressioDashboardClient from "@/components/admin/ingressio/IngressioDashboardClient";
import prisma from "@/lib/prisma";

export const metadata = { title: "Ingressio Sync | Signia Admin" };

export default async function IngressioPage() {
  const cookiesStore = await cookies();
  const session = await getSessionFromCookies(cookiesStore);

  if (!session || session.role !== "superadmin") {
    return (
      <div className="p-10 text-center text-red-700 font-bold min-h-screen bg-slate-50 flex items-center justify-center">
        Acceso Denegado. Se requieren privilegios de Superadmin para la Normalización de Identidad.
      </div>
    );
  }

  // Graceful fallback fetch for signiaUsers if `ingressioId` does not yet exist in Prisma schema.
  let signiaUsers = [];
  try {
    signiaUsers = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, curp: true, rfc: true, nss: true, 
        role: true, isActive: true, plantelId: true, puesto: true, fechaIngreso: true,
        ingressioId: true 
      }
    });
  } catch (err) {
    console.warn("Schema out of date for ingressioId, falling back without ingressioId...", err.message);
    signiaUsers = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, curp: true, rfc: true, nss: true, 
        role: true, isActive: true, plantelId: true, puesto: true, fechaIngreso: true
      }
    });
  }

  return (
    <AdminInicioClient session={session} showSidebar={true}>
      <IngressioDashboardClient signiaUsers={signiaUsers} />
    </AdminInicioClient>
  );
}