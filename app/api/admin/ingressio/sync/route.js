import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchIngressioEmployees } from "@/lib/ingressio/soapClient";
import { calculateMatches } from "@/lib/ingressio/matchingEngine";
import { getSessionFromCookies } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  // 1. Validar identidad
  const session = await getSessionFromCookies(req.cookies);
  if (!session || session.role !== "superadmin") {
    return NextResponse.json({ error: "No autorizado. Solo nivel Superadmin." }, { status: 403 });
  }

  try {
    // 2. Extraer todos los empleados desde el WebService SOAP de Ingressio
    const ingressioRecords = await fetchIngressioEmployees();
    
    // 3. Extraer todos los usuarios de Signia para aplicar el Matching
    // El catch previene errores fatales si Prisma aún no ha ejecutado el 'prisma db push' para el campo ingressioId.
    let signiaUsers = [];
    try {
      signiaUsers = await prisma.user.findMany({
        select: {
          id: true, name: true, email: true, curp: true, rfc: true, nss: true, ingressioId: true
        }
      });
    } catch (err) {
      console.warn("[ingressio-sync] Fallback ejecutado: Campo ingressioId no disponible en BD aún.");
      signiaUsers = await prisma.user.findMany({
        select: {
          id: true, name: true, email: true, curp: true, rfc: true, nss: true
        }
      });
    }

    // 4. Calcular el nivel de confianza de cruce
    const matches = calculateMatches(ingressioRecords, signiaUsers);
    
    // 5. Devolver al frontend sin modificar aún la base de datos (Dry-Run seguro)
    return NextResponse.json({ ok: true, count: ingressioRecords.length, matches });
  } catch (error) {
    console.error("[ingressio-sync] Error Crítico:", error);
    return NextResponse.json({ error: error.message || "Error procesando el origen de datos SOAP." }, { status: 500 });
  }
}