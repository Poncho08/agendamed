export function crearLinkWhatsApp(telefono: string, mensaje: string): string {
  const limpio = telefono.replace(/[\s\-()+]/g, "")
  const completo = limpio.startsWith("52") ? limpio : `52${limpio}`
  return `https://wa.me/${completo}?text=${encodeURIComponent(mensaje)}`
}

export const plantillas = {
  recordatorio: (p: { paciente: string; doctor: string; fecha: string; hora: string }) =>
    `Hola ${p.paciente} 👋, te recordamos tu cita con ${p.doctor} el ${p.fecha} a las ${p.hora}. ¡Te esperamos! 🗓️`,

  confirmacion: (p: { paciente: string; doctor: string; fecha: string; hora: string }) =>
    `Hola ${p.paciente}, ¿confirmas tu cita del ${p.fecha} a las ${p.hora} con ${p.doctor}? Responde SÍ o NO 🙏`,

  cancelacion: (p: { paciente: string; fecha: string; hora: string }) =>
    `Hola ${p.paciente}, lamentamos cancelar tu cita del ${p.fecha} a las ${p.hora}. Escríbenos para reagendar 🙏`,

  cumpleanos: (p: { paciente: string; consultorio: string }) =>
    `Hola ${p.paciente} 🎂🎉 El equipo de ${p.consultorio} te desea un feliz cumpleaños. ¡Que tengas un excelente día! 💙`,

  invitarAgendar: (p: { paciente: string; urlPublica: string }) =>
    `Hola ${p.paciente} 👋, ha pasado tiempo desde tu última visita. Agenda tu cita aquí: ${p.urlPublica} 😊`,

  receta: (p: { paciente: string; doctor: string; linkPdf: string; folio: string }) =>
    `Hola ${p.paciente} 💊, el Dr. ${p.doctor} te envió tu receta digital. Descárgala aquí: ${p.linkPdf} (Folio: ${p.folio})`,

  libre: (p: { paciente: string }) =>
    `Hola ${p.paciente} 👋`,
}
