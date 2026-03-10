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
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "No hay registros para enriquecer." }, { status: 400 });
    }

    let successCount = 0;

    // Process each update
    for (const u of updates) {
      const { signiaUserId, payload } = u;
      
      if (!signiaUserId || Object.keys(payload).length === 0) continue;

      const updateData = {};
      
      if (payload.name) updateData.name = payload.name;
      if (payload.curp) updateData.curp = payload.curp;
      if (payload.rfc) updateData.rfc = payload.rfc;
      if (payload.nss) updateData.nss = payload.nss;
      if (payload.puesto) updateData.puesto = payload.puesto;
      if (payload.email) updateData.email = payload.email;
      if (typeof payload.isActive === 'boolean') updateData.isActive = payload.isActive;
      
      if (payload.fechaIngreso) {
        const d = new Date(payload.fechaIngreso);
        if (!isNaN(d.getTime())) {
          updateData.fechaIngreso = d;
        }
      }

      if (payload.ingressioId) {
        try { updateData.ingressioId = payload.ingressioId; } catch(e) {}
      }

      await prisma.user.update({
        where: { id: Number(signiaUserId) },
        data: updateData
      });

      successCount++;
    }

    return NextResponse.json({ ok: true, count: successCount });
  } catch (error) {
    console.error("[ingressio-enrich-bulk] Error al enriquecer masivamente:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}