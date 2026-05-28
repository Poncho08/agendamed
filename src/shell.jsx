/* eslint-disable */
// AgendaMed — App shell (sidebar + topbar + router)

const NAV = [
  { id: "dashboard",    label: "Dashboard",      icon: Icons.Dashboard },
  { id: "agenda",       label: "Agenda",         icon: Icons.Calendar, children: [
    { id: "agenda-dia",     label: "Día" },
    { id: "agenda-semana",  label: "Semana" },
    { id: "agenda-mes",     label: "Mes" },
  ]},
  { id: "citas",        label: "Citas",          icon: Icons.Appts, badge: 8 },
  { id: "pacientes",    label: "Pacientes",      icon: Icons.Users },
  { id: "recetas",      label: "Recetas",        icon: Icons.Pill },
  { id: "configuracion",label: "Configuración",  icon: Icons.Settings },
];

const SEC = [
  { id: "register",     label: "Registro",       hidden: true },
  { id: "login",        label: "Login",          hidden: true },
  { id: "onboarding",   label: "Onboarding",     hidden: true },
  { id: "nueva-cita",   label: "Nueva cita",     hidden: true },
  { id: "detalle-cita", label: "Detalle de cita",hidden: true },
  { id: "perfil",       label: "Perfil paciente",hidden: true },
  { id: "planes",       label: "Planes (público)",hidden: true },
  { id: "expirado",     label: "Plan expirado",  hidden: true },
  { id: "pago",         label: "Instrucciones de pago", hidden: true },
  { id: "admin",        label: "Admin",          hidden: true },
  { id: "admin-edit",   label: "Admin · editar consultorio", hidden: true },
  { id: "publico-agendar", label: "Página pública — agendar", hidden: true },
  { id: "publico-cancelar", label: "Página pública — cancelar", hidden: true },
  { id: "vacios",       label: "Estados vacíos", hidden: true },
  { id: "feedback",     label: "Notificaciones", hidden: true },
];

// Pantallas agrupadas para el menú "Pantallas" (revisor)
const REVIEW_GROUPS = [
  { label: "Acceso & onboarding", items: [
    { id: "register", label: "01 · Registro" },
    { id: "login", label: "02 · Login" },
    { id: "onboarding", label: "03 · Onboarding" },
  ]},
  { label: "Núcleo del producto", items: [
    { id: "dashboard", label: "04 · Dashboard" },
    { id: "agenda-dia", label: "05 · Agenda diaria" },
    { id: "agenda-semana", label: "06 · Agenda semanal" },
    { id: "agenda-mes", label: "07 · Agenda mensual" },
    { id: "citas", label: "08 · Citas" },
    { id: "detalle-cita", label: "09 · Detalle de cita" },
    { id: "nueva-cita", label: "10 · Nueva cita" },
  ]},
  { label: "Pacientes & recetas", items: [
    { id: "pacientes", label: "11 · Pacientes" },
    { id: "perfil", label: "12 · Perfil de paciente" },
    { id: "recetas-nueva", label: "13 · Generador de recetas" },
    { id: "recetas", label: "14 · Historial de recetas" },
  ]},
  { label: "Configuración & planes", items: [
    { id: "configuracion", label: "15 · Configuración" },
    { id: "planes", label: "16 · Planes (público)" },
    { id: "expirado", label: "17 · Plan expirado" },
    { id: "pago", label: "18 · Instrucciones de pago" },
  ]},
  { label: "Administración", items: [
    { id: "admin", label: "19 · Panel admin" },
    { id: "admin-edit", label: "20 · Admin · editar" },
  ]},
  { label: "Público & estados", items: [
    { id: "publico-agendar", label: "21 · Agendar (público)" },
    { id: "publico-cancelar", label: "22 · Cancelar (público)" },
    { id: "vacios", label: "23 · Estados vacíos" },
    { id: "feedback", label: "24 · Toasts & modales" },
  ]},
];

const PUBLIC_SCREENS = ["register","login","onboarding","planes","publico-agendar","publico-cancelar","pago"];

