export function calculateMatches(ingressioRecords, signiaUsers) {
  const matches = [];

  for (const inc of ingressioRecords) {
    let bestMatch = null;
    let bestScore = 0;
    let bestReason = [];

    for (const user of signiaUsers) {
      let score = 0;
      let reason = [];

      // 1. Identidad Explícita y Canónica (El ID ya había sido enlazado antes)
      if (user.ingressioId && String(user.ingressioId) === String(inc.ID_Empleado)) {
        score += 100; 
        reason.push("ID Ingressio Existente");
      }
      
      // 2. Identificadores Oficiales de Alta Confianza (Cuentan casi como match directo)
      if (user.curp && inc.CURP && user.curp.trim().toUpperCase() === inc.CURP.trim().toUpperCase()) {
        score += 90; 
        reason.push("CURP exacto");
      }
      if (user.rfc && inc.RFC && user.rfc.trim().toUpperCase() === inc.RFC.trim().toUpperCase()) {
        score += 80; 
        reason.push("RFC exacto");
      }
      if (user.nss && inc.NIN && user.nss.trim() === inc.NIN.trim()) {
        score += 70; 
        reason.push("NSS exacto");
      }
      
      // 3. Correos e Identificadores Operativos
      if (user.email && inc.Correo && user.email.trim().toLowerCase() === inc.Correo.trim().toLowerCase()) {
        score += 60; 
        reason.push("Correo exacto");
      }
      
      // 4. Coincidencia Probabilística por Nombre (Fuzzy simple)
      const sName = (user.name || "").trim().toLowerCase();
      const iName = (inc.NombreCompleto || "").trim().toLowerCase();
      if (sName && iName && sName === iName) {
        score += 50; 
        reason.push("Nombre exacto");
      }

      if (score > bestScore) {
        bestScore = score;
        bestReason = reason;
        bestMatch = user;
      }
    }

    // Se agrega al listado de matches. Si no hubo match, signiaUser será null.
    if (bestMatch && bestScore > 0) {
      matches.push({
        ingressioId: inc.ID_Empleado,
        signiaUserId: bestMatch.id,
        confidence: Math.min(bestScore, 100),
        reason: bestReason.join(" + "),
        ingressioEmp: inc,
        signiaUser: bestMatch
      });
    } else {
      matches.push({
        ingressioId: inc.ID_Empleado,
        signiaUserId: null,
        confidence: 0,
        reason: "Sin coincidencia en Signia",
        ingressioEmp: inc,
        signiaUser: null
      });
    }
  }

  // Ordenar primero aquellos con match más fuerte, dejando los no encontrados al final
  return matches.sort((a,b) => b.confidence - a.confidence);
}