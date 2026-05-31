const ts = Date.now()

export const TEST_DOCTOR = {
  nombre: "Dr. Alfonso Prueba",
  email: `test.doctor.${ts}@agendamed.dev`,
  password: "TestAgenda2025!",
  especialidad: "Medicina General",
  consultorio: `Consultorio Test ${ts}`,
}

export const TEST_PACIENTE = {
  nombre: "Paciente de Prueba E2E",
  telefono: `331000${String(ts).slice(-4)}`,
  email: "paciente.prueba.e2e@agendamed.dev",
}
