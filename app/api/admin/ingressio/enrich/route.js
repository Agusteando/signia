import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

export async function POST(req) {
  const session = await getSessionFromCookies(req.cookies);
  if (!session || session.role !== "superadmin") {
    return NextResponse.json({ error: "No autorizado. Solo nivel Superadmin." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { signiaUserId, payload } = body;

    if (!signiaUserId) {
      return NextResponse.json({ error: "El ID del usuario de Signia es obligatorio." }, { status: 400 });
    }

    // Preparar el objeto de actualización ignorando los nulos
    const updateData = {};
    if (payload.curp) updateData.curp = payload.curp;
    if (payload.rfc) updateData.rfc = payload.rfc;
    if (payload.nss) updateData.nss = payload.nss;
    if (payload.puesto) updateData.puesto = payload.puesto;
    
    // Si la BD de Prisma ya fue actualizada con ingressioId, se le asigna permanentemente
    if (payload.ingressioId) {
      try {
        updateData.ingressioId = payload.ingressioId;
      } catch (e) {
        // Fallback silencioso por diseño si no se aplicó el schema aún
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(signiaUserId) },
      data: updateData
    });

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (error) {
    console.error("[ingressio-enrich] Error al actualizar BD:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}