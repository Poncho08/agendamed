/* eslint-disable */
// AgendaMed — Print app: renders ALL 24 screens stacked for PDF export.

const PRINT_SCREENS = [
  { id: "register",        label: "01 · Registro",                Component: () => <RegisterScreen nav={() => {}}/>,        isPublic: true },
  { id: "login",           label: "02 · Login",                   Component: () => <LoginScreen nav={() => {}}/>,           isPublic: true },
  { id: "onboarding",      label: "03 · Onboarding (paso 3 de 6)",Component: () => <OnboardingScreen nav={() => {}}/>,      isPublic: true },
  { id: "dashboard",       label: "04 · Dashboard",               Component: () => <DashboardScreen nav={() => {}}/> },
  { id: "agenda-dia",      label: "05 · Agenda · Día",            Component: () => <AgendaDayScreen nav={() => {}}/> },
  { id: "agenda-semana",   label: "06 · Agenda · Semana",         Component: () => <AgendaWeekScreen nav={() => {}}/> },
  { id: "agenda-mes",      label: "07 · Agenda · Mes",            Component: () => <AgendaMonthScreen nav={() => {}}/> },
  { id: "citas",           label: "08 · Lista de citas",          Component: () => <ApptsListScreen nav={() => {}}/> },
  { id: "detalle-cita",    label: "09 · Detalle de cita",         Component: () => <ApptDetailScreen nav={() => {}}/> },
  { id: "nueva-cita",      label: "10 · Nueva cita",              Component: () => <NewApptScreen nav={() => {}}/> },
  { id: "pacientes",       label: "11 · Pacientes (lista)",       Component: () => <PatientsListScreen nav={() => {}}/> },
  { id: "perfil",          label: "12 · Perfil de paciente",      Component: () => <PatientProfileScreen nav={() => {}}/> },
  { id: "recetas-nueva",   label: "13 · Generador de recetas",    Component: () => <RxNewScreen nav={() => {}}/> },
  { id: "recetas",         label: "14 · Historial de recetas",    Component: () => <RxHistoryScreen nav={() => {}}/> },
  { id: "configuracion",   label: "15 · Configuración",           Component: () => <SettingsScreen nav={() => {}}/> },
  { id: "planes",          label: "16 · Planes (público)",        Component: () => <PlansScreen nav={() => {}}/>,           isPublic: true },
  { id: "expirado",        label: "17 · Plan expirado",           Component: () => <ExpiredScreen nav={() => {}}/> },
  { id: "pago",            label: "18 · Instrucciones de pago",   Component: () => <PaymentScreen nav={() => {}}/>,         isPublic: true },
  { id: "admin",           label: "19 · Panel admin",             Component: () => <AdminScreen nav={() => {}}/> },
  { id: "admin-edit",      label: "20 · Admin · editar consultorio", Component: () => <AdminEditScreen nav={() => {}}/> },
  { id: "publico-agendar", label: "21 · Agendar (público)",       Component: () => <PublicBookScreen nav={() => {}}/>,      isPublic: true },
  { id: "publico-cancelar",label: "22 · Cancelar (público)",      Component: () => <PublicCancelScreen nav={() => {}}/>,    isPublic: true },
  { id: "vacios",          label: "23 · Estados vacíos",          Component: () => <EmptyStatesScreen nav={() => {}}/> },
  { id: "feedback",        label: "24 · Notificaciones & modales",Component: () => <FeedbackScreen nav={() => {}}/> },
];

function PrintCover() {
  return (
    <section className="print-page print-page--cover">
      <div className="cover">
        <div style={{ marginBottom: 18 }}><Logo size={28}/></div>
        <span className="page__eyebrow">Sistema de diseño · v1</span>
        <h1 className="cover__title">AgendaMed</h1>
        <p className="cover__sub">Prototipo de producto · 24 pantallas</p>
        <div className="cover__meta mono">
          <div><span>Cliente</span><strong>AgendaMed S.A. de C.V.</strong></div>
          <div><span>Versión</span><strong>1.0 · Mayo 2026</strong></div>
          <div><span>Pantallas</span><strong>24</strong></div>
          <div><span>Idioma</span><strong>Español (MX)</strong></div>
        </div>
        <ul className="cover__toc">
          {PRINT_SCREENS.map(s => <li key={s.id}>{s.label}</li>)}
        </ul>
        <div className="cover__foot muted">Documento de revisión · No distribuir.</div>
      </div>
    </section>
  );
}

function PrintScreenFrame({ id, label, isPublic, Component }) {
  if (isPublic) {
    return (
      <section className="print-page" id={`p-${id}`}>
        <div className="print-label">{label}</div>
        <div className="public-shell print-frame">
          <Component/>
        </div>
      </section>
    );
  }
  return (
    <section className="print-page" id={`p-${id}`}>
      <div className="print-label">{label}</div>
      <div className="app print-frame">
        <Sidebar active={id} onNav={() => {}} collapsed={false} setCollapsed={() => {}}/>
        <main className="main">
          <Topbar
            title={id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " ")}
            breadcrumb={null}
            onNav={() => {}}
            onOpenReviewMenu={() => {}}
            query=""
            setQuery={() => {}}
          />
          <div className="page">
            <Component/>
          </div>
        </main>
      </div>
    </section>
  );
}

function PrintApp() {
  // Force light theme + cozy density
  React.useEffect(() => {
    document.body.dataset.theme = "light";
    document.body.dataset.density = "cozy";
  }, []);
  return (
    <ToastProvider>
      <PrintCover/>
      {PRINT_SCREENS.map(s => <PrintScreenFrame key={s.id} {...s}/>)}
    </ToastProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PrintApp/>);

// Auto-print after fonts + babel are settled
(function setupPrint() {
  function maybePrint() {
    Promise.resolve(document.fonts ? document.fonts.ready : null).then(() => {
      setTimeout(() => {
        if (location.hash.includes("noprint")) return;
        window.print();
      }, 900);
    });
  }
  if (document.readyState === "complete") maybePrint();
  else window.addEventListener("load", maybePrint);
})();
