/* eslint-disable */
// AgendaMed — Billing screens (planes públicos, expiración, instrucciones de pago)

// ============================================================
// Página pública de planes
// ============================================================
function PlansScreen({ nav }) {
  return (
    <>
      <header className="public-head">
        <Logo/>
        <div className="public-head__nav">
          <a href="#" className="link" onClick={(e) => {e.preventDefault(); nav("login");}}>Iniciar sesión</a>
          <Button size="sm" onClick={() => nav("register")}>Empezar gratis</Button>
        </div>
      </header>
      <main className="plans-wrap">
        <div className="plans-hero">
          <span className="page__eyebrow">Planes y precios</span>
          <h1 className="plans-title">El sistema que tu consultorio necesitaba</h1>
          <p className="plans-sub">Olvídate de la agenda en WhatsApp. Empieza con 14 días gratis — sin tarjeta de crédito.</p>
          <div className="plans-bill">
            <button className="plans-bill__btn is-active">Mensual</button>
            <button className="plans-bill__btn">Anual <Badge tone="success" size="sm">Ahorra 20%</Badge></button>
          </div>
        </div>

        <div className="plans-grid">
          {/* Base */}
          <article className="plan">
            <header className="plan__head">
              <h2 className="plan__name">Plan Base</h2>
              <p className="plan__desc">Para consultorios individuales que empiezan a profesionalizarse.</p>
            </header>
            <div className="plan__price">
              <span className="plan__amt mono">$1,500</span>
              <span className="plan__cur">MXN</span>
              <span className="plan__per">/mes</span>
            </div>
            <ul className="plan__feat">
              <li><Icons.Check size={14}/> Hasta <strong>200 pacientes</strong> activos</li>
              <li><Icons.Check size={14}/> Citas ilimitadas</li>
              <li><Icons.Check size={14}/> Agenda en 3 vistas (día / semana / mes)</li>
              <li><Icons.Check size={14}/> Recordatorios automáticos por WhatsApp</li>
              <li><Icons.Check size={14}/> Generador de recetas en PDF</li>
              <li><Icons.Check size={14}/> Página pública para agendar</li>
              <li><Icons.Check size={14}/> Felicitaciones de cumpleaños</li>
              <li><Icons.Check size={14}/> Soporte por email</li>
            </ul>
            <Button variant="secondary" size="lg" className="btn--full" onClick={() => nav("register")}>Empezar 14 días gratis</Button>
          </article>

          {/* Pro */}
          <article className="plan plan--featured">
            <div className="plan__ribbon">Más popular</div>
            <header className="plan__head">
              <h2 className="plan__name">Plan Pro</h2>
              <p className="plan__desc">Para consultorios consolidados que quieren crecer sin caos.</p>
            </header>
            <div className="plan__price">
              <span className="plan__amt mono">$2,500</span>
              <span className="plan__cur">MXN</span>
              <span className="plan__per">/mes</span>
            </div>
            <ul className="plan__feat">
              <li><Icons.Check size={14}/> Hasta <strong>500 pacientes</strong> activos</li>
              <li><Icons.Check size={14}/> Todo lo del Plan Base, más:</li>
              <li><Icons.Check size={14}/> <strong>Teleconsultas integradas con Zoom</strong></li>
              <li><Icons.Check size={14}/> Recordatorios con autocancelación</li>
              <li><Icons.Check size={14}/> Plantillas de receta ilimitadas</li>
              <li><Icons.Check size={14}/> Métricas y reportes mensuales</li>
              <li><Icons.Check size={14}/> Exportación de datos (CSV/JSON)</li>
              <li><Icons.Check size={14}/> Soporte prioritario por WhatsApp</li>
            </ul>
            <Button variant="primary" size="lg" className="btn--full" onClick={() => nav("register")}>Empezar 14 días gratis</Button>
          </article>
        </div>

        <footer className="plans-foot">
          <div className="plans-foot__guarantee">
            <Icons.Lock size={16}/>
            <div>
              <strong>Sin tarjeta de crédito</strong>
              <p className="muted" style={{ fontSize: 12.5 }}>Empieza tu prueba en menos de 2 minutos. Cancela cuando quieras.</p>
            </div>
          </div>
          <div className="plans-foot__guarantee">
            <Icons.Phone size={16}/>
            <div>
              <strong>Soporte en español</strong>
              <p className="muted" style={{ fontSize: 12.5 }}>Equipo en México, atención de lunes a sábado.</p>
            </div>
          </div>
          <div className="plans-foot__guarantee">
            <Icons.Building size={16}/>
            <div>
              <strong>Empresas y clínicas</strong>
              <p className="muted" style={{ fontSize: 12.5 }}>¿Más de 500 pacientes? <a href="#" className="link">Hablemos</a>.</p>
            </div>
          </div>
        </footer>

        <section className="plans-faq">
          <h3>Preguntas frecuentes</h3>
          <div className="plans-faq__grid">
            <div className="faq-item">
              <h4>¿Cómo funciona la prueba gratuita?</h4>
              <p>Recibes acceso completo al Plan Pro por 14 días. Al terminar, eliges Base o Pro. No te cobramos automáticamente.</p>
            </div>
            <div className="faq-item">
              <h4>¿Acepto pacientes nuevos en la prueba?</h4>
              <p>Sí. Puedes invitar pacientes, agendar citas, enviar recetas y todo lo demás. Tus datos quedan guardados al pasar a plan pagado.</p>
            </div>
            <div className="faq-item">
              <h4>¿Cómo pago?</h4>
              <p>Por transferencia bancaria. Te enviaremos los datos y activaremos tu cuenta en menos de 2 horas en días hábiles.</p>
            </div>
            <div className="faq-item">
              <h4>¿Las recetas tienen validez oficial?</h4>
              <p>Son documentos de apoyo profesionales con tus datos y firma digitalizada. Sirven como respaldo, no sustituyen receta oficial.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="public-foot">
        <span>© 2026 AgendaMed · Hecho en México</span>
        <span><a className="link" href="#">Términos</a> · <a className="link" href="#">Privacidad</a></span>
      </footer>
    </>
  );
}

