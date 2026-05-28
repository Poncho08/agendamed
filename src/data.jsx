/* eslint-disable */
// Mock data for AgendaMed — Spanish MX

const CLINIC = {
  nombre: "Consultorio Dr. García López",
  medico: "Dr. Roberto García López",
  especialidad: "Medicina General",
  cedula: "12345678",
  direccion: "Av. Chapultepec 234, Col. Americana",
  ciudad: "Guadalajara, Jalisco",
  telefono: "33 3825 7100",
  email: "consultorio@garcialopez.mx",
  logo: "GL",
};

const SERVICES = [
  { id: "s1", nombre: "Consulta general", duracion: 30, precio: 500, color: "brand" },
  { id: "s2", nombre: "Primera vez",      duracion: 60, precio: 800, color: "success" },
  { id: "s3", nombre: "Seguimiento",      duracion: 20, precio: 350, color: "info" },
  { id: "s4", nombre: "Teleconsulta",     duracion: 30, precio: 450, color: "warning" },
];

const PATIENTS = [
  { id: "p1",  nombre: "María González Ruiz",      edad: 38, nacimiento: "1987-05-26", tel: "33 1234 5678", email: "maria.gonzalez@gmail.com", ultimaCita: "2026-05-12", proximaCita: "2026-05-26", totalCitas: 14, noShows: 0, alergias: "Penicilina", grupoSanguineo: "O+" },
  { id: "p2",  nombre: "Carlos Mendoza Herrera",   edad: 52, nacimiento: "1973-11-03", tel: "33 2245 6612", email: "c.mendoza@outlook.com",     ultimaCita: "2026-05-18", proximaCita: "2026-05-26", totalCitas: 9,  noShows: 0, alergias: "Ninguna",     grupoSanguineo: "A+" },
  { id: "p3",  nombre: "Ana Patricia Soto Vega",   edad: 29, nacimiento: "1996-09-14", tel: "33 9988 4422", email: "anasoto@gmail.com",         ultimaCita: "2026-04-30", proximaCita: "2026-05-26", totalCitas: 4,  noShows: 0, alergias: "Aspirina",    grupoSanguineo: "B+" },
  { id: "p4",  nombre: "Roberto Jiménez Cruz",     edad: 45, nacimiento: "1980-02-22", tel: "33 5523 8801", email: "r.jimenez@hotmail.com",     ultimaCita: "2026-05-20", proximaCita: "2026-05-26", totalCitas: 22, noShows: 2, alergias: "Sulfas",      grupoSanguineo: "AB+" },
  { id: "p5",  nombre: "Laura Beatriz Torres",     edad: 34, nacimiento: "1991-08-09", tel: "33 7745 1190", email: "laura.torres@gmail.com",    ultimaCita: "2026-05-22", proximaCita: "2026-05-27", totalCitas: 7,  noShows: 0, alergias: "Ninguna",     grupoSanguineo: "O-" },
  { id: "p6",  nombre: "José Antonio Ramírez",     edad: 61, nacimiento: "1964-03-30", tel: "33 8812 4477", email: "jose.ramirez@gmail.com",    ultimaCita: "2026-05-10", proximaCita: "2026-05-26", totalCitas: 31, noShows: 0, alergias: "Mariscos",    grupoSanguineo: "A-" },
  { id: "p7",  nombre: "Fernanda Castillo Núñez",  edad: 26, nacimiento: "1999-06-18", tel: "33 6634 9920", email: "fer.castillo@gmail.com",    ultimaCita: "2026-05-15", proximaCita: null,        totalCitas: 3,  noShows: 1, alergias: "Ninguna",     grupoSanguineo: "B-" },
  { id: "p8",  nombre: "Miguel Ángel Pérez",       edad: 48, nacimiento: "1977-12-05", tel: "33 2298 7733", email: "miguel.perez@gmail.com",    ultimaCita: "2026-05-19", proximaCita: "2026-05-27", totalCitas: 11, noShows: 0, alergias: "Látex",       grupoSanguineo: "O+" },
  { id: "p9",  nombre: "Sofía Elena Vargas",       edad: 31, nacimiento: "1994-05-26", tel: "33 4471 2266", email: "sofia.vargas@gmail.com",    ultimaCita: "2026-04-28", proximaCita: "2026-05-29", totalCitas: 5,  noShows: 0, alergias: "Ninguna",     grupoSanguineo: "A+" },
  { id: "p10", nombre: "Diego Alejandro Ortiz",    edad: 39, nacimiento: "1986-10-12", tel: "33 1180 3399", email: "diego.ortiz@gmail.com",     ultimaCita: "2026-05-21", proximaCita: "2026-05-26", totalCitas: 18, noShows: 0, alergias: "Penicilina",  grupoSanguineo: "B+" },
  { id: "p11", nombre: "Valeria Hernández López",  edad: 42, nacimiento: "1983-04-07", tel: "33 5564 8821", email: "v.hernandez@gmail.com",     ultimaCita: "2026-05-08", proximaCita: null,        totalCitas: 13, noShows: 0, alergias: "AINEs",       grupoSanguineo: "AB-" },
  { id: "p12", nombre: "Andrés Felipe Morales",    edad: 55, nacimiento: "1970-01-19", tel: "33 7723 4477", email: "andres.morales@gmail.com",  ultimaCita: "2026-05-17", proximaCita: "2026-05-26", totalCitas: 26, noShows: 0, alergias: "Ninguna",     grupoSanguineo: "O+" },
];

