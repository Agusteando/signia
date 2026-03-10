export async function fetchIngressioEmployees() {
  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <EnviaTablaEmpleadosALL xmlns="http://tempuri.org/">
      <p_Seguridad>375</p_Seguridad>
    </EnviaTablaEmpleadosALL>
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch('http://www.ingressioenlanube.com:5002/ServicioWeb/ServicioW.asmx', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': '"http://tempuri.org/EnviaTablaEmpleadosALL"'
    },
    body: soapBody,
    // Se recomienda desactivar el caché para garantizar datos frescos en cada clic
    cache: 'no-store' 
  });

  if (!response.ok) {
    throw new Error(`Error HTTP conectando a Ingressio: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  
  // 1. Aislar únicamente el bloque diffgram que contiene la data real, omitiendo el xs:schema
  const diffgramMatch = xml.match(/<diffgr:diffgram[^>]*>([\s\S]*?)<\/diffgr:diffgram>/i);
  
  // Si no hay diffgram, es probable que la respuesta venga vacía desde Ingressio
  if (!diffgramMatch) return [];
  
  const dataSection = diffgramMatch[1];
  
  // 2. Extraer todas las etiquetas <T_Empleado> ... </T_Empleado>
  // Se excluyen auto-cierres o etiquetas tipo <xs:element name="T_Empleado">
  const tEmpleadoRegex = /<T_Empleado(?:[^>]*)>([\s\S]*?)<\/T_Empleado>/gi;
  let match;
  const employees = [];
  
  // Helper para extraer el valor de una etiqueta específica dentro del bloque T_Empleado
  const extract = (block, tag) => {
    const regex = new RegExp(`<${tag}(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const m = block.match(regex);
    if (!m) return null;
    
    // Decodificar entidades XML básicas
    return m[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
  };

  // 3. Iterar sobre todos los empleados detectados
  while ((match = tEmpleadoRegex.exec(dataSection)) !== null) {
    const block = match[1];
    
    // Se extraen todos los campos permitidos y se omiten explícitamente aquellos 
    // críticos o innecesarios como "Contrasenia"
    employees.push({
      ID_Empleado: extract(block, 'ID_Empleado'),
      ID_Persona: extract(block, 'ID_Persona'),
      ID_Municipio: extract(block, 'ID_Municipio'),
      ClaveMunicipio: extract(block, 'ClaveMunicipio'),
      ID_Estado: extract(block, 'ID_Estado'),
      ClaveEstado: extract(block, 'ClaveEstado'),
      ClaveUnica: extract(block, 'ClaveUnica'),
      ClaveNomina: extract(block, 'ClaveNomina'),
      Nombre: extract(block, 'Nombre'),
      ApellidoPaterno: extract(block, 'ApellidoPaterno'),
      ApellidoMaterno: extract(block, 'ApellidoMaterno'),
      NombreCompleto: extract(block, 'NombreCompleto'),
      FechaNacimiento: extract(block, 'FechaNacimiento'),
      Sexo: extract(block, 'Sexo'),
      CURP: extract(block, 'CURP'),
      RFC: extract(block, 'RFC'),
      NIN: extract(block, 'NIN'),
      Correo: extract(block, 'Correo'),
      Telefono1: extract(block, 'Telefono1'),
      Direccion: extract(block, 'Direccion'),
      CP: extract(block, 'CP'),
      ID_Area: extract(block, 'ID_Area'),
      ClaveArea: extract(block, 'ClaveArea'),
      ID_Puesto: extract(block, 'ID_Puesto'),
      ClavePuesto: extract(block, 'ClavePuesto'),
      ID_Departamento: extract(block, 'ID_Departamento'),
      ClaveDepartamento: extract(block, 'ClaveDepartamento'),
      ID_Grupo: extract(block, 'ID_Grupo'),
      ClaveGrupo: extract(block, 'ClaveGrupo'),
      FechaIngreso: extract(block, 'FechaIngreso'),
      FechaBaja: extract(block, 'FechaBaja'),
      Sueldo: extract(block, 'Sueldo'),
      EsActivo: extract(block, 'EsActivo') === 'true',
      EsAdministrador: extract(block, 'EsAdministrador') === 'true',
      ComentariosEmpleado: extract(block, 'ComentariosEmpleado'),
    });
  }

  return employees;
}