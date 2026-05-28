/* eslint-disable */
// AgendaMed — Auth screens (registro, login, onboarding)

// ============================================================
// Registro
// ============================================================
function RegisterScreen({ nav }) {
  const [tyc, setTyc] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const toast = useToast();

  return (
    <>
      <header className="public-head">
        <Logo/>
        <div className="public-head__nav">
          <span className="muted" style={{fontSize: 13}}>¿Ya tienes cuenta?</span>
          <Button variant="secondary" size="sm" onClick={() => nav("login")}>Iniciar sesión</Button>
        </div>
      </header>
      <div className="auth-banner">
        <Icons.Star size={14}/>
        <span><strong>14 días gratis</strong> · sin tarjeta de crédito · cancela cuando quieras</span>
      </div>
      <main className="auth-wrap">
        <div className="auth-card">
          <h1 className="auth-title">Crea tu consultorio en AgendaMed</h1>
          <p className="auth-sub">Empieza con la prueba gratuita. Configurarás tu consultorio en menos de 5 minutos.</p>
          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); toast({tone:"success", title: "Cuenta creada", message:"Te enviamos un correo de verificación."}); nav("onboarding"); }}>
            <Field label="Nombre del consultorio" required>
              <Input placeholder="Consultorio Dr. García López" icon={Icons.Building}/>
            </Field>
            <Field label="Tu nombre completo" required>
              <Input placeholder="Dr. Roberto García López" icon={Icons.User}/>
            </Field>
            <Field label="Especialidad" required>
              <Select defaultValue="">
                <option value="">Selecciona tu especialidad</option>
                <option>Medicina general</option>
                <option>Pediatría</option>
                <option>Ginecología</option>
                <option>Dermatología</option>
                <option>Cardiología</option>
                <option>Nutrición</option>
                <option>Psicología</option>
                <option>Otra</option>
              </Select>
            </Field>
            <Field label="Email profesional" required hint="Te servirá para iniciar sesión.">
              <Input type="email" placeholder="tu@consultorio.com" icon={Icons.Mail}/>
            </Field>
            <div className="grid-2">
              <Field label="Contraseña" required>
                <Input type="password" placeholder="••••••••" icon={Icons.Lock}/>
              </Field>
              <Field label="Confirmar contraseña" required>
                <Input type="password" placeholder="••••••••" icon={Icons.Lock}/>
              </Field>
            </div>
            <div className="auth-checks">
              <Checkbox checked={tyc} onChange={setTyc} label={<>Acepto los <a href="#" className="link">Términos y Condiciones</a> de AgendaMed.</>}/>
              <Checkbox checked={privacy} onChange={setPrivacy} label={<>Acepto el <a href="#" className="link">Aviso de Privacidad</a> y el tratamiento de mis datos personales.</>}/>
            </div>
            <Button variant="primary" size="lg" className="btn--full" type="submit" disabled={!tyc || !privacy}>Crear cuenta gratis</Button>
          </form>
          <p className="auth-small muted">Al crear tu cuenta, tu prueba de 14 días inicia hoy. No te cobramos hasta que elijas un plan.</p>
        </div>
        <aside className="auth-aside">
          <h3 className="auth-aside__title">Tu consultorio, organizado de verdad</h3>
          <ul className="auth-features">
            <li><Icons.Check size={14}/> Agenda visual con vista día / semana / mes</li>
            <li><Icons.Check size={14}/> Recordatorios automáticos por WhatsApp</li>
            <li><Icons.Check size={14}/> Generador de recetas en PDF</li>
            <li><Icons.Check size={14}/> Teleconsultas con Zoom integrado</li>
            <li><Icons.Check size={14}/> Página pública para que tus pacientes agenden solos</li>
            <li><Icons.Check size={14}/> 100% en español, hecho en México</li>
          </ul>
          <div className="auth-quote">
            <p>"En 3 días dejé de gestionar citas por WhatsApp. Mis pacientes están más contentos y yo gano una hora al día."</p>
            <div className="auth-quote__by">
              <Avatar name="Lucía Mendoza" size={32}/>
              <div>
                <div style={{fontWeight: 500, fontSize: 13}}>Dra. Lucía Mendoza</div>
                <div className="muted" style={{fontSize: 12}}>Ginecología · Puebla</div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}

// ============================================================
// Login
// ============================================================
function LoginScreen({ nav }) {
  const toast = useToast();
  return (
    <>
      <header className="public-head">
        <Logo/>
        <div className="public-head__nav">
          <span className="muted" style={{fontSize: 13}}>¿No tienes cuenta?</span>
          <Button variant="secondary" size="sm" onClick={() => nav("register")}>Crear cuenta</Button>
        </div>
      </header>
      <main className="auth-wrap auth-wrap--center">
        <div className="auth-card auth-card--narrow">
          <h1 className="auth-title">Bienvenido de vuelta</h1>
          <p className="auth-sub">Ingresa para gestionar tu consultorio.</p>
          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); nav("dashboard"); }}>
            <Field label="Email" required>
              <Input type="email" defaultValue="roberto@garcialopez.mx" icon={Icons.Mail} autoFocus/>
            </Field>
            <Field label="Contraseña" required>
              <Input type="password" defaultValue="••••••••" icon={Icons.Lock}/>
            </Field>
            <div className="row split">
              <Checkbox checked={true} onChange={() => {}} label="Mantenerme conectado"/>
              <a href="#" className="link" onClick={(e) => {e.preventDefault(); toast({tone:"info", title:"Te enviamos un correo", message:"Revisa tu bandeja de entrada."});}}>¿Olvidaste tu contraseña?</a>
            </div>
            <Button variant="primary" size="lg" className="btn--full" type="submit">Iniciar sesión</Button>
          </form>
          <p className="auth-small muted">Al iniciar sesión aceptas nuestros <a href="#" className="link">Términos</a> y <a href="#" className="link">Aviso de Privacidad</a>.</p>
        </div>
      </main>
    </>
  );
}

