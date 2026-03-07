import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET(req) {
  const session = await getSessionFromCookies(req.cookies);
  if (!session || session.role !== "superadmin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  // Recuperamos administradores y superadministradores
  const admins = await prisma.user.findMany({
    where: { role: { in: ["admin", "superadmin"] } },
    select: {
      id: true,
      name: true,
      email: true,
      picture: true,
      role: true,
      plantelesAdmin: { select: { id: true, name: true } },
      isActive: true,
    },
    orderBy: [
      { role: "desc" }, // superadmin primero
      { name: "asc" }
    ]
  });
  const planteles = await prisma.plantel.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({ admins, planteles });
}

export async function PATCH(req) {
  const session = await getSessionFromCookies(req.cookies);
  if (!session || session.role !== "superadmin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  let data;
  try { data = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  
  const { id, role, plantelIds } = data;
  if (!id || !role) return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 });

  const targetId = Number(id);
  const newRole = role === "superadmin" ? "superadmin" : "admin";
  const pIds = Array.isArray(plantelIds) ? plantelIds : [];

  // Seguridad: Un superadmin no puede degradarse a si mismo accidentalmente a un rol inferior
  if (session.id === targetId && newRole !== "superadmin") {
    return NextResponse.json({ error: "No puedes degradar tus propios permisos." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: {
      role: newRole,
      plantelesAdmin: newRole === "admin" ? { set: pIds.map(pid => ({ id: Number(pid) })) } : { set: [] }
    },
    select: {
      id: true, name: true, email: true, picture: true, role: true, plantelesAdmin: { select: { id: true, name: true } }, isActive: true
    }
  });

  return NextResponse.json({ ok: true, admin: updated });
}