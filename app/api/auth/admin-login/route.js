import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { OAuth2Client } from "google-auth-library";

const GSI_CLIENT_ID = process.env.NEXT_PUBLIC_GSI_CLIENT_ID;

export async function POST(req) {
  try {
    const { credential } = await req.json();
    if (!credential) return NextResponse.json({ error: "Faltan credenciales." }, { status: 400 });

    const client = new OAuth2Client(GSI_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GSI_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Solo se permite el dominio institucional
    if (
      typeof email !== "string" ||
      !/@casitaiedis\.edu\.mx$/.test(email)
    ) {
      return NextResponse.json({ error: "Solo administradores IECS-IEDIS autorizados." }, { status: 403 });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    
    // Verificación estricta de rol
    if (user) {
      if (!["admin", "superadmin"].includes(user.role)) {
        return NextResponse.json({ error: "Acceso denegado. No tienes rol de administrador asignado en el sistema." }, { status: 403 });
      }
      user = await prisma.user.update({
        where: { email },
        data: { name, picture, isActive: true },
      });
    } else {
      // Si no existe, rechazamos la conexión, NO LO CREAMOS como administrador
      return NextResponse.json({ error: "Cuenta no registrada como administrador. Contacta a soporte para que te otorguen acceso." }, { status: 403 });
    }

    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
    setSessionCookie(res, user);
    return res;
  } catch (e) {
    console.error("[GSI-ADMIN]", e);
    return NextResponse.json({ error: "Acceso denegado" }, { status: 500 });
  }
}