// Hoy "ficticio" del prototipo: martes 26 de mayo de 2026
const TODAY = "2026-05-26";
const TODAY_LABEL = "Martes 26 de mayo, 2026";

// Citas del día (martes)
const APPTS_TODAY = [
  { id: "a1",  hora: "08:30", fin: "09:00", duracion: 30, pacienteId: "p1",  servicioId: "s1", tipo: "presencial",   estado: "confirmada", motivo: "Control de presión arterial" },
  { id: "a2",  hora: "09:00", fin: "10:00", duracion: 60, pacienteId: "p3",  servicioId: "s2", tipo: "presencial",   estado: "confirmada", motivo: "Primera consulta — dolor lumbar" },
  { id: "a3",  hora: "10:00", fin: "10:30", duracion: 30, pacienteId: "p10", servicioId: "s1", tipo: "presencial",   estado: "completada", motivo: "Revisión post-cirugía" },
  { id: "a4",  hora: "10:30", fin: "11:00", duracion: 30, pacienteId: "p4",  servicioId: "s4", tipo: "teleconsulta", estado: "confirmada", motivo: "Seguimiento — diabetes" },
  { id: "a5",  hora: "11:00", fin: "11:20", duracion: 20, pacienteId: "p6",  servicioId: "s3", tipo: "presencial",   estado: "pendiente",  motivo: "Resultados de laboratorio" },
  { id: "bk1", hora: "14:00", fin: "15:00", duracion: 60, bloqueo: true, motivo: "Comida" },
  { id: "a6",  hora: "15:00", fin: "15:30", duracion: 30, pacienteId: "p12", servicioId: "s1", tipo: "presencial",   estado: "confirmada", motivo: "Chequeo anual" },
  { id: "a7",  hora: "16:00", fin: "17:00", duracion: 60, pacienteId: "p2",  servicioId: "s2", tipo: "presencial",   estado: "confirmada", motivo: "Evaluación de cefalea" },
  { id: "a8",  hora: "17:30", fin: "18:00", duracion: 30, pacienteId: "p5",  servicioId: "s4", tipo: "teleconsulta", estado: "pendiente",  motivo: "Receta de control" },
];

