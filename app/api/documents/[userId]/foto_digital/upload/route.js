import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/nextauth-options";

export async function POST(req, context) {
  const params = await context.params;
  const { userId } = params;
  const userIdInt = Number(userId);

  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    (
      (session.user.role === "employee" || session.user.role === "candidate") &&
      String(session.user.id) !== String(userIdInt)
    )
  ) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }
  const user = await prisma.user.findUnique({ where: { id: userIdInt } });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) return NextResponse.json({ error: "Falta archivo." }, { status: 400 });

  // Accept jpeg or png only
  if (!file.type || !/^image\/(jpeg|png)$/.test(file.type)) {
    return NextResponse.json({ error: "Solo se permiten imágenes JPG o PNG.", details: `Tipo detectado: ${file.type}` }, { status: 400 });
  }
  const fileBuff = Buffer.from(await file.arrayBuffer());
  if (fileBuff.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Imagen demasiado grande (>5MB)", details: `Tamaño: ${fileBuff.length} bytes` }, { status: 400 });
  }
  const ext = file.type === "image/png" ? ".png" : ".jpg";
  const fname = `foto_digital-${Date.now()}-${nanoid(8)}${ext}`;

  // HTTP upload to storage server
  const outFormData = new FormData();
  outFormData.append("file", new Blob([fileBuff], { type: file.type }), fname);
  outFormData.append("folder", `documents/${userIdInt}`);
  outFormData.append("path", `documents/${userIdInt}`);

  let uploadRes;
  try {
    uploadRes = await fetch("https://expediente.casitaapps.com/upload", {
      method: "POST",
      body: outFormData
    });
  } catch (netErr) {
    console.error("[foto_digital upload] Network error contacting storage server:", netErr);
    return NextResponse.json({ 
      error: "Error de red al contactar el servidor de almacenamiento externo.", 
      details: netErr.message 
    }, { status: 502 });
  }

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text().catch(() => "(Sin respuesta de texto)");
    console.error("[foto_digital upload] Storage server rejected upload", {
      status: uploadRes.status,
      statusText: uploadRes.statusText,
      body: errorText,
      userId: userIdInt
    });
    return NextResponse.json({ 
      error: "El servidor de almacenamiento rechazó la imagen.", 
      details: `HTTP ${uploadRes.status} ${uploadRes.statusText} - ${errorText.substring(0, 300)}` 
    }, { status: 502 });
  }

  try {
    // Only one avatar: update user.picture; also store as a Document
    const url = `/storage/documents/${userIdInt}/${fname}`;
    await prisma.user.update({
      where: { id: userIdInt },
      data: { picture: url }
    });

    // Get next version
    const latest = await prisma.document.findFirst({
      where: { userId: userIdInt, type: "foto_digital" },
      orderBy: { version: "desc" },
      select: { version: true }
    });
    const nextVersion = latest ? latest.version + 1 : 1;

    const doc = await prisma.document.create({
      data: {
        userId: userIdInt,
        type: "foto_digital",
        filePath: url,
        status: "accepted",
        version: nextVersion
      }
    });

    // Checklist fulfilled
    const item = await prisma.checklistItem.create({
      data: {
        userId: userIdInt,
        type: "foto_digital",
        required: true,
        fulfilled: true,
        documentId: doc.id
      }
    });

    return NextResponse.json({ ok: true, id: doc.id, filePath: doc.filePath, checklistItemId: item.id, avatarUrl: url });
  } catch (dbErr) {
    console.error("[foto_digital upload] Database error post-upload:", dbErr);
    return NextResponse.json({ 
      error: "La imagen se subió pero ocurrió un error en la base de datos.", 
      details: dbErr.message 
    }, { status: 500 });
  }
}