// ---------------- Sidebar ----------------
function Sidebar({ active, onNav, collapsed, setCollapsed }) {
  const isAgendaActive = ["agenda-dia","agenda-semana","agenda-mes"].includes(active);
  const [agendaOpen, setAgendaOpen] = useState(isAgendaActive);
  useEffect(() => { if (isAgendaActive) setAgendaOpen(true); }, [isAgendaActive]);

  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="sidebar__head">
        <Logo compact={collapsed} />
        <button
          className="iconbtn sidebar__collapse"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <Icons.ChevronR size={16}/> : <Icons.ChevronL size={16}/>}
        </button>
      </div>

      <button className="sidebar__cta" onClick={() => onNav("nueva-cita")}>
        <Icons.Plus size={16} stroke={2.4}/>
        {!collapsed && <span>Nueva cita</span>}
      </button>

      <nav className="sidebar__nav" aria-label="Menú principal">
        {NAV.map(item => {
          const I = item.icon;
          const isActive = item.id === active || (item.children && item.children.some(c => c.id === active));
          if (item.children) {
            return (
              <div key={item.id} className="sidebar__group">
                <button
                  className={`sidebar__link ${isActive ? "is-active" : ""}`}
                  onClick={() => {
                    if (collapsed) { onNav(item.children[0].id); return; }
                    setAgendaOpen(o => !o);
                  }}
                  aria-expanded={agendaOpen}
                >
                  <I size={18}/>
                  {!collapsed && <>
                    <span className="sidebar__label">{item.label}</span>
                    <Icons.Chevron size={14} className={`sidebar__chev ${agendaOpen ? "is-open" : ""}`}/>
                  </>}
                </button>
                {!collapsed && agendaOpen && (
                  <div className="sidebar__sub">
                    {item.children.map(c => (
                      <button
                        key={c.id}
                        className={`sidebar__sublink ${active === c.id ? "is-active" : ""}`}
                        onClick={() => onNav(c.id)}
                      >
                        <span className="sidebar__subdot" />
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <button
              key={item.id}
              className={`sidebar__link ${isActive ? "is-active" : ""}`}
              onClick={() => onNav(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <I size={18}/>
              {!collapsed && <span className="sidebar__label">{item.label}</span>}
              {!collapsed && item.badge != null && <span className="sidebar__badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar__foot">
        {!collapsed && (
          <div className="sidebar__plan">
            <div className="sidebar__plan-head">
              <Badge tone="brand" size="sm">Plan Pro</Badge>
              <span className="faint" style={{fontSize: 11}}>234 / 500 pac.</span>
            </div>
            <div className="sidebar__plan-bar"><span style={{ width: "47%" }}/></div>
            <div className="sidebar__plan-foot">
              <span className="muted" style={{fontSize: 11}}>Renueva 15 jul</span>
              <button className="linkish" onClick={() => onNav("expirado")}>Gestionar</button>
            </div>
          </div>
        )}
        <button
          className={`sidebar__link sidebar__link--user`}
          onClick={() => onNav("configuracion")}
          title={collapsed ? "Cuenta" : undefined}
        >
          <Avatar name="Dr. Roberto García" size={26}/>
          {!collapsed && (
            <span className="sidebar__user">
              <span className="sidebar__user-name">Dr. R. García L.</span>
              <span className="sidebar__user-sub">Medicina general</span>
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

// ---------------- Topbar ----------------
function Topbar({ title, breadcrumb, onNav, onOpenReviewMenu, query, setQuery }) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        {breadcrumb ? (
          <nav className="crumbs" aria-label="Migas">
            {breadcrumb.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Icons.ChevronR size={12} className="crumbs__sep"/>}
                {b.onClick ? (
                  <button onClick={b.onClick} className="crumbs__link">{b.label}</button>
                ) : (
                  <span className={i === breadcrumb.length - 1 ? "crumbs__current" : "crumbs__link"}>{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : (
          <h1 className="topbar__title">{title}</h1>
        )}
      </div>

      <div className="topbar__center">
        <span className="topbar__search">
          <Icons.Search size={14} className="topbar__search-icon"/>
          <input
            placeholder="Buscar paciente, cita, receta…"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
          <Kbd>⌘K</Kbd>
        </span>
      </div>

      <div className="topbar__right">
        <button className="iconbtn" aria-label="Notificaciones" title="Notificaciones">
          <Icons.Bell size={18}/>
          <span className="iconbtn__dot" />
        </button>
        <button className="topbar__date" title="Hoy">
          <Icons.Calendar size={14}/>
          <span>Mar 26 may 2026</span>
        </button>
        <button className="topbar__review" onClick={onOpenReviewMenu}>
          <Icons.Menu size={14}/>
          <span>Pantallas (24)</span>
        </button>
      </div>
    </header>
  );
}

// ---------------- Review Menu (overlay con todas las pantallas) ----------------
function ReviewMenu({ open, onClose, active, onNav }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="review-root" role="dialog" aria-modal="true" aria-label="Pantallas del prototipo">
      <div className="modal-overlay" onClick={onClose}/>
      <div className="review">
        <header className="review__head">
          <div>
            <h2 className="review__title">Las 24 pantallas de AgendaMed</h2>
            <p className="review__subtitle">Atajo de revisión — navega directo a cualquier vista</p>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Cerrar"><Icons.X size={16}/></button>
        </header>
        <div className="review__grid">
          {REVIEW_GROUPS.map(g => (
            <div key={g.label} className="review__group">
              <h3 className="review__group-title">{g.label}</h3>
              <div className="review__list">
                {g.items.map(it => (
                  <button
                    key={it.id}
                    className={`review__item ${active === it.id ? "is-active" : ""}`}
                    onClick={() => { onNav(it.id); onClose(); }}
                  >
                    <span className="review__item-label">{it.label}</span>
                    <Icons.ArrowR size={14}/>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NAV, SEC, REVIEW_GROUPS, PUBLIC_SCREENS, Sidebar, Topbar, ReviewMenu });
