export async function writeFileToPublicUploads(file, meta = {}) {
  // Uses the HTTP external upload API ensuring backwards compatibility for legacy usages.
  const ext = (file.name || "pdf").split(".").pop() || "pdf";
  const filename = `doc_${Date.now()}.${ext}`;
  const relDir = `uploads/${meta.userId}/${meta.docType}`;
  
  const formData = new FormData();
  formData.append("file", file, filename);
  formData.append("folder", relDir);
  formData.append("path", relDir);
  
  const res = await fetch("https://expediente.casitaapps.com/upload", {
    method: "POST",
    body: formData
  });
  if (!res.ok) throw new Error("Upload failed");

  const url = "/" + [relDir, filename].join("/");
  return { url, metadata: { ...meta, filename } };
}