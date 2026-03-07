import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

export async function POST(req) {
  const session = await getSessionFromCookies(req.cookies);
  if (!session || session.role !== "superadmin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  let data;
  try { data = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  
  const { name, email, role, plantelIds } = data;

  if (!name || !email || typeof name !== "string" || typeof email !== "string") {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }
  
  const emailLower = email.trim().toLowerCase();
  if (!/\S+@\S+\.\S+/.test(emailLower)) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  const newRole = role === "superadmin" ? "superadmin" : "admin";
  const pIds = Array.isArray(plantelIds) ? plantelIds : [];

  let user = await prisma.user.findUnique({ where: { email: emailLower } });
  
  if (user) {
    user = await prisma.user.update({
      where: { email: emailLower },
      data: { 
        role: newRole, 
        name, 
        isActive: true,
        plantelesAdmin: newRole === "admin" ? { set: pIds.map(id => ({ id: Number(id) })) } : { set: [] }
      }
    });
  } else {
    user = await prisma.user.create({
      data: { 
        email: emailLower, 
        name, 
        role: newRole, 
        isActive: true,
        plantelesAdmin: newRole === "admin" ? { connect: pIds.map(id => ({ id: Number(id) })) } : undefined
      }
    });
  }
  
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}