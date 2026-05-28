/* eslint-disable */
// AgendaMed — Dashboard & Agenda screens

// ============================================================
// Dashboard
// ============================================================
function DashboardScreen({ nav }) {
  const { CLINIC, APPTS_TODAY, BIRTHDAYS_TODAY, BIRTHDAYS_WEEK } = AGENDA_DATA;

  const metrics = [
    { label: "Citas hoy",        value: 8,    delta: null,                  hint: "5 confirmadas · 2 pendientes · 1 completada" },
    { label: "Citas este mes",   value: 47,   delta: { value: "+12%", up: true }, hint: "vs. abril 2026" },
    { label: "Pacientes activos",value: 234,  delta: { value: "+8",   up: true }, hint: "12 nuevos este mes" },
    { label: "No-shows mes",     value: 4,            delta: { value: "-1.2%", up: true }, hint: "8.5% del total · meta ≤ 10%" },
  ];

  return (
    <div className="stack-6">
      <header className="dash-hero">
        <div>
          <p className="dash-hero__hi">Buenos días, Dr. García <span aria-hidden>·</span></p>
          <h1 className="dash-hero__title">Tu día tiene <span className="mono tnum">8 citas</span> y <span className="dash-hero__teleN">1 teleconsulta</span>.</h1>
          <p className="dash-hero__sub muted">{AGENDA_DATA.TODAY_LABEL} · Próxima cita en <strong className="tnum">14 min</strong> con María González</p>
        </div>
        <div className="dash-hero__cta row">
          <Button variant="secondary" icon={Icons.Calendar} onClick={() => nav("agenda-dia")}>Ver agenda completa</Button>
          <Button variant="primary" icon={Icons.Plus} onClick={() => nav("nueva-cita")}>Nueva cita</Button>
        </div>
      </header>

      {/* Alertas */}
      <div className="alert alert--warn">
        <Icons.AlertT size={16}/>
        <div className="alert__body">
          <strong>2 notificaciones de WhatsApp no se entregaron</strong> a Roberto Jiménez (no-shows: 2). Considera confirmar por teléfono.
        </div>
        <button className="linkish" onClick={() => nav("perfil")}>Ver paciente →</button>
      </div>

      {/* Metrics */}
      <div className="grid-4 metrics">
        {metrics.map(m => (
          <Card key={m.label} className="metric">
            <div className="metric__label">{m.label}</div>
            <div className="metric__row">
              <div className="metric__value tnum">{m.value}</div>
              {m.delta && (
                <Badge tone={m.delta.up ? "success" : "danger"} size="sm">
                  {m.delta.up ? "▲" : "▼"} {m.delta.value}
                </Badge>
              )}
            </div>
            <div className="metric__hint muted">{m.hint}</div>
          </Card>
        ))}
      </div>

      <div className="grid-main-side">
        {/* Agenda del día */}
        <Card padding="none" className="card-tight">
          <CardHead
            title="Agenda de hoy"
            subtitle="Martes 26 de mayo · 8 citas · 1 bloqueado"
            actions={
              <div className="row-tight">
                <Button variant="ghost" size="sm" onClick={() => nav("agenda-dia")}>Abrir agenda</Button>
              </div>
            }
          />
          <ul className="appt-list">
            {APPTS_TODAY.map(a => <ApptRow key={a.id} a={a} onClick={() => nav("detalle-cita")} />)}
          </ul>
        </Card>

        {/* Side column */}
        <div className="stack">
          {/* Cumpleaños */}
          <Card className="bday">
            <CardHead title="Cumpleaños" subtitle="Felicita y fideliza" />
            {BIRTHDAYS_TODAY.map((b, i) => {
              const p = getPatient(b.pacienteId);
              return (
                <div key={i} className="bday__row bday__row--today">
                  <Avatar name={p.nombre} size={40}/>
                  <div className="bday__info">
                    <div className="bday__name">{p.nombre}</div>
                    <div className="bday__meta">
                      <Badge tone="warning" icon={Icons.Cake} size="sm">Hoy · {b.edad} años</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="tonal" icon={Icons.WhatsApp}>Felicitar</Button>
                </div>
              );
            })}
            <div className="bday__divider">Esta semana</div>
            {BIRTHDAYS_WEEK.map((b, i) => {
              const p = getPatient(b.pacienteId);
              return (
                <div key={i} className="bday__row">
                  <Avatar name={p.nombre} size={32}/>
                  <div className="bday__info">
                    <div className="bday__name">{p.nombre}</div>
                    <div className="bday__meta muted">{b.dia} · {b.edad} años</div>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Próximas 48h */}
          <Card>
            <CardHead title="Próximas 48 horas" />
            <ul className="next48">
              <li className="next48__row"><span className="next48__time mono tnum">Mañ 08:30</span><span>Laura Torres</span><Badge tone="status-confirmada" size="sm" dot>Confirmada</Badge></li>
              <li className="next48__row"><span className="next48__time mono tnum">Mañ 09:30</span><span>Sofía Vargas</span><Badge tone="status-confirmada" size="sm" dot>Confirmada</Badge></li>
              <li className="next48__row"><span className="next48__time mono tnum">Mañ 11:00</span><span>Miguel Pérez</span><Badge tone="status-confirmada" size="sm" dot>Confirmada</Badge></li>
              <li className="next48__row"><span className="next48__time mono tnum">Mañ 15:30</span><span>María González</span><Badge tone="status-confirmada" size="sm" dot icon={Icons.Video}>Teleconsulta</Badge></li>
              <li className="next48__row"><span className="next48__time mono tnum">Mañ 16:30</span><span>Diego Ortiz</span><Badge tone="status-pendiente" size="sm" dot>Pendiente</Badge></li>
              <li className="next48__row"><span className="next48__time mono tnum">Jue 09:00</span><span>José Ramírez</span><Badge tone="status-confirmada" size="sm" dot>Confirmada</Badge></li>
            </ul>
          </Card>

          {/* Resumen */}
          <Card>
            <CardHead title="Resumen del mes" eyebrow="Ingresos estimados"/>
            <div className="rev">
              <div className="rev__big tnum">$23,500 <span className="rev__cur">MXN</span></div>
              <div className="rev__delta">
                <Badge tone="success" size="sm">+15% vs. abril</Badge>
              </div>
              <Sparkline values={[8,12,9,14,11,16,18,21,17,23,22,28,25,24]}/>
              <div className="rev__legend muted">47 citas completadas · 4 canceladas</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ values, width = 280, height = 56 }) {
  const max = Math.max(...values), min = Math.min(...values);
  const dx = width / (values.length - 1);
  const pts = values.map((v, i) => [i * dx, height - 4 - ((v - min) / (max - min || 1)) * (height - 8)]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const fill = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="sparkline" preserveAspectRatio="none">
      <path d={fill} fill="var(--c-brand-soft)"/>
      <path d={d} fill="none" stroke="var(--c-brand)" strokeWidth="1.5"/>
    </svg>
  );
}

// Row for upcoming appt list
function ApptRow({ a, onClick }) {
  if (a.bloqueo) {
    return (
      <li className="appt-row appt-row--block" onClick={onClick}>
        <span className="appt-row__time mono tnum">{a.hora} – {a.fin}</span>
        <span className="appt-row__main">
          <Badge tone="neutral" size="sm" icon={Icons.Clock}>Bloqueado</Badge>
          <span className="appt-row__name">{a.motivo}</span>
        </span>
        <span className="appt-row__actions"/>
      </li>
    );
  }
  const p = getPatient(a.pacienteId);
  const s = getService(a.servicioId);
  return (
    <li className={`appt-row appt-row--${a.estado}`} onClick={onClick}>
      <span className="appt-row__time mono tnum">{a.hora}<span className="muted"> · {a.duracion}m</span></span>
      <Avatar name={p.nombre} size={32}/>
      <span className="appt-row__main">
        <span className="appt-row__name">{p.nombre}</span>
        <span className="appt-row__meta muted">
          {s.nombre}
          {a.tipo === "teleconsulta" && <> · <Icons.Video size={12}/> Teleconsulta</>}
          {a.motivo && <> · {a.motivo}</>}
        </span>
      </span>
      <span className="appt-row__status"><StatusBadge status={a.estado} size="sm"/></span>
      <span className="appt-row__actions">
        {a.tipo === "teleconsulta" && a.estado !== "completada" && (
          <Button size="sm" variant="tonal" icon={Icons.Video}>Iniciar Zoom</Button>
        )}
        <button className="iconbtn" aria-label="Más opciones"><Icons.ChevronR size={14}/></button>
      </span>
    </li>
  );
}

// ============================================================
// Agenda — view chrome shared (day/week/month)
// ============================================================
function AgendaChrome({ view, onView, dateLabel, onPrev, onNext, onToday, onNew }) {
  return (
    <div className="agenda-chrome">
      <div className="agenda-chrome__left">
        <div className="agenda-nav">
          <button className="iconbtn" aria-label="Anterior" onClick={onPrev}><Icons.ChevronL size={16}/></button>
          <button className="agenda-nav__today" onClick={onToday}>Hoy</button>
          <button className="iconbtn" aria-label="Siguiente" onClick={onNext}><Icons.ChevronR size={16}/></button>
        </div>
        <h2 className="agenda-date">{dateLabel}</h2>
      </div>
      <div className="agenda-chrome__right">
        <div className="segmented">
          {[["agenda-dia","Día"],["agenda-semana","Semana"],["agenda-mes","Mes"]].map(([id, l]) => (
            <button key={id} className={`segmented__btn ${view === id ? "is-active" : ""}`} onClick={() => onView(id)}>{l}</button>
          ))}
        </div>
        <Button variant="secondary" icon={Icons.Filter}>Filtros</Button>
        <Button variant="primary" icon={Icons.Plus} onClick={onNew}>Nueva cita</Button>
      </div>
    </div>
  );
}

// ============================================================
// Agenda · Día
// ============================================================
function AgendaDayScreen({ nav }) {
  // Hora actual ficticia: 10:48
  const nowMin = 10 * 60 + 48;
  const startMin = 8 * 60, endMin = 18 * 60;
  const totalMin = endMin - startMin;
  const pxPerMin = 1.4; // 60min = 84px
  const heightPx = totalMin * pxPerMin;

  const slots = [];
  for (let m = startMin; m < endMin; m += 30) {
    const h = Math.floor(m / 60), mm = m % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  }

  return (
    <div className="stack">
      <AgendaChrome
        view="agenda-dia"
        onView={nav}
        dateLabel="Martes, 26 de mayo 2026"
        onPrev={()=>{}} onNext={()=>{}} onToday={()=>{}}
        onNew={() => nav("nueva-cita")}
      />

      <Card padding="none" className="agenda-day">
        <div className="agenda-day__head">
          <div className="agenda-day__legend">
            <span><span className="leg leg--confirmada"/> Confirmada</span>
            <span><span className="leg leg--pendiente"/> Pendiente</span>
            <span><span className="leg leg--completada"/> Completada</span>
            <span><span className="leg leg--noshow"/> No-show</span>
            <span><span className="leg leg--block"/> Bloqueado</span>
          </div>
          <div className="muted" style={{fontSize: 12}}>Click en un slot vacío para agendar</div>
        </div>

        <div className="agenda-day__grid" style={{ height: heightPx }}>
          {/* Hour labels */}
          <div className="agenda-day__hours">
            {Array.from({ length: 11 }).map((_, i) => {
              const h = 8 + i;
              return (
                <div key={h} className="agenda-day__hour" style={{ top: (h * 60 - startMin) * pxPerMin }}>
                  <span className="agenda-day__hour-l mono">{String(h).padStart(2, "0")}:00</span>
                </div>
              );
            })}
          </div>

          {/* Slot lines */}
          <div className="agenda-day__slots">
            {slots.map((s, i) => (
              <div key={s} className={`agenda-day__slot ${i % 2 === 0 ? "is-hour" : ""}`} style={{ top: i * 30 * pxPerMin }} />
            ))}
          </div>

          {/* Current time line */}
          <div className="agenda-now" style={{ top: (nowMin - startMin) * pxPerMin }}>
            <span className="agenda-now__time mono">10:48</span>
            <span className="agenda-now__line"/>
          </div>

          {/* Appointments */}
          <div className="agenda-day__col">
            {AGENDA_DATA.APPTS_TODAY.map(a => {
              const [hh, mm] = a.hora.split(":").map(Number);
              const top = (hh * 60 + mm - startMin) * pxPerMin;
              const height = a.duracion * pxPerMin - 2;
              if (a.bloqueo) {
                return (
                  <div key={a.id} className="agenda-event agenda-event--block" style={{ top, height }}>
                    <div className="agenda-event__time mono">{a.hora} – {a.fin}</div>
                    <div className="agenda-event__title">Bloqueado · {a.motivo}</div>
                  </div>
                );
              }
              const p = getPatient(a.pacienteId);
              const s = getService(a.servicioId);
              return (
                <div
                  key={a.id}
                  className={`agenda-event agenda-event--${a.estado} ${a.tipo === "teleconsulta" ? "is-tele" : ""}`}
                  style={{ top, height }}
                  onClick={() => nav("detalle-cita")}
                >
                  <div className="agenda-event__bar"/>
                  <div className="agenda-event__body">
                    <div className="row-tight">
                      <span className="agenda-event__time mono">{a.hora}</span>
                      <StatusBadge status={a.estado} size="sm"/>
                      {a.tipo === "teleconsulta" && <Badge tone="info" icon={Icons.Video} size="sm">Tele</Badge>}
                    </div>
                    <div className="agenda-event__name">{p.nombre}</div>
                    <div className="agenda-event__meta muted">{s.nombre}{a.motivo ? ` · ${a.motivo}` : ""}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// Agenda · Semana
// ============================================================
function AgendaWeekScreen({ nav }) {
  const startMin = 8 * 60, endMin = 18 * 60;
  const totalMin = endMin - startMin;
  const pxPerMin = 1.1;
  const heightPx = totalMin * pxPerMin;
  const nowMin = 10 * 60 + 48;

  return (
    <div className="stack">
      <AgendaChrome
        view="agenda-semana"
        onView={nav}
        dateLabel="Semana del 25 al 29 de mayo, 2026"
        onPrev={()=>{}} onNext={()=>{}} onToday={()=>{}}
        onNew={() => nav("nueva-cita")}
      />

      <Card padding="none" className="agenda-week">
        <div className="agenda-week__head">
          <div className="agenda-week__hours-spacer"/>
          {AGENDA_DATA.WEEK.map(d => (
            <div key={d.fecha} className={`agenda-week__col-head ${d.hoy ? "is-today" : ""}`}>
              <span className="agenda-week__dow">{d.label.split(" ")[0]}</span>
              <span className={`agenda-week__day ${d.hoy ? "is-today" : ""}`}>{d.label.split(" ")[1]}</span>
            </div>
          ))}
        </div>
        <div className="agenda-week__body" style={{ height: heightPx }}>
          <div className="agenda-week__hours">
            {Array.from({ length: 11 }).map((_, i) => {
              const h = 8 + i;
              return (
                <div key={h} className="agenda-week__hour" style={{ top: (h * 60 - startMin) * pxPerMin }}>
                  <span className="mono" style={{ fontSize: 11 }}>{String(h).padStart(2, "0")}:00</span>
                </div>
              );
            })}
          </div>

          {AGENDA_DATA.WEEK.map((d) => (
            <div key={d.fecha} className="agenda-week__col">
              {/* slot lines */}
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className={`agenda-week__slot ${i % 2 === 0 ? "is-hour" : ""}`} style={{ top: i * 30 * pxPerMin }} />
              ))}
              {/* now line */}
              {d.hoy && (
                <div className="agenda-week__now" style={{ top: (nowMin - startMin) * pxPerMin }}/>
              )}
              {d.citas.map((a, i) => {
                const [hh, mm] = a.hora.split(":").map(Number);
                const [eh, em] = a.fin.split(":").map(Number);
                const dur = (eh * 60 + em) - (hh * 60 + mm);
                const top = (hh * 60 + mm - startMin) * pxPerMin;
                const height = dur * pxPerMin - 1;
                if (a.bloqueo) {
                  return <div key={i} className="agenda-week__event agenda-week__event--block" style={{ top, height }}>{a.motivo}</div>;
                }
                const p = getPatient(a.pacienteId);
                return (
                  <div key={i} className={`agenda-week__event agenda-week__event--${a.estado} ${a.tipo === "teleconsulta" ? "is-tele" : ""}`} style={{ top, height }} onClick={() => nav("detalle-cita")}>
                    <div className="agenda-week__event-time mono">{a.hora}</div>
                    <div className="agenda-week__event-name">{p?.nombre.split(" ").slice(0,2).join(" ")}</div>
                    {a.tipo === "teleconsulta" && <Icons.Video size={11} className="agenda-week__event-tele"/>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// Agenda · Mes
// ============================================================
function AgendaMonthScreen({ nav }) {
  const { MONTH_DAYS } = AGENDA_DATA;
  const DOW = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  // May 2026 starts Friday; need 5 empty slots before May 1 (Sun,Mon,Tue,Wed,Thu)
  const padBefore = 5;
  const totalCells = padBefore + MONTH_DAYS.length;
  const padAfter = (7 - (totalCells % 7)) % 7;

  return (
    <div className="stack">
      <AgendaChrome
        view="agenda-mes"
        onView={nav}
        dateLabel="Mayo 2026"
        onPrev={()=>{}} onNext={()=>{}} onToday={()=>{}}
        onNew={() => nav("nueva-cita")}
      />
      <Card padding="none" className="month">
        <div className="month__head">
          {DOW.map(d => <div key={d} className="month__dow">{d}</div>)}
        </div>
        <div className="month__grid">
          {Array.from({ length: padBefore }).map((_, i) => (
            <div key={"pre"+i} className="month__cell month__cell--out">
              <span className="month__date">{30 - padBefore + i + 1}</span>
            </div>
          ))}
          {MONTH_DAYS.map(d => {
            const isToday = d.d === 26;
            return (
              <button
                key={d.d}
                className={`month__cell ${isToday ? "is-today" : ""} ${(d.dow === 0 || d.dow === 6) ? "is-weekend" : ""}`}
                onClick={() => nav("agenda-dia")}
              >
                <div className="month__top">
                  <span className={`month__date ${isToday ? "is-today" : ""}`}>{d.d}</span>
                  {d.cumple && <Icons.Cake size={12} className="month__cake" />}
                </div>
                {d.count > 0 && (
                  <div className="month__events">
                    {d.estados.map((est, i) => (
                      <span key={i} className={`month__dot month__dot--${est}`}/>
                    ))}
                    {d.count > 3 && <span className="month__more">+{d.count - 3}</span>}
                  </div>
                )}
                {d.count > 0 && (
                  <div className="month__count muted">
                    {d.count} cita{d.count !== 1 ? "s" : ""}
                    {d.hasTele && <> · <Icons.Video size={10} style={{display:"inline"}}/></>}
                  </div>
                )}
              </button>
            );
          })}
          {Array.from({ length: padAfter }).map((_, i) => (
            <div key={"post"+i} className="month__cell month__cell--out">
              <span className="month__date">{i + 1}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { DashboardScreen, AgendaDayScreen, AgendaWeekScreen, AgendaMonthScreen, ApptRow });