// Citas de la semana (lun-vie), para vista semanal
const WEEK = [
  { dia: 0, label: "Lun 25", fecha: "2026-05-25", citas: [
    { hora: "09:00", fin: "09:30", pacienteId: "p2", servicioId: "s1", estado: "completada", tipo: "presencial" },
    { hora: "10:00", fin: "11:00", pacienteId: "p7", servicioId: "s2", estado: "completada", tipo: "presencial" },
    { hora: "12:00", fin: "12:30", pacienteId: "p11", servicioId: "s1", estado: "completada", tipo: "presencial" },
    { hora: "14:00", fin: "15:00", bloqueo: true, motivo: "Comida" },
    { hora: "16:00", fin: "16:30", pacienteId: "p8", servicioId: "s4", estado: "completada", tipo: "teleconsulta" },
  ]},
  { dia: 1, label: "Mar 26", fecha: "2026-05-26", citas: APPTS_TODAY, hoy: true },
  { dia: 2, label: "Mié 27", fecha: "2026-05-27", citas: [
    { hora: "08:30", fin: "09:00", pacienteId: "p5", servicioId: "s1", estado: "confirmada", tipo: "presencial" },
    { hora: "09:30", fin: "10:30", pacienteId: "p9", servicioId: "s2", estado: "confirmada", tipo: "presencial" },
    { hora: "11:00", fin: "11:20", pacienteId: "p8", servicioId: "s3", estado: "confirmada", tipo: "presencial" },
    { hora: "14:00", fin: "15:00", bloqueo: true, motivo: "Comida" },
    { hora: "15:30", fin: "16:00", pacienteId: "p1", servicioId: "s4", estado: "confirmada", tipo: "teleconsulta" },
    { hora: "16:30", fin: "17:00", pacienteId: "p10", servicioId: "s1", estado: "pendiente", tipo: "presencial" },
  ]},
  { dia: 3, label: "Jue 28", fecha: "2026-05-28", citas: [
    { hora: "09:00", fin: "09:30", pacienteId: "p6", servicioId: "s1", estado: "confirmada", tipo: "presencial" },
    { hora: "10:00", fin: "10:20", pacienteId: "p3", servicioId: "s3", estado: "confirmada", tipo: "presencial" },
    { hora: "11:00", fin: "12:00", pacienteId: "p12", servicioId: "s2", estado: "confirmada", tipo: "presencial" },
    { hora: "14:00", fin: "15:00", bloqueo: true, motivo: "Comida" },
    { hora: "15:00", fin: "15:30", pacienteId: "p4", servicioId: "s4", estado: "confirmada", tipo: "teleconsulta" },
  ]},
  { dia: 4, label: "Vie 29", fecha: "2026-05-29", citas: [
    { hora: "08:30", fin: "09:30", pacienteId: "p9", servicioId: "s2", estado: "confirmada", tipo: "presencial" },
    { hora: "10:00", fin: "10:30", pacienteId: "p2", servicioId: "s1", estado: "confirmada", tipo: "presencial" },
    { hora: "11:00", fin: "11:30", pacienteId: "p1", servicioId: "s1", estado: "confirmada", tipo: "presencial" },
    { hora: "12:00", fin: "12:30", pacienteId: "p10", servicioId: "s4", estado: "confirmada", tipo: "teleconsulta" },
    { hora: "14:00", fin: "15:00", bloqueo: true, motivo: "Comida" },
  ]},
];

// Datos mensuales — May 2026. Mes empieza vie 1.
const MONTH_DAYS = (() => {
  // Build May 2026: 31 days, first day Friday (5). Sunday=0.
  const days = [];
  for (let d = 1; d <= 31; d++) {
    const dow = (d + 4) % 7; // May 1 2026 = Friday (5). (1+4)%7=5 ✓
    let count = 0; let hasTele = false; let estados = [];
    // Seed pseudo-random based on d
    if (dow !== 0 && dow !== 6) {
      count = 4 + ((d * 7) % 6);
      hasTele = d % 3 === 0;
      const palette = ["confirmada","confirmada","completada","pendiente","completada","confirmada"];
      estados = Array.from({length: Math.min(count, 3)}, (_, i) => palette[(d + i) % palette.length]);
    }
    days.push({ d, dow, count, hasTele, estados, cumple: [9, 26, 14].includes(d) });
  }
  return days;
})();

// Cumpleaños
const BIRTHDAYS_TODAY = [{ pacienteId: "p1", edad: 38 }, { pacienteId: "p9", edad: 31 }];
const BIRTHDAYS_WEEK  = [{ pacienteId: "p7", dia: "Jue 28", edad: 27 }, { pacienteId: "p11", dia: "Sáb 30", edad: 43 }];

