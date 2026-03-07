import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

export async function DELETE(req, ctx) {
  const session = await getSessionFromCookies(req.cookies);
  if (!session || session.role !== "superadmin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  
  const admin = await prisma.user.findUnique({ where: { id } });
  if (!admin || !["admin", "superadmin"].includes(admin.role)) {
    return NextResponse.json({ error: "Usuario no existe o no tiene rol administrativo." }, { status: 404 });
  }
  
  // Seguridad: Un superadmin no puede revocar sus propios accesos aquí
  if (admin.id === session.id) {
    return NextResponse.json({ error: "Acción bloqueada: No puedes revocar tu propia cuenta." }, { status: 400 });
  }
  
  // Degradación segura (Downgrade) sin borrar su historial
  await prisma.user.update({
    where: { id },
    data: { 
      role: "employee", 
      plantelesAdmin: { set: [] } 
    }
  });
  
  return NextResponse.json({ ok: true });
}