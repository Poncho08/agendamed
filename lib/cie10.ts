export interface CodigoCIE10 {
  codigo: string
  descripcion: string
}

// Diagnósticos más frecuentes en consulta general / primer nivel de atención en México
export const CIE10: CodigoCIE10[] = [
  // Respiratorio
  { codigo: "J00", descripcion: "Rinofaringitis aguda (resfriado común)" },
  { codigo: "J06.9", descripcion: "Infección aguda de las vías respiratorias superiores, no especificada" },
  { codigo: "J02.9", descripcion: "Faringitis aguda, no especificada" },
  { codigo: "J03.9", descripcion: "Amigdalitis aguda, no especificada" },
  { codigo: "J04.0", descripcion: "Laringitis aguda" },
  { codigo: "J20.9", descripcion: "Bronquitis aguda, no especificada" },
  { codigo: "J18.9", descripcion: "Neumonía, no especificada" },
  { codigo: "J45.9", descripcion: "Asma, no especificada" },
  { codigo: "J30.4", descripcion: "Rinitis alérgica, no especificada" },
  { codigo: "J11.1", descripcion: "Influenza con otras manifestaciones respiratorias" },

  // Digestivo
  { codigo: "K59.0", descripcion: "Estreñimiento" },
  { codigo: "K58.9", descripcion: "Síndrome de colon irritable, sin diarrea" },
  { codigo: "K21.0", descripcion: "Enfermedad por reflujo gastroesofágico con esofagitis" },
  { codigo: "K21.9", descripcion: "Enfermedad por reflujo gastroesofágico sin esofagitis" },
  { codigo: "K29.7", descripcion: "Gastritis, no especificada" },
  { codigo: "K25.9", descripcion: "Úlcera gástrica, no especificada" },
  { codigo: "A09", descripcion: "Diarrea y gastroenteritis de presunto origen infeccioso" },
  { codigo: "K92.1", descripcion: "Melena" },
  { codigo: "K57.3", descripcion: "Enfermedad diverticular del intestino grueso sin perforación ni absceso" },

  // Cardiovascular
  { codigo: "I10", descripcion: "Hipertensión esencial (primaria)" },
  { codigo: "I25.1", descripcion: "Enfermedad aterosclerótica del corazón" },
  { codigo: "I50.9", descripcion: "Insuficiencia cardíaca, no especificada" },
  { codigo: "I48", descripcion: "Fibrilación y aleteo auricular" },
  { codigo: "I20.9", descripcion: "Angina de pecho, no especificada" },
  { codigo: "I63.9", descripcion: "Infarto cerebral, no especificado" },

  // Endocrino / Metabólico
  { codigo: "E11.9", descripcion: "Diabetes mellitus tipo 2 sin complicaciones" },
  { codigo: "E11.65", descripcion: "Diabetes mellitus tipo 2 con hiperglucemia" },
  { codigo: "E78.5", descripcion: "Hiperlipidemia, no especificada" },
  { codigo: "E78.0", descripcion: "Hipercolesterolemia pura" },
  { codigo: "E03.9", descripcion: "Hipotiroidismo, no especificado" },
  { codigo: "E05.9", descripcion: "Tirotoxicosis, no especificada" },
  { codigo: "E66.9", descripcion: "Obesidad, no especificada" },
  { codigo: "E83.5", descripcion: "Trastornos del metabolismo del calcio" },

  // Musculoesquelético
  { codigo: "M54.5", descripcion: "Lumbalgia (dolor en la región lumbar baja)" },
  { codigo: "M54.2", descripcion: "Cervicalgia (dolor cervical)" },
  { codigo: "M54.4", descripcion: "Lumbago con ciática" },
  { codigo: "M79.3", descripcion: "Paniculitis" },
  { codigo: "M06.9", descripcion: "Artritis reumatoide, no especificada" },
  { codigo: "M15.9", descripcion: "Poliartritis, no especificada" },
  { codigo: "M17.1", descripcion: "Gonartrosis primaria unilateral" },
  { codigo: "M10.9", descripcion: "Gota, no especificada" },
  { codigo: "M75.1", descripcion: "Síndrome del manguito rotatorio" },
  { codigo: "M77.1", descripcion: "Epicondilitis lateral (codo de tenista)" },

  // Neurológico
  { codigo: "G43.9", descripcion: "Migraña, no especificada" },
  { codigo: "G44.2", descripcion: "Cefalea por tensión" },
  { codigo: "G47.0", descripcion: "Insomnio" },
  { codigo: "G47.3", descripcion: "Apnea del sueño" },
  { codigo: "G81.9", descripcion: "Hemiplejía, no especificada" },

  // Mental / Conductual
  { codigo: "F32.9", descripcion: "Episodio depresivo, no especificado" },
  { codigo: "F41.1", descripcion: "Trastorno de ansiedad generalizada" },
  { codigo: "F41.9", descripcion: "Trastorno de ansiedad, no especificado" },
  { codigo: "F33.9", descripcion: "Trastorno depresivo recurrente, no especificado" },
  { codigo: "F43.1", descripcion: "Trastorno de estrés postraumático" },

  // Urológico / Renal
  { codigo: "N39.0", descripcion: "Infección de vías urinarias, sitio no especificado" },
  { codigo: "N20.0", descripcion: "Cálculo renal" },
  { codigo: "N18.9", descripcion: "Enfermedad renal crónica, no especificada" },
  { codigo: "N40", descripcion: "Hiperplasia de la próstata" },

  // Ginecológico / Obstétrico
  { codigo: "N92.1", descripcion: "Menstruación excesiva e irregular" },
  { codigo: "N83.2", descripcion: "Quiste ovárico, no especificado" },
  { codigo: "N76.0", descripcion: "Vaginitis aguda" },
  { codigo: "O26.9", descripcion: "Afección relacionada con el embarazo, no especificada" },

  // Dermatológico
  { codigo: "L50.9", descripcion: "Urticaria, no especificada" },
  { codigo: "L20.9", descripcion: "Dermatitis atópica, no especificada" },
  { codigo: "L30.9", descripcion: "Dermatitis, no especificada" },
  { codigo: "B35.1", descripcion: "Tiña del pie (pie de atleta)" },
  { codigo: "L03.9", descripcion: "Celulitis, no especificada" },

  // Infeccioso general
  { codigo: "B34.9", descripcion: "Infección viral, sin otra especificación" },
  { codigo: "A41.9", descripcion: "Septicemia, no especificada" },
  { codigo: "B01.9", descripcion: "Varicela sin complicaciones" },
  { codigo: "B02.9", descripcion: "Herpes zóster sin complicaciones" },

  // Oftalmológico
  { codigo: "H10.9", descripcion: "Conjuntivitis, no especificada" },
  { codigo: "H52.4", descripcion: "Presbicia" },
  { codigo: "H40.9", descripcion: "Glaucoma, no especificado" },

  // General / Síntomas sin diagnóstico definitivo
  { codigo: "R05", descripcion: "Tos" },
  { codigo: "R50.9", descripcion: "Fiebre, no especificada" },
  { codigo: "R51", descripcion: "Cefalea" },
  { codigo: "R07.9", descripcion: "Dolor en el pecho, no especificado" },
  { codigo: "R10.4", descripcion: "Otros dolores abdominales y los no especificados" },
  { codigo: "R55", descripcion: "Síncope y colapso" },
  { codigo: "Z00.0", descripcion: "Examen médico general" },
  { codigo: "Z00.1", descripcion: "Examen de rutina de salud del niño" },
  { codigo: "Z30.0", descripcion: "Asesoramiento general sobre anticoncepción" },
]

export function buscarCIE10(query: string): CodigoCIE10[] {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return CIE10.filter(
    (c) =>
      c.descripcion.toLowerCase().includes(q) ||
      c.codigo.toLowerCase().includes(q)
  ).slice(0, 8)
}
