/* eslint-disable */
// AgendaMed — Citas screens (lista, detalle, nueva)

// ============================================================
// Lista de citas
// ============================================================
function ApptsListScreen({ nav }) {
  const [tab, setTab] = useState("todos");
  const [tipo, setTipo] = useState("todos");

  // Build grouped list
  const HOY = AGENDA_DATA.APPTS_TODAY.filter(a => !a.bloqueo);
  const MANANA = [
    { id: "m1", hora: "08:30", duracion: 30, pacienteId: "p5", servicioId: "s1", tipo: "presencial",   estado: "confirmada" },
    { id: "m2", hora: "09:30", duracion: 60, pacienteId: "p9", servicioId: "s2", tipo: "presencial",   estado: "confirmada" },
    { id: "m3", hora: "11:00", duracion: 20, pacienteId: "p8", servicioId: "s3", tipo: "presencial",   estado: "confirmada" },
    { id: "m4", hora: "15:30", duracion: 30, pacienteId: "p1", servicioId: "s4", tipo: "teleconsulta", estado: "confirmada" },
    { id: "m5", hora: "16:30", duracion: 30, pacienteId: "p10", servicioId: "s1", tipo: "presencial",  estado: "pendiente"  },
  ];
  const SEMANA = [
    { id: "j1", hora: "Jue 09:00", duracion: 30, pacienteId: "p6", servicioId: "s1", tipo: "presencial",   estado: "confirmada" },
    { id: "j2", hora: "Jue 11:00", duracion: 60, pacienteId: "p12", servicioId: "s2", tipo: "presencial",  estado: "confirmada" },
    { id: "v1", hora: "Vie 08:30", duracion: 60, pacienteId: "p9", servicioId: "s2", tipo: "presencial",   estado: "confirmada" },
    { id: "v2", hora: "Vie 12:00", duracion: 30, pacienteId: "p10", servicioId: "s4", tipo: "teleconsulta",estado: "pendiente"  },
    { id: "x1", hora: "Vie 14:30", duracion: 30, pacienteId: "p7", servicioId: "s1", tipo: "presencial",   estado: "cancelada"  },
  ];

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Gestión de citas</span>
          <h1 className="page__title">Citas</h1>
          <p className="page__sub">8 hoy · 5 mañana · 12 esta semana · 47 este mes</p>
        </div>
        <div className="page__actions">
          <Button variant="secondary" icon={Icons.Download}>Exportar</Button>
          <Button icon={Icons.Plus} onClick={() => nav("nueva-cita")}>Nueva cita</Button>
        </div>
      </header>

      <Card padding="sm">
        <div className="filters">
          <span className="input input--with-icon filters__search">
            <Icons.Search size={16} className="input__icon"/>
            <input placeholder="Buscar por paciente, motivo o folio…" />
          </span>
          <Select onChange={() => {}} value="">
            <option>Estado: todos</option>
            <option>Confirmadas</option>
            <option>Pendientes</option>
            <option>Completadas</option>
            <option>Canceladas</option>
            <option>No-shows</option>
          </Select>
          <Select>
            <option>Tipo: todos</option>
            <option>Presencial</option>
            <option>Teleconsulta</option>
          </Select>
          <Select>
            <option>Servicio: todos</option>
            <option>Consulta general</option>
            <option>Primera vez</option>
            <option>Seguimiento</option>
            <option>Teleconsulta</option>
          </Select>
          <button className="filters__clear">
            <Icons.X size={12}/> Limpiar
          </button>
        </div>
      </Card>

      <Tabs
        value={tab} onChange={setTab}
        items={[
          { value: "todos", label: "Todas", count: 25 },
          { value: "confirmadas", label: "Confirmadas", count: 18 },
          { value: "pendientes", label: "Pendientes", count: 4 },
          { value: "completadas", label: "Completadas", count: 2 },
          { value: "canceladas", label: "Canceladas / no-show", count: 1 },
        ]}
      />

      {[
        ["HOY · MARTES 26 DE MAYO", HOY.map(a => ({...a, hora: a.hora}))],
        ["MAÑANA · MIÉRCOLES 27", MANANA],
        ["ESTA SEMANA", SEMANA],
      ].map(([label, arr]) => (
        <section key={label} className="apptg">
          <h3 className="apptg__label">{label}<span className="apptg__count muted">{arr.length} citas</span></h3>
          <Card padding="none">
            <ul className="appt-list">
              {arr.map(a => <ApptRow key={a.id} a={a} onClick={() => nav("detalle-cita")}/>)}
            </ul>
          </Card>
        </section>
      ))}

      <div className="row split" style={{ marginTop: 8 }}>
        <span className="muted" style={{fontSize: 13}}>Mostrando 18 de 47 citas</span>
        <div className="row-tight">
          <Button variant="secondary" size="sm" icon={Icons.ChevronL}>Anterior</Button>
          <Button variant="secondary" size="sm" iconRight={Icons.ChevronR}>Siguiente</Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Detalle de cita
// ============================================================
function ApptDetailScreen({ nav }) {
  const a = AGENDA_DATA.APPTS_TODAY[3]; // teleconsulta 10:30 — Roberto Jiménez
  const p = getPatient(a.pacienteId);
  const s = getService(a.servicioId);
  const [notas, setNotas] = useState("Paciente refiere mejoría parcial tras ajuste de metformina (850mg c/12h). Glucosa en ayuno 128 mg/dL (vs. 165 hace dos semanas). Continúa con dieta DASH. Sin signos de hipoglucemia.\n\nPlan: mantener dosis actual, repetir HbA1c en 6 semanas.");
  const [modalCancel, setModalCancel] = useState(false);
  const toast = useToast();

  return (
    <div className="stack">
      <header className="apptd__head">
        <Button variant="ghost" icon={Icons.ArrowL} onClick={() => nav("citas")}>Volver a citas</Button>
        <div className="row-tight" style={{marginLeft: "auto"}}>
          <span className="muted mono" style={{fontSize: 12}}>Cita #A-2026-0247</span>
          <StatusBadge status={a.estado}/>
        </div>
      </header>

      <div className="apptd">
        {/* Main column */}
        <div className="stack">
          <Card padding="md" className="apptd__hero">
            <div className="apptd__hero-l">
              <Avatar name={p.nombre} size={56}/>
              <div className="apptd__hero-info">
                <h2 className="apptd__name">{p.nombre}</h2>
                <div className="apptd__hero-meta">
                  <span><Icons.Phone size={13}/> {p.tel}</span>
                  <span><Icons.Mail size={13}/> {p.email}</span>
                  <Badge tone="danger" size="sm" icon={Icons.AlertT}>2 no-shows previos</Badge>
                </div>
              </div>
            </div>
            <div className="apptd__hero-r">
              {a.tipo === "teleconsulta" ? (
                <Button variant="primary" icon={Icons.Video} size="lg">Iniciar Zoom</Button>
              ) : (
                <Button variant="primary" icon={Icons.Check} size="lg">Marcar como completada</Button>
              )}
            </div>
          </Card>

          <Card>
            <CardHead title="Detalles de la cita"/>
            <div className="apptd__grid">
              <div className="apptd__field">
                <span className="apptd__field-l">Fecha y hora</span>
                <span className="apptd__field-v"><Icons.Clock size={14} style={{display:"inline", marginRight: 6, verticalAlign: -2}}/>Mar 26 de mayo · 10:30 — 11:00</span>
              </div>
              <div className="apptd__field">
                <span className="apptd__field-l">Servicio</span>
                <span className="apptd__field-v">{s.nombre} <span className="muted">· {s.duracion} min · {fmtMxn(s.precio)}</span></span>
              </div>
              <div className="apptd__field">
                <span className="apptd__field-l">Tipo</span>
                <span className="apptd__field-v">{a.tipo === "teleconsulta"
                  ? <><Icons.Video size={14} style={{display:"inline", marginRight: 6, verticalAlign: -2}}/>Teleconsulta · Zoom</>
                  : <><Icons.MapPin size={14} style={{display:"inline", marginRight: 6, verticalAlign: -2}}/>Presencial</>}</span>
              </div>
              <div className="apptd__field">
                <span className="apptd__field-l">Motivo de consulta</span>
                <span className="apptd__field-v">{a.motivo}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead
              title="Notas clínicas"
              subtitle="Solo visibles para ti — privadas del paciente."
              actions={<Button size="sm" variant="ghost" icon={Icons.FileText}>Plantilla</Button>}
            />
            <Textarea
              value={notas} onChange={(e) => setNotas(e.target.value)}
              rows={8}
              max={2000} count
              placeholder="Escribe tus notas de la consulta…"
            />
            <div className="row" style={{marginTop: 12, justifyContent: "space-between"}}>
              <span className="muted" style={{fontSize: 12}}>Autoguardado · hace 2 min</span>
              <Button size="sm" variant="primary" onClick={() => toast({ tone: "success", title: "Notas guardadas", message: "Se sincronizó con el expediente."})}>Guardar notas</Button>
            </div>
          </Card>

          <Card>
            <CardHead title="Historial de cambios" eyebrow="Auditoría"/>
            <ul className="hist">
              <li className="hist__row"><span className="hist__time mono">26 may · 10:32</span><span className="hist__msg"><strong>Estado → Confirmada</strong> · El paciente confirmó por WhatsApp.</span></li>
              <li className="hist__row"><span className="hist__time mono">25 may · 18:04</span><span className="hist__msg"><strong>Recordatorio enviado</strong> · Mensaje #2 entregado.</span></li>
              <li className="hist__row"><span className="hist__time mono">24 may · 09:12</span><span className="hist__msg"><strong>Recordatorio enviado</strong> · Mensaje #1 entregado.</span></li>
              <li className="hist__row"><span className="hist__time mono">20 may · 16:48</span><span className="hist__msg"><strong>Cita creada</strong> por el Dr. García López.</span></li>
            </ul>
          </Card>
        </div>

        {/* Side actions */}
        <aside className="stack">
          <Card>
            <CardHead title="Acciones rápidas"/>
            <div className="stack-3">
              <Button variant="primary" icon={Icons.Check} className="btn--full" onClick={() => toast({ tone: "success", title: "Cita completada"})}>Completar</Button>
              <Button variant="secondary" icon={Icons.Refresh} className="btn--full">Reagendar</Button>
              <Button variant="ghost" icon={Icons.X} className="btn--full" onClick={() => setModalCancel(true)}>Cancelar cita</Button>
            </div>
            <hr className="hr"/>
            <div className="stack-3">
              <Button variant="tonal" icon={Icons.Pill} className="btn--full" onClick={() => nav("recetas-nueva")}>Generar receta</Button>
              <Button variant="tonal" icon={Icons.Plus} className="btn--full" onClick={() => nav("nueva-cita")}>Agendar próxima</Button>
              <Button variant="tonal" icon={Icons.WhatsApp} className="btn--full">Mensaje al paciente</Button>
            </div>
          </Card>

          <Card>
            <CardHead title="Datos del paciente" actions={<button className="iconbtn" onClick={() => nav("perfil")} aria-label="Ver perfil"><Icons.ArrowR size={14}/></button>}/>
            <ul className="kv">
              <li><span className="kv__l">Edad</span><span className="kv__v">{p.edad} años</span></li>
              <li><span className="kv__l">Nacimiento</span><span className="kv__v">3 nov 1973</span></li>
              <li><span className="kv__l">Tipo de sangre</span><span className="kv__v">{p.grupoSanguineo}</span></li>
              <li><span className="kv__l">Alergias</span><span className="kv__v"><Badge tone="warning" size="sm">{p.alergias}</Badge></span></li>
              <li><span className="kv__l">Total de citas</span><span className="kv__v">{p.totalCitas}</span></li>
              <li><span className="kv__l">No-shows</span><span className="kv__v"><Badge tone="danger" size="sm">{p.noShows} (8.7%)</Badge></span></li>
            </ul>
          </Card>

          <Card className="apptd__consent">
            <CardHead title="Consentimientos" eyebrow="Vigentes"/>
            <ul className="consent">
              <li className="consent__row"><Icons.Check size={14} className="consent__icon"/>Aviso de privacidad (firmado 12 ene 2024)</li>
              <li className="consent__row"><Icons.Check size={14} className="consent__icon"/>Tratamiento de datos clínicos</li>
              <li className="consent__row"><Icons.Check size={14} className="consent__icon"/>Recordatorios por WhatsApp</li>
            </ul>
          </Card>
        </aside>
      </div>

      <Modal
        open={modalCancel}
        onClose={() => setModalCancel(false)}
        title="¿Cancelar esta cita?"
        footer={<>
          <Button variant="ghost" onClick={() => setModalCancel(false)}>No, mantener</Button>
          <Button variant="danger" onClick={() => { setModalCancel(false); toast({ tone: "warning", title: "Cita cancelada", message: "Se notificó al paciente por WhatsApp." }); }}>Sí, cancelar cita</Button>
        </>}
      >
        <p style={{ marginBottom: 12 }}>Vas a cancelar la cita de <strong>{p.nombre}</strong> del <strong>26 de mayo a las 10:30</strong>.</p>
        <Field label="Motivo de cancelación (opcional)">
          <Textarea rows={3} placeholder="Ej: el paciente solicitó reagendar"/>
        </Field>
        <div style={{marginTop: 12}}>
          <Checkbox checked={true} onChange={() => {}} label="Notificar al paciente por WhatsApp"/>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================
// Nueva cita
// ============================================================
function NewApptScreen({ nav }) {
  const [paciente, setPaciente] = useState(null);
  const [search, setSearch] = useState("");
  const [servicio, setServicio] = useState("s1");
  const [tipo, setTipo] = useState("presencial");
  const [fecha, setFecha] = useState(26); // May 26
  const [hora, setHora] = useState("11:30");
  const [recurrente, setRecurrente] = useState(false);
  const [motivo, setMotivo] = useState("");
  const toast = useToast();

  const matches = !paciente && search ? AGENDA_DATA.PATIENTS.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase())).slice(0, 5) : [];

  const slots = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","15:00","15:30","16:00","16:30","17:00","17:30"];
  const taken = new Set(["09:00","09:30","10:30","11:00","15:00","16:00","17:30","12:00","12:30","13:00","13:30"]);

  // mini calendar May 2026
  const DOW = ["L","M","M","J","V","S","D"];
  const monthDays = Array.from({length: 31}, (_, i) => i + 1);
  // May 1 is Friday (5), so before May 1: 4 padding (Mon..Thu)
  const padBefore = 4;

  const sel = paciente || (search === "María" ? AGENDA_DATA.PATIENTS[0] : null);

  return (
    <div className="newappt">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Agendar</span>
          <h1 className="page__title">Nueva cita</h1>
          <p className="page__sub">Completa los datos y confirma — el paciente recibirá la confirmación por WhatsApp.</p>
        </div>
      </header>

      <div className="newappt__grid">
        <div className="stack">
          <Card>
            <CardHead title="1 · Paciente"/>
            {sel ? (
              <div className="patient-pill">
                <Avatar name={sel.nombre} size={40}/>
                <div className="patient-pill__info">
                  <div className="patient-pill__name">{sel.nombre}</div>
                  <div className="patient-pill__meta muted">{sel.edad} años · {sel.tel}{sel.noShows > 0 && <> · <Badge tone="danger" size="sm">{sel.noShows} no-shows</Badge></>}</div>
                </div>
                <Button variant="ghost" size="sm" icon={Icons.X} onClick={() => { setPaciente(null); setSearch(""); }}>Cambiar</Button>
              </div>
            ) : (
              <div className="patient-search">
                <Input icon={Icons.Search} placeholder="Buscar por nombre, teléfono o email…" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus/>
                {matches.length > 0 && (
                  <ul className="patient-search__results">
                    {matches.map(p => (
                      <li key={p.id} className="patient-search__row" onClick={() => setPaciente(p)}>
                        <Avatar name={p.nombre} size={32}/>
                        <div><div style={{fontWeight: 500}}>{p.nombre}</div><div className="muted" style={{fontSize: 12}}>{p.edad} años · {p.tel}</div></div>
                      </li>
                    ))}
                  </ul>
                )}
                <button className="patient-search__new"><Icons.Plus size={14}/> Crear nuevo paciente</button>
              </div>
            )}
          </Card>

          <Card>
            <CardHead title="2 · Servicio y tipo"/>
            <div className="services">
              {AGENDA_DATA.SERVICES.map(s => (
                <label key={s.id} className={`service ${servicio === s.id ? "is-active" : ""}`}>
                  <input type="radio" name="svc" checked={servicio === s.id} onChange={() => setServicio(s.id)}/>
                  <div className="service__name">{s.nombre}</div>
                  <div className="service__meta">
                    <span>{s.duracion} min</span>
                    <span className="mono">{fmtMxn(s.precio)}</span>
                  </div>
                </label>
              ))}
            </div>
            <div style={{marginTop: 14}}>
              <div className="seg">
                <button className={`seg__btn ${tipo === "presencial" ? "is-active" : ""}`} onClick={() => setTipo("presencial")}><Icons.MapPin size={14}/> Presencial</button>
                <button className={`seg__btn ${tipo === "teleconsulta" ? "is-active" : ""}`} onClick={() => setTipo("teleconsulta")}><Icons.Video size={14}/> Teleconsulta</button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="3 · Fecha y hora"/>
            <div className="newappt__date">
              <div className="mini-cal">
                <div className="mini-cal__head">
                  <button className="iconbtn"><Icons.ChevronL size={14}/></button>
                  <span style={{fontWeight: 600, fontSize: 14}}>Mayo 2026</span>
                  <button className="iconbtn"><Icons.ChevronR size={14}/></button>
                </div>
                <div className="mini-cal__dow">{DOW.map((d, i) => <span key={i}>{d}</span>)}</div>
                <div className="mini-cal__grid">
                  {Array.from({length: padBefore}).map((_, i) => <span key={"p"+i}/>)}
                  {monthDays.map(d => {
                    const dow = (d + 4) % 7;
                    const isWeekend = dow === 0 || dow === 6;
                    const disabled = d < 26 || isWeekend;
                    return (
                      <button
                        key={d}
                        className={`mini-cal__day ${disabled ? "is-disabled" : ""} ${fecha === d ? "is-active" : ""}`}
                        disabled={disabled}
                        onClick={() => setFecha(d)}
                      >{d}</button>
                    );
                  })}
                </div>
              </div>
              <div className="slots">
                <div className="slots__head">
                  <span style={{fontWeight: 500, fontSize: 14}}>Horarios disponibles · Mar 26 may</span>
                  <span className="muted" style={{fontSize: 12}}>{slots.length - taken.size} libres</span>
                </div>
                <div className="slots__grid">
                  {slots.map(s => (
                    <button
                      key={s}
                      className={`slot ${taken.has(s) ? "is-taken" : ""} ${hora === s ? "is-active" : ""}`}
                      disabled={taken.has(s)}
                      onClick={() => setHora(s)}
                    >{s}</button>
                  ))}
                </div>
                <div className="muted" style={{fontSize: 12, marginTop: 10}}>Los horarios bloqueados están en gris. Comida 14:00–15:00.</div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="4 · Motivo y notas"/>
            <Field label="Motivo de consulta" required>
              <Input placeholder="Ej: control de presión, dolor lumbar, primera vez" value={motivo} onChange={(e) => setMotivo(e.target.value)}/>
            </Field>
            <div style={{height: 12}}/>
            <Field label="Notas internas (opcional)" hint="Solo tú las verás">
              <Textarea rows={3} placeholder="Recordatorios, indicaciones previas, etc."/>
            </Field>
          </Card>

          <Card>
            <div className="row split">
              <div>
                <div style={{fontWeight: 500}}>Cita recurrente</div>
                <div className="muted" style={{fontSize: 12, marginTop: 2}}>Repite esta cita en un intervalo fijo.</div>
              </div>
              <Toggle checked={recurrente} onChange={setRecurrente}/>
            </div>
            {recurrente && (
              <div className="grid-2" style={{marginTop: 16}}>
                <Field label="Frecuencia">
                  <Select>
                    <option>Cada semana</option>
                    <option>Cada 2 semanas</option>
                    <option>Cada mes</option>
                  </Select>
                </Field>
                <Field label="Número de repeticiones">
                  <Input type="number" defaultValue="4" min={1} max={52}/>
                </Field>
              </div>
            )}
          </Card>
        </div>

        {/* Sticky summary */}
        <aside>
          <Card className="newappt__summary">
            <CardHead title="Resumen" eyebrow="Confirmar"/>
            <ul className="sum">
              <li className="sum__row"><span className="sum__l">Paciente</span><span className="sum__v">{sel ? sel.nombre : <em className="muted">Sin seleccionar</em>}</span></li>
              <li className="sum__row"><span className="sum__l">Servicio</span><span className="sum__v">{getService(servicio).nombre}</span></li>
              <li className="sum__row"><span className="sum__l">Tipo</span><span className="sum__v">{tipo === "teleconsulta" ? "Teleconsulta" : "Presencial"}</span></li>
              <li className="sum__row"><span className="sum__l">Fecha</span><span className="sum__v">{fecha} de mayo, 2026</span></li>
              <li className="sum__row"><span className="sum__l">Hora</span><span className="sum__v mono">{hora}</span></li>
              <li className="sum__row"><span className="sum__l">Duración</span><span className="sum__v">{getService(servicio).duracion} min</span></li>
              <li className="sum__row sum__row--total"><span className="sum__l">Total</span><span className="sum__v mono">{fmtMxn(getService(servicio).precio)}</span></li>
            </ul>
            <div className="stack-3" style={{marginTop: 18}}>
              <Button className="btn--full" variant="primary" size="lg" disabled={!sel || !motivo} onClick={() => { toast({tone: "success", title: "Cita agendada", message: `${sel?.nombre} · 26 may, ${hora}`}); nav("agenda-dia"); }}>Agendar cita</Button>
              <Button className="btn--full" variant="ghost" onClick={() => nav("citas")}>Cancelar</Button>
            </div>
            <div className="muted" style={{fontSize: 11.5, marginTop: 14, textAlign: "center"}}>El paciente recibirá la confirmación por WhatsApp.</div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { ApptsListScreen, ApptDetailScreen, NewApptScreen });
