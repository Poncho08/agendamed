/* eslint-disable */
// AgendaMed — Public-facing screens (book, cancel) + State screens (empty, feedback)

// ============================================================
// Página pública — agendar cita
// ============================================================
function PublicBookScreen({ nav }) {
  const [paso, setPaso] = useState(1);
  const [servicio, setServicio] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null);
  const [done, setDone] = useState(false);
  const toast = useToast();

  if (done) {
    return (
      <>
        <PublicBookHeader/>
        <main className="book-wrap">
          <div className="book-done">
            <div className="book-done__icon"><Icons.Check size={36} stroke={3}/></div>
            <h1 className="book-done__title">¡Tu cita está confirmada!</h1>
            <p className="muted" style={{ fontSize: 15 }}>Te enviamos los detalles por WhatsApp y correo electrónico.</p>
            <div className="book-summary book-summary--center">
              <div className="book-summary__row"><span>Servicio</span><strong>{getService(servicio).nombre}</strong></div>
              <div className="book-summary__row"><span>Fecha</span><strong>Miércoles 27 de mayo, 2026</strong></div>
              <div className="book-summary__row"><span>Hora</span><strong className="mono">{hora}</strong></div>
              <div className="book-summary__row"><span>Dirección</span><strong style={{textAlign:"right"}}>Av. Chapultepec 234, GDL</strong></div>
            </div>
            <p className="muted" style={{ fontSize: 13, marginTop: 16, maxWidth: 460 }}>Recibirás un recordatorio 24h y 2h antes. Si necesitas cancelar, usa el link del mensaje — la ventana de cancelación es de 3 horas antes.</p>
            <div className="row" style={{ marginTop: 18 }}>
              <Button variant="secondary" icon={Icons.Download}>Agregar al calendario</Button>
              <Button variant="ghost" onClick={() => { setDone(false); setPaso(1); }}>Agendar otra cita</Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PublicBookHeader/>
      <main className="book-wrap">
        <div className="book-steps">
          {["Servicio", "Fecha", "Horario", "Tus datos"].map((l, i) => {
            const n = i + 1;
            return (
              <div key={n} className={`book-step ${paso === n ? "is-active" : ""} ${paso > n ? "is-done" : ""}`}>
                <span className="book-step__circle">{paso > n ? <Icons.Check size={12} stroke={3}/> : n}</span>
                <span className="book-step__label">{l}</span>
              </div>
            );
          })}
        </div>

        <div className="book-card">
          {paso === 1 && (
            <>
              <h2 className="book-h2">¿Qué tipo de cita necesitas?</h2>
              <p className="muted" style={{marginTop: 4, fontSize: 14}}>Selecciona el servicio que mejor describa tu motivo de consulta.</p>
              <div className="book-svcs">
                {AGENDA_DATA.SERVICES.map(s => (
                  <button key={s.id} className={`book-svc ${servicio === s.id ? "is-active" : ""}`} onClick={() => setServicio(s.id)}>
                    <span className="book-svc__icon">{s.id === "s4" ? <Icons.Video size={20}/> : <Icons.Pill size={20}/>}</span>
                    <span className="book-svc__name">{s.nombre}</span>
                    <span className="book-svc__meta">
                      <span><Icons.Clock size={12}/> {s.duracion} min</span>
                      <span className="mono">{fmtMxn(s.precio)}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="book-nav">
                <span/>
                <Button disabled={!servicio} iconRight={Icons.ArrowR} onClick={() => setPaso(2)}>Continuar</Button>
              </div>
            </>
          )}

          {paso === 2 && (
            <>
              <h2 className="book-h2">Elige una fecha</h2>
              <p className="muted" style={{marginTop: 4, fontSize: 14}}>Solo se muestran los días con disponibilidad.</p>
              <PublicCalendar selected={fecha} onSelect={setFecha}/>
              <div className="book-nav">
                <Button variant="ghost" icon={Icons.ArrowL} onClick={() => setPaso(1)}>Atrás</Button>
                <Button disabled={!fecha} iconRight={Icons.ArrowR} onClick={() => setPaso(3)}>Continuar</Button>
              </div>
            </>
          )}

          {paso === 3 && (
            <>
              <h2 className="book-h2">Horarios disponibles</h2>
              <p className="muted" style={{marginTop: 4, fontSize: 14}}>Miércoles 27 de mayo · 6 horarios libres</p>
              <div className="book-slots">
                {["09:00","09:30","11:30","15:00","16:00","17:30"].map(s => (
                  <button key={s} className={`book-slot ${hora === s ? "is-active" : ""}`} onClick={() => setHora(s)}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="book-nav">
                <Button variant="ghost" icon={Icons.ArrowL} onClick={() => setPaso(2)}>Atrás</Button>
                <Button disabled={!hora} iconRight={Icons.ArrowR} onClick={() => setPaso(4)}>Continuar</Button>
              </div>
            </>
          )}

          {paso === 4 && (
            <>
              <h2 className="book-h2">Tus datos</h2>
              <p className="muted" style={{marginTop: 4, fontSize: 14}}>Solo lo necesario para que el doctor te atienda bien.</p>
              <div className="book-form">
                <Field label="Nombre completo" required><Input placeholder="Como aparece en tu identificación" icon={Icons.User}/></Field>
                <Field label="Teléfono (WhatsApp)" required hint="Te enviaremos confirmación y recordatorios."><Input placeholder="33 1234 5678" icon={Icons.Phone}/></Field>
                <Field label="Email" required><Input type="email" placeholder="tu@correo.com" icon={Icons.Mail}/></Field>
                <Field label="Motivo de consulta (opcional)" className="book-form__full">
                  <Textarea rows={3} placeholder="Describe brevemente cómo te sientes o el motivo de tu visita."/>
                </Field>
              </div>
              <div className="book-summary">
                <div className="book-summary__row"><span>Servicio</span><strong>{getService(servicio).nombre}</strong></div>
                <div className="book-summary__row"><span>Fecha y hora</span><strong>Miércoles 27 may · <span className="mono">{hora}</span></strong></div>
                <div className="book-summary__row book-summary__row--total"><span>Total</span><strong className="mono">{fmtMxn(getService(servicio).precio)}</strong></div>
              </div>
              <div className="stack-3" style={{ marginTop: 16 }}>
                <Checkbox checked={true} onChange={() => {}} label={<>He leído y acepto el <a className="link" href="#">Aviso de Privacidad</a>.</>}/>
                <Checkbox checked={false} onChange={() => {}} label="Acepto recibir recordatorios y mensajes por WhatsApp."/>
              </div>
              <div className="book-nav">
                <Button variant="ghost" icon={Icons.ArrowL} onClick={() => setPaso(3)}>Atrás</Button>
                <Button size="lg" onClick={() => setDone(true)}>Confirmar mi cita</Button>
              </div>
            </>
          )}
        </div>
      </main>
      <footer className="public-foot">
        <span>Consultorio Dr. García López · Powered by AgendaMed</span>
        <span><a className="link" href="#">Aviso de Privacidad</a></span>
      </footer>
    </>
  );
}

function PublicBookHeader() {
  return (
    <header className="book-head">
      <div className="book-head__brand">
        <div className="book-head__logo">GL</div>
        <div>
          <h1 className="book-head__name">Consultorio Dr. García López</h1>
          <p className="book-head__sub muted">Medicina General · <Icons.MapPin size={11} style={{display:"inline",verticalAlign:-1}}/> Av. Chapultepec 234, GDL</p>
        </div>
      </div>
      <span className="book-head__powered muted">
        powered by <strong style={{color:"var(--c-text)"}}>AgendaMed</strong>
      </span>
    </header>
  );
}

function PublicCalendar({ selected, onSelect }) {
  const DOW = ["L","M","M","J","V","S","D"];
  const padBefore = 4;
  const monthDays = Array.from({length:31}, (_,i)=>i+1);
  return (
    <div className="book-cal">
      <div className="book-cal__head">
        <button className="iconbtn"><Icons.ChevronL size={16}/></button>
        <h3>Mayo 2026</h3>
        <button className="iconbtn"><Icons.ChevronR size={16}/></button>
      </div>
      <div className="book-cal__dow">{DOW.map((d,i) => <span key={i}>{d}</span>)}</div>
      <div className="book-cal__grid">
        {Array.from({length:padBefore}).map((_,i)=><span key={"p"+i}/>)}
        {monthDays.map(d => {
          const dow = (d + 4) % 7;
          const weekend = dow === 0 || dow === 6;
          const past = d < 27;
          const closed = weekend;
          const disabled = past || closed;
          return (
            <button key={d} disabled={disabled} className={`book-cal__day ${disabled ? "is-disabled" : ""} ${selected === d ? "is-active" : ""}`} onClick={() => onSelect(d)}>{d}</button>
          );
        })}
      </div>
      <div className="book-cal__legend muted">
        <span><span className="book-cal__legdot"/> Disponible</span>
        <span><span className="book-cal__legdot book-cal__legdot--off"/> Cerrado o pasado</span>
      </div>
    </div>
  );
}

// ============================================================
// Página pública — cancelar cita
// ============================================================
function PublicCancelScreen({ nav }) {
  const [cancelled, setCancelled] = useState(false);
  return (
    <>
      <PublicBookHeader/>
      <main className="book-wrap">
        <div className="book-card book-card--narrow">
          {!cancelled ? (
            <>
              <h2 className="book-h2">¿Quieres cancelar tu cita?</h2>
              <p className="muted" style={{marginTop: 4, fontSize: 14}}>Aún estás dentro del plazo para cancelar sin costo (3 horas antes).</p>
              <div className="book-summary book-summary--center" style={{ marginTop: 18 }}>
                <div className="book-summary__row"><span>Paciente</span><strong>Carlos Mendoza Herrera</strong></div>
                <div className="book-summary__row"><span>Servicio</span><strong>Primera vez</strong></div>
                <div className="book-summary__row"><span>Fecha</span><strong>Martes 26 de mayo, 2026</strong></div>
                <div className="book-summary__row"><span>Hora</span><strong className="mono">16:00</strong></div>
                <div className="book-summary__row"><span>Dirección</span><strong>Av. Chapultepec 234, GDL</strong></div>
              </div>
              <Field label="Motivo (opcional)" hint="Nos ayuda a mejorar — pero no es obligatorio." style={{marginTop: 18}}>
                <Textarea rows={3} placeholder="Ej: surgió un imprevisto"/>
              </Field>
              <div className="book-cancel-actions">
                <Button variant="danger" size="lg" className="btn--full" onClick={() => setCancelled(true)}>Sí, cancelar mi cita</Button>
                <Button variant="secondary" size="lg" className="btn--full" onClick={() => nav("publico-agendar")}>No, mantener cita</Button>
              </div>
              <div className="alert alert--info" style={{ marginTop: 18 }}>
                <Icons.Info size={16}/>
                <div className="alert__body">¿Necesitas reagendar en vez de cancelar? Cancela aquí y agenda una nueva en cualquier momento desde la página del consultorio.</div>
              </div>
            </>
          ) : (
            <div className="book-done">
              <div className="book-done__icon book-done__icon--ok"><Icons.Check size={36} stroke={3}/></div>
              <h1 className="book-done__title">Tu cita fue cancelada</h1>
              <p className="muted" style={{ fontSize: 15 }}>Esperamos verte pronto. Enviamos confirmación a tu WhatsApp.</p>
              <Button onClick={() => nav("publico-agendar")} style={{marginTop: 16}}>Agendar una nueva cita</Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ============================================================
// Estados vacíos
// ============================================================
function EmptyStatesScreen({ nav }) {
  const samples = [
    {
      key: "pacientes",
      title: "Tu primer paciente",
      label: "Lista de pacientes vacía",
      icon: <SvgEmpty kind="patients"/>,
      desc: "Cuando agregues un paciente, aparecerá aquí con su historial, citas y recetas.",
      cta: "Agregar paciente",
    },
    {
      key: "agenda",
      title: "No tienes citas para hoy",
      label: "Agenda sin citas",
      icon: <SvgEmpty kind="calendar"/>,
      desc: "Disfruta el respiro o agenda una cita ahora — tu jornada está libre hasta mañana.",
      cta: "+ Nueva cita",
    },
    {
      key: "recetas",
      title: "Sin recetas generadas",
      label: "Sin recetas",
      icon: <SvgEmpty kind="rx"/>,
      desc: "Las recetas que generes aquí quedarán guardadas y podrás reenviarlas cuando quieras.",
      cta: "Crear primera receta",
    },
    {
      key: "search",
      title: "Sin resultados",
      label: "Búsqueda sin resultados",
      icon: <SvgEmpty kind="search"/>,
      desc: "No encontramos citas que coincidan con 'antibiotic'. Prueba con otras palabras clave o quita los filtros.",
      cta: "Limpiar filtros",
    },
    {
      key: "dashboard",
      title: "Bienvenido a tu primer día",
      label: "Dashboard sin datos",
      icon: <SvgEmpty kind="dashboard"/>,
      desc: "Aquí verás métricas, alertas y cumpleaños conforme uses AgendaMed. Por ahora, agenda tu primera cita.",
      cta: "Empezar tour",
    },
  ];

  return (
    <div className="stack-6">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Referencia</span>
          <h1 className="page__title">Estados vacíos</h1>
          <p className="page__sub">Cómo se ven las pantallas cuando aún no hay datos.</p>
        </div>
      </header>
      <div className="empty-grid">
        {samples.map(s => (
          <Card key={s.key} className="empty-sample">
            <div className="empty-sample__label muted">{s.label}</div>
            <div className="empty-sample__inner">
              <div className="empty-sample__art">{s.icon}</div>
              <h3 className="empty-sample__title">{s.title}</h3>
              <p className="empty-sample__desc muted">{s.desc}</p>
              <Button variant="secondary" size="sm" icon={Icons.Plus}>{s.cta}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SvgEmpty({ kind }) {
  if (kind === "patients") {
    return (
      <svg viewBox="0 0 160 100" width="160" height="100">
        <rect x="10" y="14" width="140" height="72" rx="8" fill="var(--c-brand-softer)" stroke="var(--c-brand-border)"/>
        <circle cx="38" cy="50" r="14" fill="var(--c-brand-soft)" stroke="var(--c-brand-border)"/>
        <circle cx="38" cy="45" r="5" fill="var(--c-brand-border)"/>
        <path d="M28 60 q10 -10 20 0" stroke="var(--c-brand-border)" fill="none" strokeWidth="2"/>
        <rect x="62" y="40" width="68" height="6" rx="3" fill="var(--c-brand-border)"/>
        <rect x="62" y="52" width="40" height="4" rx="2" fill="var(--c-border-strong)"/>
        <line x1="10" y1="74" x2="150" y2="74" stroke="var(--c-border)"/>
      </svg>
    );
  }
  if (kind === "calendar") {
    return (
      <svg viewBox="0 0 160 100" width="160" height="100">
        <rect x="20" y="20" width="120" height="64" rx="6" fill="var(--c-brand-softer)" stroke="var(--c-brand-border)"/>
        <rect x="20" y="20" width="120" height="14" rx="6" fill="var(--c-brand)" opacity="0.6"/>
        {[0,1,2,3,4].map(c => [0,1,2].map(r => (
          <circle key={`${r}-${c}`} cx={32 + c * 24} cy={48 + r * 12} r="2.5" fill="var(--c-brand-border)"/>
        )))}
      </svg>
    );
  }
  if (kind === "rx") {
    return (
      <svg viewBox="0 0 160 100" width="160" height="100">
        <rect x="32" y="14" width="96" height="74" rx="6" fill="white" stroke="var(--c-brand-border)"/>
        <text x="42" y="32" fontSize="12" fontFamily="serif" fill="var(--c-brand-fg)" fontWeight="700">℞</text>
        <rect x="58" y="22" width="60" height="4" rx="2" fill="var(--c-border-strong)"/>
        <rect x="42" y="42" width="76" height="3" rx="1.5" fill="var(--c-border)"/>
        <rect x="42" y="50" width="60" height="3" rx="1.5" fill="var(--c-border)"/>
        <rect x="42" y="58" width="70" height="3" rx="1.5" fill="var(--c-border)"/>
        <rect x="60" y="72" width="40" height="2" rx="1" fill="var(--c-border-strong)"/>
      </svg>
    );
  }
  if (kind === "search") {
    return (
      <svg viewBox="0 0 160 100" width="160" height="100" stroke="var(--c-brand-fg)" fill="none" strokeWidth="3">
        <circle cx="64" cy="48" r="22" fill="var(--c-brand-softer)"/>
        <line x1="82" y1="66" x2="98" y2="82" strokeLinecap="round"/>
        <line x1="56" y1="40" x2="72" y2="56" strokeLinecap="round"/>
        <line x1="72" y1="40" x2="56" y2="56" strokeLinecap="round"/>
      </svg>
    );
  }
  // dashboard
  return (
    <svg viewBox="0 0 160 100" width="160" height="100">
      <rect x="10" y="14" width="42" height="30" rx="4" fill="var(--c-brand-softer)" stroke="var(--c-brand-border)"/>
      <rect x="58" y="14" width="42" height="30" rx="4" fill="var(--c-brand-softer)" stroke="var(--c-brand-border)"/>
      <rect x="106" y="14" width="42" height="30" rx="4" fill="var(--c-brand-softer)" stroke="var(--c-brand-border)"/>
      <rect x="10" y="50" width="138" height="38" rx="4" fill="var(--c-brand-softer)" stroke="var(--c-brand-border)"/>
      <path d="M16 80 L40 70 L60 74 L80 64 L110 70 L142 60" stroke="var(--c-brand)" strokeWidth="2" fill="none"/>
    </svg>
  );
}

// ============================================================
// Feedback (toasts, modales, banners, badges)
// ============================================================
function FeedbackScreen({ nav }) {
  const toast = useToast();
  const [m1, setM1] = useState(false);
  const [m2, setM2] = useState(false);

  return (
    <div className="stack-6">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Referencia</span>
          <h1 className="page__title">Notificaciones, modales y banners</h1>
          <p className="page__sub">Componentes de feedback del sistema. Haz click para probarlos.</p>
        </div>
      </header>

      <div className="grid-3">
        <Card className="fb-card">
          <CardHead title="Toasts" subtitle="Aparecen en la esquina superior derecha por 3 segundos."/>
          <div className="stack-3">
            <Button variant="success" icon={Icons.Check} onClick={() => toast({tone:"success", title:"Cita agendada", message:"María González · 26 may, 11:00"})}>Toast éxito</Button>
            <Button variant="danger" icon={Icons.X} onClick={() => toast({tone:"error", title:"No se pudo enviar", message:"Revisa el número de WhatsApp del paciente."})}>Toast error</Button>
            <Button variant="secondary" icon={Icons.AlertT} onClick={() => toast({tone:"warning", title:"Tu prueba vence en 3 días", message:"Elige un plan para no perder tus datos."})}>Toast advertencia</Button>
            <Button variant="tonal" icon={Icons.Info} onClick={() => toast({tone:"info", title:"Recordatorios enviados", message:"6 mensajes salieron correctamente."})}>Toast info</Button>
          </div>
        </Card>

        <Card className="fb-card">
          <CardHead title="Modales" subtitle="Para confirmaciones y decisiones importantes."/>
          <div className="stack-3">
            <Button variant="secondary" onClick={() => setM1(true)}>Confirmar cancelación de cita</Button>
            <Button variant="danger" onClick={() => setM2(true)}>Eliminar paciente</Button>
          </div>
        </Card>

        <Card className="fb-card fb-card-wide">
          <CardHead title="Banners" subtitle="Mensajes persistentes en la parte superior."/>
          <div className="stack-3">
            <div className="alert alert--warn"><Icons.AlertT size={16}/><div className="alert__body"><strong>Tu prueba vence en 3 días.</strong> Elige un plan para no perder acceso.</div><button className="linkish">Ver planes →</button></div>
            <div className="alert alert--danger"><Icons.AlertC size={16}/><div className="alert__body"><strong>Plan suspendido.</strong> Realiza tu pago para reactivar el consultorio.</div><button className="linkish">Pagar →</button></div>
            <div className="alert alert--success"><Icons.Check size={16}/><div className="alert__body"><strong>Cuenta activada.</strong> Bienvenido al Plan Pro.</div></div>
          </div>
        </Card>

        <Card className="fb-card">
          <CardHead title="Badges de estado de cita"/>
          <div className="row" style={{gap: 8, flexWrap: "wrap"}}>
            <StatusBadge status="pendiente"/>
            <StatusBadge status="confirmada"/>
            <StatusBadge status="completada"/>
            <StatusBadge status="cancelada"/>
            <StatusBadge status="noshow"/>
          </div>
          <hr className="hr"/>
          <CardHead title="Badges de plan / alerta"/>
          <div className="row" style={{gap: 8, flexWrap: "wrap"}}>
            <Badge tone="brand">Pro</Badge>
            <Badge tone="neutral">Base</Badge>
            <Badge tone="warning">En prueba</Badge>
            <Badge tone="danger">Suspendido</Badge>
            <Badge tone="warning" icon={Icons.Cake}>Cumpleaños hoy</Badge>
            <Badge tone="info" icon={Icons.Video}>Teleconsulta</Badge>
            <Badge tone="info" icon={Icons.Repeat}>Recurrente</Badge>
            <Badge tone="danger" icon={Icons.AlertT}>2 no-shows</Badge>
          </div>
        </Card>

        <Card className="fb-card">
          <CardHead title="Skeleton loader" subtitle="Mientras carga la agenda."/>
          <div className="stack-2">
            <div className="skel" style={{height: 18, width: "60%"}}/>
            <div className="skel" style={{height: 12, width: "40%"}}/>
            <div className="skel" style={{height: 60, marginTop: 8}}/>
            <div className="skel" style={{height: 60}}/>
            <div className="skel" style={{height: 60}}/>
          </div>
        </Card>

        <Card className="fb-card">
          <CardHead title="Empty state" subtitle="Cuando aún no hay datos."/>
          <EmptyState title="Sin citas hoy" message="Disfruta el respiro o agenda una." action={<Button size="sm" icon={Icons.Plus}>Nueva cita</Button>}/>
        </Card>
      </div>

      <Modal open={m1} onClose={() => setM1(false)} title="¿Cancelar esta cita?"
        footer={<>
          <Button variant="ghost" onClick={() => setM1(false)}>No, mantener</Button>
          <Button variant="danger" onClick={() => { setM1(false); toast({tone:"warning", title:"Cita cancelada"}); }}>Sí, cancelar</Button>
        </>}>
        <p>Vas a cancelar la cita de <strong>María González Ruiz</strong> del 26 de mayo a las 11:00. El paciente será notificado por WhatsApp.</p>
      </Modal>

      <Modal open={m2} onClose={() => setM2(false)} title="¿Eliminar paciente permanentemente?"
        footer={<>
          <Button variant="ghost" onClick={() => setM2(false)}>Cancelar</Button>
          <Button variant="danger" icon={Icons.Trash} onClick={() => { setM2(false); toast({tone:"error", title:"Paciente eliminado"}); }}>Sí, eliminar</Button>
        </>}>
        <p style={{marginBottom: 12}}>Esta acción <strong>no se puede deshacer</strong>. Se eliminarán también:</p>
        <ul style={{listStyle: "disc", paddingLeft: 20, fontSize: 14, color: "var(--c-text-muted)"}}>
          <li>14 citas en el historial</li>
          <li>8 recetas generadas</li>
          <li>Las notas clínicas asociadas</li>
        </ul>
        <div style={{marginTop: 14}}>
          <Field label={<>Escribe <strong>ELIMINAR</strong> para confirmar</>}>
            <Input placeholder="ELIMINAR"/>
          </Field>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, { PublicBookScreen, PublicCancelScreen, EmptyStatesScreen, FeedbackScreen });
