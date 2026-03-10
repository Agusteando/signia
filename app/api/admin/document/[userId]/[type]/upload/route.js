import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";
import path from "path";

export const runtime = "nodejs";

export async function POST(req, context) {
  const params = await context.params;
  const userIdParam = params?.userId;
  const typeParam = params?.type;

  const userId = Number(userIdParam);
  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "ID de usuario inválido." }, { status: 400 });
  }

  const type = String(typeParam || "documento");

  const session = await getSessionFromCookies(req.cookies);
  if (!session || !["admin", "superadmin"].includes(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let createdDocumentId = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No se recibió archivo válido en el campo 'file'." },
        { status: 400 }
      );
    }

    const originalName = file.name || "archivo";
    const safeBaseName = originalName.replace(/[^\w.\-]/g, "_");
    const ext = path.extname(safeBaseName) || "";

    // Determine next version number for this user+type
    const latestDoc = await prisma.document.findFirst({
      where: { userId, type },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const nextVersion = (latestDoc?.version ?? 0) + 1;

    // Create the Document first to get a stable ID for the file name
    const created = await prisma.document.create({
      data: {
        userId,
        type,
        status: "PENDING",
        filePath: "PENDING_PATH",
        version: nextVersion,
      },
      select: { id: true },
    });

    createdDocumentId = created.id;
    const fileName = `${createdDocumentId}${ext}`;

    // Convert file to buffer and perform HTTP upload to the storage server
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const outFormData = new FormData();
    outFormData.append("file", new Blob([buffer], { type: file.type || "application/octet-stream" }), fileName);
    outFormData.append("folder", `documents/${userId}`);
    outFormData.append("path", `documents/${userId}`);

    console.log("[admin-upload-doc] Uploading admin document to storage server", {
      userId,
      type,
      documentId: createdDocumentId,
      fileName
    });

    let uploadRes;
    try {
      uploadRes = await fetch("https://expediente.casitaapps.com/upload", {
        method: "POST",
        body: outFormData,
      });
    } catch (netErr) {
      console.error("[admin-upload-doc] Network error contacting storage server:", netErr);
      throw new Error(`Fallo de red conectando al servidor externo: ${netErr.message}`);
    }

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text().catch(() => "(Sin respuesta de texto)");
      throw new Error(`External storage upload failed: HTTP ${uploadRes.status} ${uploadRes.statusText} - ${errorText.substring(0, 300)}`);
    }

    // URL path exposed to the browser
    const filePublicPath = [
      "",
      "storage",
      "documents",
      String(userId),
      fileName,
    ].join("/");

    const updated = await prisma.document.update({
      where: { id: createdDocumentId },
      data: { filePath: filePublicPath },
      select: {
        id: true,
        userId: true,
        type: true,
        status: true,
        filePath: true,
        version: true,
        uploadedAt: true,
      },
    });

    console.log("[admin-upload-doc] Upload complete", {
      documentId: updated.id,
      userId: updated.userId,
      type: updated.type,
      filePath: updated.filePath,
      version: updated.version,
    });

    return NextResponse.json({ document: updated });
  } catch (err) {
    console.error("[admin-upload-doc] Error during upload", {
      errorMessage: err?.message || String(err),
      userId,
      type,
      createdDocumentId,
    });

    // Best effort cleanup: delete placeholder document
    if (createdDocumentId) {
      try {
        await prisma.document.delete({ where: { id: createdDocumentId } });
        console.log("[admin-upload-doc] Rolled back placeholder document", {
          documentId: createdDocumentId,
        });
      } catch (rollbackErr) {
        console.error("[admin-upload-doc] Failed to roll back placeholder document", {
          documentId: createdDocumentId,
          errorMessage: rollbackErr?.message || String(rollbackErr),
        });
      }
    }

    return NextResponse.json(
      { 
        error: "Error al procesar y guardar el archivo.",
        details: err?.message || "Excepción desconocida."
      },
      { status: 500 }
    );
  }
}