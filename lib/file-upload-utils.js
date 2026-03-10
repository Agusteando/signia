export async function writeFileToPublicUploads(file, meta = {}) {
  // Uses the HTTP external upload API ensuring backwards compatibility for legacy usages.
  const ext = (file.name || "pdf").split(".").pop() || "pdf";
  const filename = `doc_${Date.now()}.${ext}`;
  const relDir = `uploads/${meta.userId}/${meta.docType}`;
  
  const formData = new FormData();
  formData.append("file", file, filename);
  formData.append("folder", relDir);
  formData.append("path", relDir);
  
  let res;
  try {
    res = await fetch("https://expediente.casitaapps.com/upload.ashx", {
      method: "POST",
      body: formData
    });
  } catch (netErr) {
    console.error("[writeFileToPublicUploads] Network error contacting storage server:", netErr);
    throw new Error(`Upload network error: ${netErr.message}`);
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "(Sin respuesta)");
    console.error("[writeFileToPublicUploads] External server rejected upload", {
      status: res.status,
      body: errorText
    });
    throw new Error(`Upload failed HTTP ${res.status}: ${errorText.substring(0, 300)}`);
  }

  const url = "/" + [relDir, filename].join("/");
  return { url, metadata: { ...meta, filename } };
}