// ============================================================
// Plan expirado (in-app blocking screen)
// ============================================================
function ExpiredScreen({ nav }) {
  return (
    <div className="expired">
      <div className="expired__icon"><Icons.Clock size={36}/></div>
      <h1 className="expired__title">Tu prueba ha terminado</h1>
      <p className="expired__sub">Pero tranquilo — <strong>tus 234 pacientes y todas tus citas están guardados y seguros</strong>. Elige un plan para reanudar tu acceso.</p>

      <div className="expired__grid">
        <article className="plan">
          <header className="plan__head">
            <h2 className="plan__name">Plan Base</h2>
            <p className="plan__desc">Hasta 200 pacientes activos.</p>
          </header>
          <div className="plan__price">
            <span className="plan__amt mono">$1,500</span>
            <span className="plan__cur">MXN</span>
            <span className="plan__per">/mes</span>
          </div>
          <ul className="plan__feat">
            <li><Icons.Check size={14}/> Agenda + WhatsApp + recetas</li>
            <li><Icons.Check size={14}/> Página pública para agendar</li>
            <li><Icons.AlertC size={14} style={{color: "var(--c-text-faint)"}}/> <span className="muted">Sin teleconsultas</span></li>
          </ul>
          <Button variant="secondary" size="lg" className="btn--full" onClick={() => nav("pago")}>Elegir Base</Button>
          <p className="muted" style={{fontSize: 11.5, textAlign: "center", marginTop: 8}}>Si superas 200 pacientes, te avisaremos.</p>
        </article>

        <article className="plan plan--featured">
          <div className="plan__ribbon">Tu plan recomendado</div>
          <header className="plan__head">
            <h2 className="plan__name">Plan Pro</h2>
            <p className="plan__desc">Hasta 500 pacientes activos.</p>
          </header>
          <div className="plan__price">
            <span className="plan__amt mono">$2,500</span>
            <span className="plan__cur">MXN</span>
            <span className="plan__per">/mes</span>
          </div>
          <ul className="plan__feat">
            <li><Icons.Check size={14}/> Todo lo del Plan Base, más:</li>
            <li><Icons.Check size={14}/> Teleconsultas con Zoom</li>
            <li><Icons.Check size={14}/> Soporte prioritario por WhatsApp</li>
          </ul>
          <Button variant="primary" size="lg" className="btn--full" onClick={() => nav("pago")}>Elegir Pro</Button>
        </article>
      </div>

      <div className="expired__help">
        <Icons.Phone size={14}/>
        <span>¿Tienes dudas o quieres una factura? <a className="link" href="#">Escríbenos por WhatsApp →</a></span>
      </div>
    </div>
  );
}

