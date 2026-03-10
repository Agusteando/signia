import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

export async function POST(req) {
  const session = await getSessionFromCookies(req.cookies);
  if (!session || session.role !== "superadmin") {
    return NextResponse.json({ error: "No autorizado. Solo nivel Superadmin." }, { status: 403 });
  }

  try {
    // Find all active candidates who have a hire date (fechaIngreso) assigned
    // and promote them to employee with isApproved = true
    const result = await prisma.user.updateMany({
      where: {
        role: "candidate",
        isActive: true,
        fechaIngreso: { not: null }
      },
      data: {
        role: "employee",
        isApproved: true
      }
    });

    return NextResponse.json({ ok: true, count: result.count });
  } catch (error) {
    console.error("[ingressio-update-roles] Error al promover roles:", error);
    return NextResponse.json({ error: "Error al actualizar roles." }, { status: 500 });
  }
}