// ============================================================
// Onboarding (6 pasos, paso 3 activo)
// ============================================================
function OnboardingScreen({ nav }) {
  const [services, setServices] = useState([
    { id: 1, nombre: "Consulta general", duracion: 30, precio: 500 },
    { id: 2, nombre: "Primera vez", duracion: 60, precio: 800 },
  ]);
  const [n, setN] = useState("");
  const [d, setD] = useState(30);
  const [p, setP] = useState("");
  const toast = useToast();

  const PASOS = [
    { n: 1, label: "Datos del consultorio", done: true },
    { n: 2, label: "Horarios de atención", done: true },
    { n: 3, label: "Catálogo de servicios", active: true },
    { n: 4, label: "Mensajes y recordatorios" },
    { n: 5, label: "Página pública" },
    { n: 6, label: "Importar pacientes" },
  ];

  return (
    <div className="onb-shell">
      <header className="onb-head">
        <Logo/>
        <div className="onb-progress">
          {PASOS.map((p, i) => (
            <React.Fragment key={p.n}>
              <div className={`onb-step ${p.done ? "is-done" : ""} ${p.active ? "is-active" : ""}`}>
                <span className="onb-step__circle">{p.done ? <Icons.Check size={12} stroke={3}/> : p.n}</span>
                <span className="onb-step__label">{p.label}</span>
              </div>
              {i < PASOS.length - 1 && <div className={`onb-step__bar ${p.done ? "is-done" : ""}`}/>}
            </React.Fragment>
          ))}
        </div>
        <button className="link" onClick={() => nav("dashboard")}>Continuar después →</button>
      </header>

      <main className="onb-body">
        <div className="onb-content">
          <span className="page__eyebrow">Paso 3 de 6</span>
          <h1 className="onb-title">¿Qué servicios ofreces?</h1>
          <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Define tu catálogo. Tus pacientes elegirán uno al agendar, y se reflejarán en tu agenda con su duración correcta.</p>

          <Card style={{ marginTop: 24 }}>
            <CardHead title="Agregar un servicio"/>
            <div className="onb-form">
              <Field label="Nombre del servicio" required className="onb-form__name">
                <Input value={n} onChange={(e) => setN(e.target.value)} placeholder="Ej: Consulta general"/>
              </Field>
              <Field label="Duración" required>
                <Select value={d} onChange={(e) => setD(+e.target.value)}>
                  <option value={15}>15 min</option>
                  <option value={20}>20 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                </Select>
              </Field>
              <Field label="Precio (MXN)" required>
                <Input value={p} onChange={(e) => setP(e.target.value)} placeholder="500" type="number"/>
              </Field>
              <Button variant="primary" icon={Icons.Plus} className="onb-form__add" disabled={!n || !p} onClick={() => {
                setServices(s => [...s, { id: Date.now(), nombre: n, duracion: d, precio: +p }]);
                setN(""); setP("");
              }}>Agregar</Button>
            </div>
          </Card>

          {services.length > 0 && (
            <Card padding="none" style={{ marginTop: 16 }}>
              <CardHead title={`Tus servicios (${services.length})`} subtitle="Puedes eliminarlos en cualquier momento desde Configuración."/>
              <ul className="svc-list">
                {services.map((s, i) => (
                  <li key={s.id} className="svc-list__row">
                    <span className="svc-list__num mono">{String(i+1).padStart(2, "0")}</span>
                    <span className="svc-list__name">{s.nombre}</span>
                    <span className="svc-list__dur">{s.duracion} min</span>
                    <span className="svc-list__price mono">{fmtMxn(s.precio)}</span>
                    <button className="iconbtn" onClick={() => setServices(arr => arr.filter(x => x.id !== s.id))} aria-label="Eliminar"><Icons.Trash size={14}/></button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="onb-nav">
            <Button variant="ghost" icon={Icons.ArrowL}>Anterior</Button>
            <div className="row-tight">
              <Button variant="ghost" onClick={() => toast({tone: "info", title: "Paso omitido", message: "Podrás definirlos después."})}>Saltar este paso</Button>
              <Button variant="primary" iconRight={Icons.ArrowR} onClick={() => toast({tone:"success", title:"Paso completado"})}>Siguiente</Button>
            </div>
          </div>
        </div>

        <aside className="onb-aside">
          <div className="onb-tip">
            <Icons.Info size={16}/>
            <div>
              <strong>¿No sabes qué incluir?</strong>
              <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>La mayoría de los consultorios empiezan con 3-4 servicios: una consulta inicial más larga, una consulta de seguimiento y opcionalmente una teleconsulta.</p>
            </div>
          </div>
          <div className="onb-preview">
            <span className="muted" style={{fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em"}}>Vista previa</span>
            <div className="onb-preview__pat">Así lo verán tus pacientes al agendar:</div>
            <div className="onb-preview__list">
              {services.map(s => (
                <div key={s.id} className="onb-preview__svc">
                  <div style={{ fontWeight: 500 }}>{s.nombre}</div>
                  <div className="muted" style={{fontSize: 12, marginTop: 2}}>{s.duracion} min · {fmtMxn(s.precio)}</div>
                </div>
              ))}
              {services.length === 0 && <div className="muted" style={{fontSize: 13, textAlign: "center", padding: 12}}>Agrega tu primer servicio</div>}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

Object.assign(window, { RegisterScreen, LoginScreen, OnboardingScreen });
