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
      const errorText = await res.text().catch(() => "");
      console.error("[storage proxy] External fetch failed for path:", externalUrl, "Status:", res.status, errorText.substring(0, 150));
      return NextResponse.json({ 
        error: "Archivo no encontrado o servidor inaccesible.",
        details: `HTTP ${res.status} - ${errorText.substring(0, 100)}` 
      }, { status: res.status === 404 ? 404 : 502 });
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
    console.error("[storage proxy] Network failure contacting external server:", externalUrl, err);
    return NextResponse.json({ 
      error: "No se pudo abrir el archivo desde el servidor.",
      details: err.message
    }, { status: 500 });
  }
}