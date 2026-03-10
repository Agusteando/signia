import { NextResponse } from "next/server";

// Force Next.js to never statically cache this proxy route
export const dynamic = "force-dynamic";

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
    // cache: "no-store" guarantees we fetch the newly uploaded file and don't cache a 404
    const res = await fetch(externalUrl, { cache: "no-store" });
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

    // Buffer the file completely instead of streaming. 
    // This forces Next.js to calculate and attach a perfect Content-Length header.
    // Without Content-Length, Chrome/Edge PDF viewers abort and show "No se pudo cargar el PDF".
    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(arrayBuffer.byteLength),
        "Content-Disposition": `inline; filename="${fileArr[fileArr.length-1]}"`,
        "Cache-Control": "public, max-age=3600",
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