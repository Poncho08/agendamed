# AgendaMed — Checklist de Pruebas Manuales

**Versión:** 1.3.0  
**Entorno:** `https://agendamed.inovit.mx`  
**Convención:** `[x]` pasa · `[!]` falla (anotar bug) · `[-]` no aplica

> La mayoría de estos flujos están cubiertos por los tests E2E en `e2e/`.
> Este checklist es para verificar lo que Playwright no puede: entrega de mensajes reales, calidad visual del PDF, y UX subjetiva.

---

## 1. Registro y Autenticación

### Registro de médico
- [ ] Registro con todos los datos válidos → redirige a `/onboarding`
- [ ] Registro con email ya existente → mensaje de error claro
- [ ] Registro sin aceptar Términos → botón deshabilitado
- [ ] Registro sin aceptar Aviso de Privacidad → botón deshabilitado
- [ ] Registro con contraseñas que no coinciden → toast de error
- [ ] Registro con contraseña < 8 caracteres → toast de error
- [ ] Registro con email inválido → toast de error
- [ ] Dos consultorios con el mismo nombre → slug único generado automáticamente (ej: `mi-consultorio-1`)
- [ ] Si falla la creación del consultorio → usuario de Auth eliminado (no queda huérfano)

### Login
- [ ] Login con credenciales correctas → redirige a `/panel`
- [ ] Login con contraseña incorrecta → toast "Credenciales incorrectas"
- [ ] Login con email no registrado → toast de error
- [ ] Usuario logueado que va a `/login` → redirige a `/panel`

### Recuperación de contraseña
- [ ] Clic en "¿Olvidaste tu contraseña?" sin email → toast "Ingresa tu email primero"
- [ ] Clic con email válido → toast de éxito + email recibido
- [ ] Enlace del email de recuperación → abre `/auth/reset-password` con formulario funcional
- [ ] Nueva contraseña guardada → puede iniciar sesión con ella

### Logout
- [ ] Clic en logout → sesión cerrada, redirige a `/login` o `/planes`
- [ ] Tras logout, ir a `/panel` → redirige a `/login`

---

## 2. Onboarding

- [ ] Paso 1 — Teléfono, ciudad, dirección y CP se guardan al finalizar
- [ ] Paso 2 — Los toggles de días funcionan; los inputs de hora son editables
- [ ] Paso 3 — Agregar y eliminar servicios funciona
- [ ] "Saltar este paso" funciona en todos los pasos
- [ ] "Continuar después" redirige a `/panel`
- [ ] Al finalizar → servicios y horarios guardados en Supabase

---

## 3. Panel — Dashboard

- [ ] Carga con nombre del médico en el saludo
- [ ] Las 4 métricas (citas hoy, pacientes, recetas, próximas) muestran valores correctos
- [ ] "Agenda de hoy" en orden cronológico con badges de estado correctos
- [ ] Widget de cumpleaños aparece si hay pacientes con cumpleaños hoy
- [ ] Sidebar muestra todos los módulos: Agenda, Pacientes, Recetas, **Portal de citas**, Configuración

---

## 4. Agenda de Citas

### Crear cita
- [ ] Formulario carga con lista de pacientes
- [ ] Búsqueda de paciente filtra correctamente
- [ ] Seleccionar servicio actualiza el resumen lateral
- [ ] Mini calendario navega entre meses
- [ ] Confirmar cita sin paciente → toast de error
- [ ] Cita creada → aparece en `/panel/citas` y en el dashboard

### Lista y detalle
- [ ] `/panel/citas` muestra todas las citas
- [ ] Detalle de cita muestra datos correctos
- [ ] Cambiar estado (pendiente → confirmada → completada) funciona
- [ ] Cita completada/cancelada no muestra botones de acción

### Calendario
- [ ] `/panel/agenda` carga la vista de calendario
- [ ] Navegar entre períodos funciona

---

## 5. Pacientes

- [ ] Crear paciente con nombre y teléfono → éxito
- [ ] Guardar sin nombre → error de validación
- [ ] Paciente creado aparece en la lista
- [ ] Búsqueda por nombre filtra en tiempo real
- [ ] Perfil del paciente muestra historial de citas y recetas
- [ ] Soft delete: paciente eliminado no aparece en la lista

---

## 6. Expediente Clínico y Recetas

### Crear receta
- [ ] **CIE-10 autocomplete**: escribir "diabetes" → aparecen sugerencias con código (ej: E11.9)
- [ ] Seleccionar sugerencia CIE-10 rellena el diagnóstico con código incluido
- [ ] **Plantilla HC Preliminar**: aparece primera en el selector, rellena campos estándar
- [ ] Agregar medicamento → aparece en la vista previa del PDF en tiempo real
- [ ] **Cédula profesional**: si está configurada, aparece en el PDF y la vista previa
- [ ] Guardar sin diagnóstico → error
- [ ] "Guardar receta" → redirige a `/panel/recetas` con folio asignado
- [ ] "Generar PDF" → PDF descargable con datos correctos (médico, paciente, diagnóstico, cédula)
- [ ] Indicaciones limitadas a 1500 caracteres (campo tiene `maxlength`)

### Plantillas
- [ ] "Guardar como plantilla" → aparece en selector la próxima vez
- [ ] Aplicar plantilla rellena diagnóstico y medicamentos

---

## 7. Configuración

