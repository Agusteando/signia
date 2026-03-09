import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";
import path from "path";

export const runtime = "nodejs";

export async function POST(req, context) {
  const params = await context.params;
  void params;

  const session = await getSessionFromCookies(req.cookies);
  if (!session || session.role !== "superadmin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    console.log("[migrate-proyectivos] Starting migration from /uploads to external /storage/documents");

    const docs = await prisma.document.findMany({
      where: {
        type: "proyectivos",
        OR: [
          { filePath: { startsWith: "/uploads" } },
          { filePath: { startsWith: "uploads" } },
        ],
      },
      select: {
        id: true,
        userId: true,
        filePath: true,
      },
    });

    let migrated = 0;
    let skippedMissingFile = 0;
    let copyErrors = 0;
    let updateErrors = 0;

    for (const doc of docs) {
      const rawPath = doc.filePath || "";
      const relativeOld = rawPath.replace(/^\/+/, ""); // strip leading slash

      if (!relativeOld.startsWith("uploads")) {
        console.log("[migrate-proyectivos] Skipping non-uploads filePath", { documentId: doc.id });
        continue;
      }

      // Fetch the legacy document from the storage server
      const oldUrl = `https://expediente.casitaapps.com/${relativeOld}`;
      let res;
      try {
        res = await fetch(oldUrl);
      } catch (e) {
        skippedMissingFile += 1;
        continue;
      }

      if (!res.ok) {
        console.warn("[migrate-proyectivos] Legacy file missing on external server, skipping", { documentId: doc.id });
        skippedMissingFile += 1;
        continue;
      }

      const ext = path.extname(relativeOld) || "";
      const newFileName = `${doc.id}${ext}`;
      const destRelativeForDb = `/storage/documents/${doc.userId}/${newFileName}`;

      const buffer = Buffer.from(await res.arrayBuffer());
      const outFormData = new FormData();
      outFormData.append("file", new Blob([buffer]), newFileName);
      outFormData.append("folder", `documents/${doc.userId}`);
      outFormData.append("path", `documents/${doc.userId}`);

      try {
        const uploadRes = await fetch("https://expediente.casitaapps.com/upload", {
          method: "POST",
          body: outFormData
        });
        if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
      } catch (copyErr) {
        console.error("[migrate-proyectivos] Error uploading migrated file", {
          documentId: doc.id,
          errorMessage: copyErr?.message || String(copyErr),
        });
        copyErrors += 1;
        continue;
      }

      try {
        await prisma.document.update({
          where: { id: doc.id },
          data: { filePath: destRelativeForDb },
        });
      } catch (updateErr) {
        console.error("[migrate-proyectivos] Error updating document record", {
          documentId: doc.id,
          errorMessage: updateErr?.message || String(updateErr),
        });
        updateErrors += 1;
        continue;
      }

      migrated += 1;
    }

    console.log("[migrate-proyectivos] Migration finished", {
      totalCandidates: docs.length,
      migrated,
      skippedMissingFile,
      copyErrors,
      updateErrors,
    });

    return NextResponse.json({
      totalCandidates: docs.length,
      migrated,
      skippedMissingFile,
      copyErrors,
      updateErrors,
    });
  } catch (err) {
    console.error("[migrate-proyectivos] Fatal migration error", {
      errorMessage: err?.message || String(err),
      stack: err?.stack,
    });

    return NextResponse.json(
      { error: "Error durante la migración de proyectivos." },
      { status: 500 }
    );
  }
}