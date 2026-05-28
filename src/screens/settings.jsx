/* eslint-disable */
// AgendaMed — Configuración

const SETTINGS_SECS = [
  { id: "consultorio", label: "Consultorio", icon: Icons.Building },
  { id: "horarios",    label: "Horarios", icon: Icons.Clock },
  { id: "servicios",   label: "Servicios", icon: Icons.Pill },
  { id: "mensajes",    label: "Mensajes & recordatorios", icon: Icons.WhatsApp },
  { id: "zoom",        label: "Integración Zoom", icon: Icons.Video },
  { id: "exportar",    label: "Exportar datos", icon: Icons.Download },
  { id: "legal",       label: "Documentos legales", icon: Icons.FileText },
];

function SettingsScreen({ nav }) {
  const [sec, setSec] = useState("consultorio");
  const toast = useToast();

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Cuenta</span>
          <h1 className="page__title">Configuración</h1>
          <p className="page__sub">Gestiona tu consultorio, horarios, servicios y plantillas.</p>
        </div>
      </header>

      <div className="set-shell">
        <aside className="set-nav">
          {SETTINGS_SECS.map(s => {
            const I = s.icon;
            return (
              <button key={s.id} className={`set-nav__item ${sec === s.id ? "is-active" : ""}`} onClick={() => setSec(s.id)}>
                <I size={16}/>
                <span>{s.label}</span>
              </button>
            );
          })}
          <hr className="hr"/>
          <button className="set-nav__item" onClick={() => nav("planes")}><Icons.CreditCard size={16}/><span>Plan y suscripción</span></button>
          <button className="set-nav__item set-nav__item--danger"><Icons.LogOut size={16}/><span>Cerrar sesión</span></button>
        </aside>

        <div className="stack">
          {sec === "consultorio" && (
            <>
              <Card>
                <CardHead title="Información del consultorio" subtitle="Aparece en recetas, recordatorios y la página pública."/>
                <div className="grid-2 set-form">
                  <Field label="Nombre del consultorio" required><Input defaultValue={AGENDA_DATA.CLINIC.nombre}/></Field>
                  <Field label="Nombre del médico responsable" required><Input defaultValue={AGENDA_DATA.CLINIC.medico}/></Field>
                  <Field label="Especialidad"><Input defaultValue={AGENDA_DATA.CLINIC.especialidad}/></Field>
                  <Field label="Cédula profesional"><Input defaultValue={AGENDA_DATA.CLINIC.cedula} suffix={<Badge tone="warning" size="sm">Pendiente de activación</Badge>}/></Field>
                  <Field label="Teléfono"><Input defaultValue={AGENDA_DATA.CLINIC.telefono} icon={Icons.Phone}/></Field>
                  <Field label="Email del consultorio"><Input defaultValue={AGENDA_DATA.CLINIC.email} icon={Icons.Mail}/></Field>
                  <Field label="Dirección" className="set-form__full"><Input defaultValue={AGENDA_DATA.CLINIC.direccion}/></Field>
                  <Field label="Ciudad / estado"><Input defaultValue={AGENDA_DATA.CLINIC.ciudad}/></Field>
                  <Field label="Código postal"><Input defaultValue="44160"/></Field>
                </div>
              </Card>

              <Card>
                <CardHead title="Logo y membrete"/>
                <div className="logo-uploader">
                  <div className="logo-uploader__preview">
                    <div className="logo-uploader__logo">GL</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>Logo del consultorio</div>
                    <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>PNG o SVG · mín 200×200px · fondo transparente recomendado</div>
                    <div className="row" style={{ marginTop: 12 }}>
                      <Button size="sm" variant="secondary" icon={Icons.Upload}>Subir nuevo</Button>
                      <Button size="sm" variant="ghost">Eliminar</Button>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="row split" style={{ marginTop: 4 }}>
                <span className="muted" style={{fontSize: 13}}>Cambios guardados hace 14 min</span>
                <div className="row-tight">
                  <Button variant="ghost">Descartar</Button>
                  <Button onClick={() => toast({ tone: "success", title: "Cambios guardados" })}>Guardar cambios</Button>
                </div>
              </div>
            </>
          )}

          {sec === "horarios" && (
            <Card>
              <CardHead title="Horarios de atención" subtitle="Define cuándo aceptas citas. Aplica a la página pública."/>
              <ul className="hours">
                {[
                  ["Lunes", "08:00 — 14:00", "15:00 — 19:00", true],
                  ["Martes", "08:00 — 14:00", "15:00 — 19:00", true],
                  ["Miércoles", "08:00 — 14:00", "15:00 — 19:00", true],
                  ["Jueves", "08:00 — 14:00", "15:00 — 19:00", true],
                  ["Viernes", "08:00 — 14:00", "—", true],
                  ["Sábado", "09:00 — 13:00", "—", true],
                  ["Domingo", "Cerrado", "—", false],
                ].map(([d, t1, t2, on], i) => (
                  <li key={i} className={`hours__row ${!on ? "is-off" : ""}`}>
                    <span className="hours__day">{d}</span>
                    <span className="hours__slot mono">{t1}</span>
                    <span className="hours__slot mono">{t2}</span>
                    <Toggle checked={on} onChange={() => {}}/>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {sec === "servicios" && (
            <Card>
              <CardHead title="Servicios y duraciones" actions={<Button size="sm" icon={Icons.Plus}>Nuevo servicio</Button>}/>
              <ul className="svc-list">
                {AGENDA_DATA.SERVICES.map(s => (
                  <li key={s.id} className="svc-list__row">
                    <span className="svc-list__name">{s.nombre}</span>
                    <span className="svc-list__dur">{s.duracion} min</span>
                    <span className="svc-list__price mono">{fmtMxn(s.precio)}</span>
                    <Toggle checked={true} onChange={() => {}}/>
                    <button className="iconbtn"><Icons.Pencil size={14}/></button>
                    <button className="iconbtn"><Icons.Trash size={14}/></button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {sec === "mensajes" && (
            <>
              <Card>
                <CardHead title="Recordatorios automáticos" subtitle="WhatsApp y/o email — ajusta tiempos y plantillas."/>
                <ul className="msg-list">
                  <li className="msg-row">
                    <div>
                      <div style={{fontWeight: 500}}>Recordatorio 24h antes</div>
                      <div className="muted" style={{fontSize: 12.5}}>WhatsApp · plantilla "rec_24h_es"</div>
                    </div>
                    <Toggle checked={true} onChange={() => {}}/>
                  </li>
                  <li className="msg-row">
                    <div>
                      <div style={{fontWeight: 500}}>Recordatorio 2h antes</div>
                      <div className="muted" style={{fontSize: 12.5}}>WhatsApp · permite cancelar</div>
                    </div>
                    <Toggle checked={true} onChange={() => {}}/>
                  </li>
                  <li className="msg-row">
                    <div>
                      <div style={{fontWeight: 500}}>Felicitación de cumpleaños</div>
                      <div className="muted" style={{fontSize: 12.5}}>Enviar el día — 9:00 hrs</div>
                    </div>
                    <Toggle checked={true} onChange={() => {}}/>
                  </li>
                  <li className="msg-row">
                    <div>
                      <div style={{fontWeight: 500}}>Encuesta post-consulta</div>
                      <div className="muted" style={{fontSize: 12.5}}>Email · 1 hora después</div>
                    </div>
                    <Toggle checked={false} onChange={() => {}}/>
                  </li>
                </ul>
              </Card>
              <Card>
                <CardHead title="Ventana de cancelación"/>
                <Field label="Tiempo mínimo antes de la cita para cancelar" hint="Pasado este plazo, el paciente deberá llamar al consultorio.">
                  <Select>
                    <option>3 horas</option>
                    <option>6 horas</option>
                    <option>12 horas</option>
                    <option>24 horas</option>
                  </Select>
                </Field>
              </Card>
            </>
          )}

          {sec === "zoom" && (
            <Card>
              <CardHead title="Integración con Zoom" subtitle="Genera links automáticos para tus teleconsultas."/>
              <div className="zoom-status">
                <div className="zoom-status__icon"><Icons.Video size={20}/></div>
                <div className="zoom-status__info">
                  <div style={{fontWeight: 500}}>Conectado · cuenta roberto@garcialopez.mx</div>
                  <div className="muted" style={{fontSize: 12.5}}>Última sincronización hace 4 min · 12 reuniones creadas este mes</div>
                </div>
                <Badge tone="success" icon={Icons.Check}>Activo</Badge>
              </div>
              <div className="row" style={{marginTop: 16}}>
                <Button variant="secondary" icon={Icons.Refresh}>Re-sincronizar</Button>
                <Button variant="ghost" icon={Icons.LogOut}>Desconectar</Button>
              </div>
            </Card>
          )}

          {sec === "exportar" && (
            <Card>
              <CardHead title="Exportar datos" subtitle="Descarga toda tu información en formato CSV o JSON."/>
              <div className="grid-2 set-form">
                <Field label="¿Qué exportar?"><Select><option>Todo (pacientes, citas, recetas)</option><option>Solo pacientes</option><option>Solo citas</option><option>Solo recetas</option></Select></Field>
                <Field label="Formato"><Select><option>CSV (.zip)</option><option>JSON</option></Select></Field>
              </div>
              <div className="row" style={{marginTop: 16}}>
                <Button icon={Icons.Download}>Generar exportación</Button>
                <span className="muted" style={{fontSize: 12}}>Recibirás un correo cuando esté listo (~5 min)</span>
              </div>
            </Card>
          )}

          {sec === "legal" && (
            <Card>
              <CardHead title="Documentos legales" subtitle="Personaliza los textos que firman tus pacientes."/>
              <ul className="legal-list">
                <li className="legal-row"><Icons.FileText size={16} className="legal-row__icon"/><div className="legal-row__info"><div style={{fontWeight: 500}}>Aviso de privacidad</div><div className="muted" style={{fontSize: 12.5}}>Actualizado 12 ene 2024</div></div><Button size="sm" variant="ghost">Editar</Button></li>
                <li className="legal-row"><Icons.FileText size={16} className="legal-row__icon"/><div className="legal-row__info"><div style={{fontWeight: 500}}>Consentimiento informado</div><div className="muted" style={{fontSize: 12.5}}>Plantilla estándar</div></div><Button size="sm" variant="ghost">Editar</Button></li>
                <li className="legal-row"><Icons.FileText size={16} className="legal-row__icon"/><div className="legal-row__info"><div style={{fontWeight: 500}}>Términos y condiciones</div><div className="muted" style={{fontSize: 12.5}}>Provisto por AgendaMed</div></div><Button size="sm" variant="ghost">Ver</Button></li>
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsScreen });
