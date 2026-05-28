/* eslint-disable */
// AgendaMed — UI primitives & icon set

const { useState, useRef, useEffect, useMemo, useCallback, createContext, useContext } = React;

/* ============================================================
   ICONS — Lucide-style stroked SVGs, 20px viewport.
   ============================================================ */
const Icon = ({ d, size = 18, stroke = 1.6, fill, children, label, ...rest }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill={fill || "none"} stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round"
    aria-hidden={label ? undefined : "true"} aria-label={label}
    role={label ? "img" : undefined}
    {...rest}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

const Icons = {
  Logo:       (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  Dashboard:  (p) => <Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></Icon>,
  Calendar:   (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></Icon>,
  Appts:      (p) => <Icon {...p}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1.4"/><circle cx="4" cy="12" r="1.4"/><circle cx="4" cy="18" r="1.4"/></Icon>,
  Users:      (p) => <Icon {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6"/><circle cx="17" cy="8" r="2.6"/><path d="M16 14c2.8 0 5 2.2 5 5"/></Icon>,
  User:       (p) => <Icon {...p}><circle cx="12" cy="8" r="3.6"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></Icon>,
  Pill:       (p) => <Icon {...p}><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-32 12 12)"/><path d="M9.5 5.5L18 14"/></Icon>,
  Settings:   (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 13.7l1.7 1c.3.2.4.5.3.8l-2 3.5c-.2.3-.5.4-.8.3l-2-.7c-.7.5-1.5.9-2.3 1.2l-.3 2.1c0 .3-.3.6-.7.6h-4c-.4 0-.7-.3-.7-.6l-.3-2.1c-.8-.3-1.6-.7-2.3-1.2l-2 .7c-.3.1-.6 0-.8-.3l-2-3.5c-.2-.3-.1-.6.2-.8l1.7-1a8 8 0 010-3.4l-1.7-1c-.3-.2-.4-.5-.2-.8l2-3.5c.2-.3.5-.4.8-.3l2 .7c.7-.5 1.5-.9 2.3-1.2L9.3 2c0-.3.3-.6.7-.6h4c.4 0 .7.3.7.6l.3 2.1c.8.3 1.6.7 2.3 1.2l2-.7c.3-.1.6 0 .8.3l2 3.5c.2.3.1.6-.2.8l-1.7 1a8 8 0 010 3.4z"/></Icon>,
  Plus:       (p) => <Icon {...p} d="M12 5v14M5 12h14"/>,
  Search:     (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>,
  Bell:       (p) => <Icon {...p}><path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10.5 21a1.5 1.5 0 003 0"/></Icon>,
  Chevron:    (p) => <Icon {...p} d="M6 9l6 6 6-6"/>,
  ChevronR:   (p) => <Icon {...p} d="M9 6l6 6-6 6"/>,
  ChevronL:   (p) => <Icon {...p} d="M15 6l-6 6 6 6"/>,
  Cake:       (p) => <Icon {...p}><path d="M3 21h18M5 21V13a2 2 0 012-2h10a2 2 0 012 2v8"/><path d="M12 11V8M9 4.5c0 .8.6 1.5 1.5 1.5S12 5.3 12 4.5 11.3 3 11.3 3s-2.3.7-2.3 1.5z"/><path d="M3 17h18"/></Icon>,
  Phone:      (p) => <Icon {...p}><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.4 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/></Icon>,
  Mail:       (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></Icon>,
  Video:      (p) => <Icon {...p}><rect x="3" y="6" width="14" height="12" rx="2"/><path d="M17 10l4-2v8l-4-2z"/></Icon>,
  Camera:     (p) => <Icon {...p}><path d="M23 7l-7 5 7 5z"/><rect x="1" y="5" width="15" height="14" rx="2"/></Icon>,
  Refresh:    (p) => <Icon {...p}><path d="M3 12a9 9 0 0115-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-15 6.7L3 16"/><path d="M3 21v-5h5"/></Icon>,
  Check:      (p) => <Icon {...p} d="M5 12l5 5L20 7"/>,
  X:          (p) => <Icon {...p} d="M6 6l12 12M18 6L6 18"/>,
  AlertT:     (p) => <Icon {...p}><path d="M10.3 3.7l-8 14A2 2 0 004 21h16a2 2 0 001.7-3.3l-8-14a2 2 0 00-3.4 0z"/><path d="M12 9v5M12 17h.01"/></Icon>,
  AlertC:     (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></Icon>,
  Info:       (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></Icon>,
  Clock:      (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  MapPin:     (p) => <Icon {...p}><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></Icon>,
  Pencil:     (p) => <Icon {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4z"/></Icon>,
  Trash:      (p) => <Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></Icon>,
  Download:   (p) => <Icon {...p}><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></Icon>,
  WhatsApp:   (p) => <Icon {...p} stroke={0} fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1s-.4-.2-.7.1-.7.9-.9 1.1c-.2.2-.3.2-.6.1a8.4 8.4 0 01-4.1-3.6c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.6L9.3 7c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2c0 1.3.9 2.5 1 2.7s1.9 2.9 4.6 4c1.7.7 2.3.8 3.1.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.4zM12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.3A10 10 0 1012 2z"/></Icon>,
  ArrowL:     (p) => <Icon {...p} d="M19 12H5M12 19l-7-7 7-7"/>,
  ArrowR:     (p) => <Icon {...p} d="M5 12h14M12 5l7 7-7 7"/>,
  Filter:     (p) => <Icon {...p} d="M3 5h18l-7 9v6l-4-2v-4z"/>,
  Repeat:     (p) => <Icon {...p}><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></Icon>,
  Eye:        (p) => <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Icon>,
  Upload:     (p) => <Icon {...p}><path d="M12 21V9M7 14l5-5 5 5M5 3h14"/></Icon>,
  CreditCard: (p) => <Icon {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></Icon>,
  Lock:       (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></Icon>,
  LogOut:     (p) => <Icon {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></Icon>,
  Menu:       (p) => <Icon {...p} d="M3 6h18M3 12h18M3 18h18"/>,
  Dot:        (p) => <Icon {...p}><circle cx="12" cy="12" r="4" fill="currentColor"/></Icon>,
  Star:       (p) => <Icon {...p}><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z"/></Icon>,
  Sun:        (p) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></Icon>,
  Moon:       (p) => <Icon {...p} d="M21 13A9 9 0 1111 3a7 7 0 0010 10z"/>,
  Building:   (p) => <Icon {...p}><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3"/></Icon>,
  FileText:   (p) => <Icon {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></Icon>,
};

/* ============================================================
   Avatar
   ============================================================ */
function Avatar({ name, size = 36, tone }) {
  const text = initials(name);
  const toneHue = useMemo(() => {
    if (tone) return tone;
    // Stable hue from name
    let h = 0; for (let i=0;i<name.length;i++) h = (h*31 + name.charCodeAt(i)) % 360;
    return h;
  }, [name, tone]);
  return (
    <span className="avatar" style={{
      width: size, height: size,
      fontSize: size * 0.38,
      background: `oklch(0.94 0.03 ${toneHue})`,
      color: `oklch(0.38 0.10 ${toneHue})`,
    }}>{text}</span>
  );
}

/* ============================================================
   Button
   ============================================================ */
function Button({ variant = "primary", size = "md", icon: I, iconRight, loading, disabled, children, className = "", as: As = "button", ...rest }) {
  return (
    <As
      className={`btn btn--${variant} btn--${size} ${loading ? "is-loading" : ""} ${className}`}
      disabled={disabled || loading} {...rest}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true"/> : (I ? <I size={size === "sm" ? 14 : 16}/> : null)}
      {children && <span className="btn__label">{children}</span>}
      {iconRight && React.createElement(iconRight, { size: size === "sm" ? 14 : 16 })}
    </As>
  );
}

/* ============================================================
   Badge
   ============================================================ */
function Badge({ tone = "neutral", dot, icon: I, children, size = "md", className = "" }) {
  return (
    <span className={`badge badge--${tone} badge--${size} ${className}`}>
      {dot && <span className="badge__dot" />}
      {I && <I size={11} stroke={2} />}
      {children}
    </span>
  );
}

const STATUS_LABEL = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  noshow: "No-show",
};
function StatusBadge({ status, size = "md" }) {
  return <Badge tone={`status-${status}`} dot size={size}>{STATUS_LABEL[status]}</Badge>;
}

/* ============================================================
   Field / Input / Textarea / Select
   ============================================================ */
function Field({ label, hint, error, required, children, className = "" }) {
  return (
    <label className={`field ${error ? "field--error" : ""} ${className}`}>
      {label && <span className="field__label">{label}{required && <span className="field__req"> *</span>}</span>}
      {children}
      {error ? <span className="field__msg field__msg--error">{error}</span>
       : hint ? <span className="field__msg">{hint}</span> : null}
    </label>
  );
}

const Input = React.forwardRef(({ icon: I, suffix, className = "", ...rest }, ref) => (
  <span className={`input ${I ? "input--with-icon" : ""} ${className}`}>
    {I && <I size={16} className="input__icon"/>}
    <input ref={ref} {...rest} />
    {suffix && <span className="input__suffix">{suffix}</span>}
  </span>
));

function Textarea({ rows = 4, count, max, value, onChange, ...rest }) {
  return (
    <div className="textarea-wrap">
      <textarea rows={rows} value={value} onChange={onChange} maxLength={max} {...rest} />
      {(count || max) && <span className="textarea__count">{(value || "").length}{max ? ` / ${max}` : ""}</span>}
    </div>
  );
}

function Select({ children, ...rest }) {
  return (
    <span className="select">
      <select {...rest}>{children}</select>
      <Icons.Chevron size={16} className="select__caret"/>
    </span>
  );
}

function Toggle({ checked, onChange, label, id }) {
  return (
    <label className="toggle" htmlFor={id}>
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__track" aria-hidden="true"><span className="toggle__thumb"/></span>
      {label && <span className="toggle__label">{label}</span>}
    </label>
  );
}

function Checkbox({ checked, onChange, label, indeterminate, id }) {
  const ref = useRef();
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <label className="check">
      <input ref={ref} type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="check__box" aria-hidden="true"><Icons.Check size={12} stroke={3}/></span>
      {label && <span className="check__label">{label}</span>}
    </label>
  );
}

function Radio({ name, value, checked, onChange, label }) {
  return (
    <label className="radio">
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} />
      <span className="radio__dot" aria-hidden="true"/>
      {label && <span className="radio__label">{label}</span>}
    </label>
  );
}

/* ============================================================
   Card / Section
   ============================================================ */
function Card({ children, className = "", padding = "md", ...rest }) {
  return <section className={`card card--p-${padding} ${className}`} {...rest}>{children}</section>;
}
function CardHead({ title, subtitle, actions, eyebrow }) {
  return (
    <header className="card__head">
      <div className="card__title-wrap">
        {eyebrow && <span className="card__eyebrow">{eyebrow}</span>}
        <h3 className="card__title">{title}</h3>
        {subtitle && <p className="card__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="card__actions">{actions}</div>}
    </header>
  );
}

/* ============================================================
   Modal / Toast
   ============================================================ */
function Modal({ open, onClose, title, children, footer, width = 480 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-overlay" onClick={onClose}/>
      <div className="modal" style={{ width }}>
        {title && (
          <header className="modal__head">
            <h2 className="modal__title">{title}</h2>
            <button className="iconbtn" onClick={onClose} aria-label="Cerrar"><Icons.X size={16}/></button>
          </header>
        )}
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>
  );
}

const ToastCtx = createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((ts) => [...ts, { id, ...t }]);
    setTimeout(() => setToasts((ts) => ts.filter(x => x.id !== id)), t.duration || 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone || "success"}`}>
            <span className="toast__icon">{
              t.tone === "error" ? <Icons.AlertC size={16}/> :
              t.tone === "warning" ? <Icons.AlertT size={16}/> :
              t.tone === "info" ? <Icons.Info size={16}/> :
              <Icons.Check size={16} stroke={2.4}/>
            }</span>
            <div className="toast__body">
              {t.title && <div className="toast__title">{t.title}</div>}
              {t.message && <div className="toast__msg">{t.message}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);

/* ============================================================
   Empty State
   ============================================================ */
function EmptyState({ icon: I = Icons.FileText, title, message, action, illustration }) {
  return (
    <div className="empty">
      <div className="empty__art">
        {illustration || (
          <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true">
            <rect x="10" y="20" width="100" height="60" rx="8" fill="var(--c-brand-softer)" stroke="var(--c-brand-border)"/>
            <rect x="22" y="32" width="56" height="6" rx="3" fill="var(--c-brand-border)"/>
            <rect x="22" y="44" width="40" height="4" rx="2" fill="var(--c-border-strong)"/>
            <rect x="22" y="54" width="76" height="4" rx="2" fill="var(--c-border)"/>
            <rect x="22" y="62" width="60" height="4" rx="2" fill="var(--c-border)"/>
            <circle cx="92" cy="36" r="8" fill="var(--c-brand)" opacity="0.18"/>
          </svg>
        )}
      </div>
      <h3 className="empty__title">{title}</h3>
      {message && <p className="empty__msg">{message}</p>}
      {action}
    </div>
  );
}

/* ============================================================
   Tabs
   ============================================================ */
function Tabs({ value, onChange, items }) {
  return (
    <div className="tabs" role="tablist">
      {items.map(it => (
        <button
          key={it.value}
          role="tab"
          aria-selected={value === it.value}
          className={`tabs__btn ${value === it.value ? "is-active" : ""}`}
          onClick={() => onChange(it.value)}
        >
          {it.label}
          {it.count != null && <span className="tabs__count">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   Logo (AgendaMed wordmark)
   ============================================================ */
function Logo({ compact, size = 22 }) {
  return (
    <span className="logo">
      <span className="logo__mark" style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" width={size} height={size}>
          <rect x="2" y="2" width="20" height="20" rx="6" fill="var(--c-brand)"/>
          <path d="M7 10l3 4 3-3 4 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <circle cx="17" cy="7" r="1.6" fill="white"/>
        </svg>
      </span>
      {!compact && <span className="logo__name">AgendaMed</span>}
    </span>
  );
}

/* ============================================================
   Kbd
   ============================================================ */
function Kbd({ children }) { return <kbd className="kbd">{children}</kbd>; }

/* ============================================================
   Expose
   ============================================================ */
Object.assign(window, {
  Icon, Icons, Avatar, Button, Badge, StatusBadge, STATUS_LABEL,
  Field, Input, Textarea, Select, Toggle, Checkbox, Radio,
  Card, CardHead, Modal, ToastProvider, useToast,
  EmptyState, Tabs, Logo, Kbd,
});