// Recetas
const PRESCRIPTIONS = [
  { folio: "RX-2026-0142", fecha: "2026-05-25", pacienteId: "p2",  diagnostico: "Hipertensión arterial controlada", medicamentos: 3 },
  { folio: "RX-2026-0141", fecha: "2026-05-22", pacienteId: "p10", diagnostico: "Faringitis aguda",                  medicamentos: 2 },
  { folio: "RX-2026-0140", fecha: "2026-05-20", pacienteId: "p4",  diagnostico: "Diabetes tipo 2 — ajuste de dosis", medicamentos: 4 },
  { folio: "RX-2026-0139", fecha: "2026-05-18", pacienteId: "p6",  diagnostico: "Gastritis crónica",                 medicamentos: 3 },
  { folio: "RX-2026-0138", fecha: "2026-05-15", pacienteId: "p1",  diagnostico: "Migraña recurrente",                medicamentos: 2 },
  { folio: "RX-2026-0137", fecha: "2026-05-12", pacienteId: "p8",  diagnostico: "Lumbalgia mecánica",                medicamentos: 3 },
  { folio: "RX-2026-0136", fecha: "2026-05-10", pacienteId: "p12", diagnostico: "Bronquitis aguda",                  medicamentos: 4 },
  { folio: "RX-2026-0135", fecha: "2026-05-07", pacienteId: "p3",  diagnostico: "Síndrome ansioso leve",             medicamentos: 2 },
];

// Plantillas de receta
const RX_TEMPLATES = [
  { id: "t1", nombre: "Hipertensión arterial" },
  { id: "t2", nombre: "Faringitis aguda" },
  { id: "t3", nombre: "Gastritis" },
  { id: "t4", nombre: "Diabetes tipo 2" },
  { id: "t5", nombre: "Migraña" },
];

// Admin: lista de consultorios
const ADMIN_CLINICS = [
  { id: "c1", nombre: "Consultorio Dr. García López",     medico: "Dr. Roberto García López",   plan: "pro",  estado: "activo",     vencimiento: "2026-07-15", ciudad: "Guadalajara, Jal." },
  { id: "c2", nombre: "Clínica Dental Sonrisa",          medico: "Dra. Patricia Hernández",     plan: "base", estado: "activo",     vencimiento: "2026-06-20", ciudad: "CDMX" },
  { id: "c3", nombre: "Pediatría Dr. Salgado",            medico: "Dr. Manuel Salgado",          plan: "pro",  estado: "prueba",     vencimiento: "2026-06-04", ciudad: "Monterrey, NL" },
  { id: "c4", nombre: "Consultorio Dra. Mendoza",         medico: "Dra. Lucía Mendoza",          plan: "base", estado: "activo",     vencimiento: "2026-09-12", ciudad: "Puebla, Pue." },
  { id: "c5", nombre: "Dermatología Moderna",            medico: "Dr. Andrés Beltrán",          plan: "pro",  estado: "suspendido", vencimiento: "2026-05-18", ciudad: "Querétaro, Qro." },
  { id: "c6", nombre: "Consultorio Nutricional Reyes",   medico: "L.N. Carmen Reyes",           plan: "base", estado: "prueba",     vencimiento: "2026-06-08", ciudad: "León, Gto." },
  { id: "c7", nombre: "Cardiología Integral",            medico: "Dr. Tomás Esquivel",          plan: "pro",  estado: "activo",     vencimiento: "2026-08-30", ciudad: "Mérida, Yuc." },
  { id: "c8", nombre: "Consultorio Dr. Vázquez",         medico: "Dr. Sergio Vázquez",          plan: "base", estado: "suspendido", vencimiento: "2026-05-21", ciudad: "Tijuana, BC" },
  { id: "c9", nombre: "Ginecología Dra. Ramos",          medico: "Dra. Isabela Ramos",          plan: "pro",  estado: "activo",     vencimiento: "2026-10-04", ciudad: "Toluca, Edo. Méx." },
];

// Helpers
function getPatient(id) { return PATIENTS.find(p => p.id === id); }
function getService(id) { return SERVICES.find(s => s.id === id); }
function initials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}
function fmtMxn(n) { return "$" + n.toLocaleString("es-MX") + " MXN"; }

// Expose
Object.assign(window, {
  AGENDA_DATA: { CLINIC, SERVICES, PATIENTS, APPTS_TODAY, WEEK, MONTH_DAYS, BIRTHDAYS_TODAY, BIRTHDAYS_WEEK, PRESCRIPTIONS, RX_TEMPLATES, ADMIN_CLINICS, TODAY, TODAY_LABEL },
  getPatient, getService, initials, fmtMxn,
});