// ============================================================
// Instrucciones de pago
// ============================================================
function PaymentScreen({ nav }) {
  const [showForm, setShowForm] = useState(false);
  const toast = useToast();

  return (
    <>
      <header className="public-head">
        <Logo/>
        <Button variant="ghost" icon={Icons.ArrowL} onClick={() => nav("expirado")}>Volver</Button>
      </header>
      <main className="pay-wrap">
        <div className="pay-card">
          <Badge tone="brand" icon={Icons.Check}>Plan Base seleccionado</Badge>
          <h1 className="pay-title">¡Listo! Solo faltan 3 pasos</h1>
          <p className="muted" style={{ fontSize: 15, marginTop: 8 }}>Tu cuenta se activa cuando recibamos tu transferencia. En días hábiles tardamos menos de 2 horas.</p>

          <div className="pay-steps">
            <div className="pay-step">
              <div className="pay-step__num mono">1</div>
              <div>
                <h3>Realiza la transferencia</h3>
                <p className="muted">Por la cantidad exacta del plan que elegiste:</p>
                <div className="pay-bank">
                  <div className="pay-bank__amt mono">$1,500 MXN</div>
                  <div className="pay-bank__details">
                    <div className="pay-bank__row"><span>Banco</span><strong>BBVA México</strong></div>
                    <div className="pay-bank__row"><span>Titular</span><strong>AgendaMed S.A. de C.V.</strong></div>
                    <div className="pay-bank__row"><span>CLABE</span><strong className="mono">012 320 04567891 23 45</strong></div>
                    <div className="pay-bank__row"><span>Concepto</span><strong className="mono">AM-2026-{`{ID-CONSULTORIO}`}</strong></div>
                  </div>
                  <button className="pay-bank__copy"><Icons.FileText size={14}/> Copiar datos bancarios</button>
                </div>
              </div>
            </div>

            <div className="pay-step">
              <div className="pay-step__num mono">2</div>
              <div>
                <h3>Envíanos tu comprobante</h3>
                <p className="muted">Por email o WhatsApp con tu nombre de consultorio:</p>
                <div className="pay-channels">
                  <a href="#" className="pay-channel"><Icons.WhatsApp size={20}/><div><strong>WhatsApp</strong><span className="muted" style={{fontSize:12}}>33 1234 5678</span></div></a>
                  <a href="#" className="pay-channel"><Icons.Mail size={20}/><div><strong>Email</strong><span className="muted" style={{fontSize:12}}>pagos@agendamed.mx</span></div></a>
                </div>
              </div>
            </div>

            <div className="pay-step">
              <div className="pay-step__num mono">3</div>
              <div>
                <h3>Activamos tu cuenta</h3>
                <p className="muted">En menos de 2 horas en días hábiles. Recibirás un correo de confirmación y todos tus datos volverán a estar disponibles tal como los dejaste.</p>
              </div>
            </div>
          </div>

          <hr className="hr"/>

          {!showForm ? (
            <div className="pay-cb">
              <div>
                <strong>¿Prefieres que te contactemos?</strong>
                <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Te llamamos para resolver dudas y guiarte en el pago.</p>
              </div>
              <Button variant="secondary" onClick={() => setShowForm(true)}>Que me contacten</Button>
            </div>
          ) : (
            <div className="pay-form">
              <h3 style={{ marginBottom: 12 }}>Déjanos tus datos y te contactamos hoy</h3>
              <div className="grid-2">
                <Field label="Tu nombre"><Input placeholder="Dr. Roberto García"/></Field>
                <Field label="Teléfono"><Input placeholder="33 1234 5678" icon={Icons.Phone}/></Field>
              </div>
              <div className="row" style={{ marginTop: 14 }}>
                <Button onClick={() => { setShowForm(false); toast({ tone: "success", title: "Mensaje recibido", message: "Te llamamos en las próximas 2 horas." }); }}>Enviar</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

Object.assign(window, { PlansScreen, ExpiredScreen, PaymentScreen });
