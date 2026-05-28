/* eslint-disable */
// AgendaMed — Main app router

const { useState: useS, useEffect: useE } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "blue",
  "density": "cozy",
  "theme": "light",
  "sidebarCollapsed": false
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  blue:   { hue: 232, label: "Azul confianza" },
  teal:   { hue: 195, label: "Verde clínico" },
  indigo: { hue: 268, label: "Índigo sereno" },
  warm:   { hue: 28,  label: "Coral cálido" },
};

function App() {
  const [screen, setScreen] = useS(loadScreen() || "dashboard");
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [reviewOpen, setReviewOpen] = useS(false);
  const [search, setSearch] = useS("");
  const [collapsed, setCollapsed] = useS(t.sidebarCollapsed ?? false);
  useE(() => { setCollapsed(t.sidebarCollapsed); }, [t.sidebarCollapsed]);

  const nav = (id) => {
    setScreen(id);
    try { sessionStorage.setItem("agendamed:screen", id); } catch(e){}
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Apply tweaks → document
  useE(() => {
    const root = document.body;
    root.dataset.theme = t.theme;
    root.dataset.density = t.density;
    const hue = ACCENT_PRESETS[t.accent]?.hue ?? 232;
    document.documentElement.style.setProperty("--hue-brand", String(hue));
  }, [t.theme, t.density, t.accent]);

  const isPublic = PUBLIC_SCREENS.includes(screen);

  // Render the screen
  const renderScreen = () => {
    switch (screen) {
      case "dashboard": return <DashboardScreen nav={nav}/>;
      case "agenda-dia": return <AgendaDayScreen nav={nav}/>;
      case "agenda-semana": return <AgendaWeekScreen nav={nav}/>;
      case "agenda-mes": return <AgendaMonthScreen nav={nav}/>;
      case "citas": return <ApptsListScreen nav={nav}/>;
      case "detalle-cita": return <ApptDetailScreen nav={nav}/>;
      case "nueva-cita": return <NewApptScreen nav={nav}/>;
      case "pacientes": return <PatientsListScreen nav={nav}/>;
      case "perfil": return <PatientProfileScreen nav={nav}/>;
      case "recetas-nueva": return <RxNewScreen nav={nav}/>;
      case "recetas": return <RxHistoryScreen nav={nav}/>;
      case "configuracion": return <SettingsScreen nav={nav}/>;
      case "register": return <RegisterScreen nav={nav}/>;
      case "login": return <LoginScreen nav={nav}/>;
      case "onboarding": return <OnboardingScreen nav={nav}/>;
      case "planes": return <PlansScreen nav={nav}/>;
      case "expirado": return <ExpiredScreen nav={nav}/>;
      case "pago": return <PaymentScreen nav={nav}/>;
      case "admin": return <AdminScreen nav={nav}/>;
      case "admin-edit": return <AdminEditScreen nav={nav}/>;
      case "publico-agendar": return <PublicBookScreen nav={nav}/>;
      case "publico-cancelar": return <PublicCancelScreen nav={nav}/>;
      case "vacios": return <EmptyStatesScreen nav={nav}/>;
      case "feedback": return <FeedbackScreen nav={nav}/>;
      default: return <DashboardScreen nav={nav}/>;
    }
  };

  // Public screens render without sidebar/topbar
  if (isPublic) {
    return (
      <ToastProvider>
        <div className="public-shell">
          {renderScreen()}
        </div>
        <TweaksControls t={t} setTweak={setTweak} nav={nav}/>
        <ReviewMenu open={reviewOpen} onClose={() => setReviewOpen(false)} active={screen} onNav={nav}/>
        <FloatingReviewBtn onClick={() => setReviewOpen(true)}/>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="app">
        <Sidebar active={screen} onNav={nav} collapsed={collapsed} setCollapsed={(v) => { setCollapsed(v); setTweak("sidebarCollapsed", v); }}/>
        <main className="main">
          <Topbar
            title={screenTitle(screen)}
            breadcrumb={breadcrumbFor(screen, nav)}
            onNav={nav}
            onOpenReviewMenu={() => setReviewOpen(true)}
            query={search} setQuery={setSearch}
          />
          <div className="page">
            {renderScreen()}
          </div>
        </main>
      </div>
      <TweaksControls t={t} setTweak={setTweak} nav={nav}/>
      <ReviewMenu open={reviewOpen} onClose={() => setReviewOpen(false)} active={screen} onNav={nav}/>
    </ToastProvider>
  );
}

function loadScreen() {
  try { return sessionStorage.getItem("agendamed:screen"); } catch(e) { return null; }
}

function screenTitle(s) {
  return {
    dashboard: "Dashboard",
    "agenda-dia": "Agenda · Día",
    "agenda-semana": "Agenda · Semana",
    "agenda-mes": "Agenda · Mes",
    citas: "Citas",
    "detalle-cita": "Detalle de cita",
    "nueva-cita": "Nueva cita",
    pacientes: "Pacientes",
    perfil: "Perfil del paciente",
    "recetas-nueva": "Generador de recetas",
    recetas: "Historial de recetas",
    configuracion: "Configuración",
    admin: "Panel de administración",
    "admin-edit": "Editar consultorio",
    onboarding: "Configuración inicial",
    vacios: "Estados vacíos",
    feedback: "Notificaciones & modales",
    expirado: "Tu prueba ha terminado",
    pago: "Instrucciones de pago",
  }[s] || s;
}

function breadcrumbFor(s, nav) {
  switch (s) {
    case "detalle-cita": return [{ label: "Citas", onClick: () => nav("citas") }, { label: "Cita #A-2026-0247" }];
    case "nueva-cita": return [{ label: "Citas", onClick: () => nav("citas") }, { label: "Nueva cita" }];
    case "perfil": return [{ label: "Pacientes", onClick: () => nav("pacientes") }, { label: "María González Ruiz" }];
    case "recetas-nueva": return [{ label: "Recetas", onClick: () => nav("recetas") }, { label: "Nueva receta" }];
    case "admin-edit": return [{ label: "Admin", onClick: () => nav("admin") }, { label: "Editar consultorio" }];
    default: return null;
  }
}

// ============================================================
// Floating review button (for public screens — gives way to navigate)
// ============================================================
function FloatingReviewBtn({ onClick }) {
  return (
    <button className="floating-review" onClick={onClick}>
      <Icons.Menu size={14}/> Pantallas (24)
    </button>
  );
}

// ============================================================
// Tweaks controls
// ============================================================
function TweaksControls({ t, setTweak, nav }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Color de acento">
        <TweakColor
          label="Acento"
          options={[
            "oklch(0.52 0.13 232)",
            "oklch(0.52 0.13 195)",
            "oklch(0.52 0.13 268)",
            "oklch(0.62 0.14 28)",
          ]}
          value={["oklch(0.52 0.13 232)", "oklch(0.52 0.13 195)", "oklch(0.52 0.13 268)", "oklch(0.62 0.14 28)"][["blue","teal","indigo","warm"].indexOf(t.accent)]}
          onChange={(v) => {
            const idx = ["oklch(0.52 0.13 232)", "oklch(0.52 0.13 195)", "oklch(0.52 0.13 268)", "oklch(0.62 0.14 28)"].indexOf(v);
            setTweak("accent", ["blue","teal","indigo","warm"][idx] || "blue");
          }}
        />
      </TweakSection>
      <TweakSection title="Apariencia">
        <TweakRadio label="Tema" options={[{value:"light", label:"Claro"},{value:"dark", label:"Oscuro"}]} value={t.theme} onChange={(v) => setTweak("theme", v)}/>
        <TweakRadio label="Densidad" options={[{value:"compact", label:"Compacta"},{value:"cozy", label:"Cómoda"},{value:"spacious", label:"Espaciosa"}]} value={t.density} onChange={(v) => setTweak("density", v)}/>
        <TweakToggle label="Sidebar colapsada" value={t.sidebarCollapsed} onChange={(v) => setTweak("sidebarCollapsed", v)}/>
      </TweakSection>
    </TweaksPanel>
  );
}

// ============================================================
// Mount
// ============================================================
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
