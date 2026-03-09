import { NextResponse } from "next/server";

export async function GET(req, context) {
  const params = await context.params;
  const fileArr = params.file;

  if (!Array.isArray(fileArr) || fileArr.length === 0) {
    return NextResponse.json({ error: "Archivo no especificado" }, { status: 400 });
  }

  // Validate path components
  const isValid = fileArr.every(p => /^[\w\-\.]+$/.test(p));
  if (!isValid) {
    return NextResponse.json({ error: "Ruta inválida." }, { status: 400 });
  }

  // NextJS App Router proxies the response from the external storage server securely
  const externalUrl = `https://expediente.casitaapps.com/documents/${fileArr.join("/")}`;

  try {
    const res = await fetch(externalUrl);
    if (!res.ok) {
      return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
    }
    
    // Determine content type accurately for PDF previews and Images
    const ext = fileArr[fileArr.length - 1].split('.').pop().toLowerCase();
    let contentType = res.headers.get("content-type") || "application/octet-stream";
    if (ext === "pdf") contentType = "application/pdf";
    else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    else if (ext === "png") contentType = "image/png";

    // Streaming the response back to the client directly from memory/buffer
    return new NextResponse(res.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${fileArr[fileArr.length-1]}"`,
        "Cache-Control": "public, max-age=86400",
      }
    });
  } catch (err) {
    return NextResponse.json({ error: "No se pudo abrir el archivo desde el servidor." }, { status: 500 });
  }
}