- [ ] Sección "Consultorio" — **campo Cédula profesional** visible y guardable
- [ ] Editar nombre → "Guardar cambios" persiste; "Descartar" revierte
- [ ] Sección "Horarios" — toggles de días funcionan + inputs de hora editables + botón guardar
- [ ] Sección "Servicios" — toggle activo/inactivo funciona + "+ Nuevo servicio" abre form inline
- [ ] Sección "Mensajes" — ventana de cancelación guarda con su propio botón
- [ ] Sección "Zoom" — botón "Conectar con Zoom" inicia OAuth

---

## 8. Portal de Citas *(nuevo)*

- [ ] `/panel/portal` muestra la URL pública del consultorio (`/agendar/[slug]`)
- [ ] Botón "Copiar" copia la URL al portapapeles con toast de confirmación
- [ ] Botón "Compartir por WhatsApp" abre wa.me con mensaje prellenado
- [ ] Código QR se genera y es descargable
- [ ] "Ver página" abre la página pública en nueva pestaña

---

## 9. Página Pública de Autoagendado

### Flujo completo
- [ ] Carga sin login en `https://agendamed.inovit.mx/agendar/[slug]`
- [ ] Paso 1 — Servicios del consultorio listados correctamente
- [ ] Paso 2 — Calendario: solo días hábiles habilitados; días pasados deshabilitados
- [ ] Paso 3 — **Slots ocupados aparecen tachados/deshabilitados** (bug #11 corregido)
- [ ] Paso 4 — Confirmar sin nombre → error; sin privacidad → botón deshabilitado
- [ ] Cita creada aparece en el panel del médico con estado "pendiente"
- [ ] Si el paciente ya existe (mismo teléfono) → se reutiliza el expediente

### Notificaciones (requiere Twilio + Resend activos)
- [ ] Email de confirmación recibido con **hora correcta** (zona horaria México, no UTC)
- [ ] Email contiene link de cancelación funcional
- [ ] WhatsApp de confirmación recibido (si dio consentimiento)

### Móvil
- [ ] Carga correctamente en Chrome móvil
- [ ] Botones tienen tamaño suficiente para tocar (≥44px)
- [ ] Flujo completo funcional en pantalla pequeña

---

## 10. Cancelación de Cita

- [ ] `/cancelar/[token]` carga con datos de la cita
- [ ] Cancelar dentro del plazo → estado cambia a "cancelada" en el panel
- [ ] Token inválido → mensaje de error claro
- [ ] Cita ya cancelada → "Esta cita no puede ser cancelada"
- [ ] Menos de 3h de anticipación → mensaje de ventana expirada

---

## 11. Recordatorios Automáticos *(nuevo)*

- [ ] Cron `/api/cron/recordatorios` responde 200 con `{ ok: true }` (probar en producción con `CRON_SECRET`)
- [ ] Cron `/api/cron/cumpleanos` responde 200 con conteo correcto
- [ ] WhatsApp de recordatorio 24h llega el día anterior a la cita
- [ ] WhatsApp de cumpleaños llega el día del cumpleaños del paciente
- [ ] **Email de cumpleaños** también se envía (no solo WhatsApp)

---

## 12. Seguridad

- [ ] Todas las rutas `/panel/**` sin sesión → redirigen a `/login`
- [ ] `GET /api/pdf/receta/[id]` sin sesión → 401
- [ ] `POST /api/whatsapp/receta` sin sesión → 401
- [ ] Médico A no puede ver pacientes del Médico B (RLS en Supabase)
- [ ] UUID de otro médico en la URL → 404 o redirección (no datos ajenos)
- [ ] Admin route `/admin` solo accesible para emails en `ADMIN_EMAILS` (var de entorno)

---

## Bugs corregidos — ya no están pendientes

| # | Bug | Fix aplicado |
|---|-----|-------------|
| 1 | Race condition doble-booking | Constraint `UNIQUE (consultorio_id, inicio)` en DB |
| 2 | Registro: usuario Auth huérfano | `signOut()` si falla el INSERT de consultorio |
| 3 | Slug duplicado sin mensaje claro | Loop que genera slug único automáticamente |
| 4 | `/auth/reset-password` no existía | Página creada con validación y redirect |
| 5 | Zona horaria UTC en emails | `formatInTimeZone` con `America/Mexico_City` |
| 6 | Onboarding paso 1 no guardaba datos | Inputs controlados + UPDATE en `finalizarOnboarding` |
| 7 | Horarios onboarding solo lectura | Inputs `type="time"` editables por turno |
| 8 | Toggles horarios en Config sin handler | onClick funcional + botón guardar |
| 9 | Botón "+Nuevo servicio" sin acción | Form inline funcional |
| 10 | Ventana cancelación no persistía | `value`/`onChange` + botón guardar propio |
| 11 | Slots booking sin disponibilidad | Endpoint `/api/public/disponibilidad` + slots disabled |
| 12 | "Mantenerme conectado" sin efecto | Eliminado |
| 13 | `allowedOrigins` hardcodeado | Lee de `NEXT_PUBLIC_APP_URL` |
| 14 | Folio fallback inseguro | Incluye ID del consultorio |
| 15 | Admin emails hardcodeados | Movidos a variable de entorno `ADMIN_EMAILS` |

---

## Tests automatizados

Correr antes de cada deploy:

```bash
npm run e2e          # headless, reporte en playwright-report/
npm run e2e:headed   # visible, para debugging
npm run e2e:ui       # interfaz visual de Playwright
npm run e2e:report   # abrir último reporte HTML
npm run e2e:codegen  # grabar nuevos tests manualmente
```

Configurar credenciales en `.env.local`:
```
E2E_EMAIL=tu@email.com
E2E_PASSWORD=tu_password
E2E_SLUG=tu-consultorio-slug
```
