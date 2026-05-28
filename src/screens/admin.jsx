/* eslint-disable */
// AgendaMed — Admin screens (panel, editar consultorio)

function AdminScreen({ nav }) {
  const [filter, setFilter] = useState("todos");
  const clinics = AGENDA_DATA.ADMIN_CLINICS;
  const filtered = filter === "todos" ? clinics : clinics.filter(c => c.estado === filter);

  const stats = {
    activos: clinics.filter(c => c.estado === "activo").length,
    prueba: clinics.filter(c => c.estado === "prueba").length,
    suspendidos: clinics.filter(c => c.estado === "suspendido").length,
    mrr: 47500,
  };

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow" style={{ color: "var(--c-brand-fg)" }}>● Vista de administración</span>
          <h1 className="page__title">Panel de administración</h1>
          <p className="page__sub">9 consultorios · 2 alertas requieren tu atención</p>
        </div>
        <div className="page__actions">
          <Button variant="secondary" icon={Icons.Download}>Reporte mensual</Button>
          <Button icon={Icons.Plus}>Nuevo consultorio</Button>
        </div>
      </header>

      <div className="alert alert--danger">
        <Icons.AlertC size={16}/>
        <div className="alert__body">
          <strong>Dermatología Moderna</strong> lleva 8 días suspendido. <strong>Consultorio Dr. Vázquez</strong> lleva 5 días.
        </div>
        <button className="linkish">Revisar →</button>
      </div>

      <div className="grid-4 metrics">
        <Card className="metric">
          <div className="metric__label">Consultorios activos</div>
          <div className="metric__row"><div className="metric__value tnum">{stats.activos}</div><Badge tone="success" size="sm">▲ 2</Badge></div>
          <div className="metric__hint muted">de 9 totales</div>
        </Card>
        <Card className="metric">
          <div className="metric__label">En prueba (14 días)</div>
          <div className="metric__row"><div className="metric__value tnum">{stats.prueba}</div><Badge tone="warning" size="sm">2 vencen pronto</Badge></div>
          <div className="metric__hint muted">tasa conversión 64%</div>
        </Card>
        <Card className="metric">
          <div className="metric__label">Suspendidos</div>
          <div className="metric__row"><div className="metric__value tnum">{stats.suspendidos}</div><Badge tone="danger" size="sm">Atención</Badge></div>
          <div className="metric__hint muted">por falta de pago</div>
        </Card>
        <Card className="metric">
          <div className="metric__label">MRR estimado</div>
          <div className="metric__row"><div className="metric__value tnum">${stats.mrr.toLocaleString("es-MX")}</div><Badge tone="success" size="sm">▲ +18%</Badge></div>
          <div className="metric__hint muted">$15K margen</div>
        </Card>
      </div>

      <Card padding="sm">
        <div className="filters filters--pat">
          <span className="input input--with-icon filters__search">
            <Icons.Search size={16} className="input__icon"/>
            <input placeholder="Buscar por consultorio, médico o ciudad…"/>
          </span>
          <div className="seg">
            {[
              { id: "todos", label: "Todos", count: clinics.length },
              { id: "activo", label: "Activos", count: stats.activos },
              { id: "prueba", label: "Prueba", count: stats.prueba },
              { id: "suspendido", label: "Suspendidos", count: stats.suspendidos },
            ].map(f => (
              <button key={f.id} className={`seg__btn ${filter === f.id ? "is-active" : ""}`} onClick={() => setFilter(f.id)}>
                {f.label}<span className="muted" style={{marginLeft: 6, fontSize: 11}}>{f.count}</span>
              </button>
            ))}
          </div>
          <Select><option>Plan: todos</option><option>Base</option><option>Pro</option></Select>
        </div>
      </Card>

      <Card padding="none" className="pat-table-card">
        <table className="pat-table admin-table">
          <thead>
            <tr>
              <th>Consultorio</th>
              <th>Médico</th>
              <th>Ciudad</th>
              <th>Plan</th>
              <th>Estado</th>
              <th>Vencimiento</th>
              <th aria-label="Acciones"/>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="pat-row" onClick={() => nav("admin-edit")}>
                <td>
                  <div className="pat-cell">
                    <div className="admin-clinic-icon">{initials(c.nombre.replace("Consultorio ","").replace("Clínica ",""))}</div>
                    <div>
                      <div className="pat-cell__name">{c.nombre}</div>
                      <div className="pat-cell__meta muted">ID #{c.id.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td>{c.medico}</td>
                <td className="muted">{c.ciudad}</td>
                <td><Badge tone={c.plan === "pro" ? "brand" : "neutral"} size="sm">{c.plan === "pro" ? "Pro" : "Base"}</Badge></td>
                <td>
                  {c.estado === "activo"     && <Badge tone="success" dot size="sm">Activo</Badge>}
                  {c.estado === "prueba"     && <Badge tone="warning" dot size="sm">En prueba</Badge>}
                  {c.estado === "suspendido" && <Badge tone="danger" dot size="sm">Suspendido</Badge>}
                </td>
                <td className="mono" style={{fontSize: 12.5}}>{fmtDate(c.vencimiento)}</td>
                <td>
                  <div className="row-tight" style={{justifyContent: "flex-end"}}>
                    <Button size="sm" variant="ghost" icon={Icons.Pencil}>Editar</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ============================================================
// Admin · Editar consultorio
// ============================================================
function AdminEditScreen({ nav }) {
  const c = AGENDA_DATA.ADMIN_CLINICS[4]; // Dermatología Moderna (suspendido)
  const [plan, setPlan] = useState(c.plan);
  const [estado, setEstado] = useState(c.estado);
  const [venc, setVenc] = useState(c.vencimiento);
  const [notif, setNotif] = useState(true);
  const toast = useToast();

  return (
    <div className="stack">
      <header className="apptd__head">
        <Button variant="ghost" icon={Icons.ArrowL} onClick={() => nav("admin")}>Volver al panel</Button>
        <div className="row-tight" style={{marginLeft: "auto"}}>
          <Button variant="ghost">Cancelar</Button>
          <Button onClick={() => { toast({ tone: "success", title: "Cambios guardados", message: notif ? "Se envió notificación al médico." : "No se envió notificación." }); nav("admin"); }}>Guardar cambios</Button>
        </div>
      </header>

      <Card padding="md" className="apptd__hero">
        <div className="apptd__hero-l">
          <div className="admin-clinic-icon admin-clinic-icon--lg">DM</div>
          <div className="apptd__hero-info">
            <h2 className="apptd__name">{c.nombre}</h2>
            <div className="apptd__hero-meta">
              <span><Icons.User size={13}/> {c.medico}</span>
              <span><Icons.MapPin size={13}/> {c.ciudad}</span>
              <Badge tone="danger" dot>Suspendido · 8 días</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid-main-side">
        <div className="stack">
          <Card>
            <CardHead title="Plan y suscripción"/>
            <div className="grid-2 set-form">
              <Field label="Plan actual">
                <Select value={plan} onChange={(e) => setPlan(e.target.value)}>
                  <option value="base">Base — $1,500 MXN/mes</option>
                  <option value="pro">Pro — $2,500 MXN/mes</option>
                  <option value="enterprise">Empresa — Custom</option>
                </Select>
              </Field>
              <Field label="Estado">
                <Select value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="activo">Activo</option>
                  <option value="prueba">En prueba</option>
                  <option value="suspendido">Suspendido</option>
                  <option value="cancelado">Cancelado</option>
                </Select>
              </Field>
              <Field label="Fecha de vencimiento">
                <Input type="date" value={venc} onChange={(e) => setVenc(e.target.value)}/>
              </Field>
              <Field label="Límite de pacientes" hint="Sobreescribe el límite del plan.">
                <Input type="number" defaultValue={500}/>
              </Field>
            </div>
          </Card>

          <Card>
            <CardHead title="Historial de cambios" eyebrow="Últimos 5 eventos"/>
            <ul className="hist">
              <li className="hist__row"><span className="hist__time mono">18 may · 02:03</span><span className="hist__msg"><strong>Estado → Suspendido</strong> · falta de pago automático.</span></li>
              <li className="hist__row"><span className="hist__time mono">17 may · 09:00</span><span className="hist__msg"><strong>Recordatorio de pago</strong> enviado por email.</span></li>
              <li className="hist__row"><span className="hist__time mono">14 may · 09:00</span><span className="hist__msg"><strong>Recordatorio de pago</strong> · 4 días antes del vencimiento.</span></li>
              <li className="hist__row"><span className="hist__time mono">12 feb · 11:23</span><span className="hist__msg"><strong>Plan actualizado</strong> · Base → Pro por Alfonso Méndez.</span></li>
              <li className="hist__row"><span className="hist__time mono">15 ene · 10:00</span><span className="hist__msg"><strong>Consultorio creado</strong> · prueba 14 días.</span></li>
            </ul>
          </Card>

          <Card>
            <div className="row split">
              <div>
                <div style={{fontWeight: 500}}>Notificar al médico por email</div>
                <div className="muted" style={{fontSize: 12, marginTop: 2}}>Se enviará un correo automático con los cambios al guardar.</div>
              </div>
              <Toggle checked={notif} onChange={setNotif}/>
            </div>
          </Card>
        </div>

        <aside className="stack">
          <Card>
            <CardHead title="Datos del consultorio"/>
            <ul className="kv">
              <li><span className="kv__l">ID</span><span className="kv__v mono">#{c.id.toUpperCase()}</span></li>
              <li><span className="kv__l">Email</span><span className="kv__v">dermo@moderna.mx</span></li>
              <li><span className="kv__l">Teléfono</span><span className="kv__v mono">442 123 4567</span></li>
              <li><span className="kv__l">Creado</span><span className="kv__v">15 ene 2026</span></li>
              <li><span className="kv__l">Pacientes</span><span className="kv__v tnum">142</span></li>
              <li><span className="kv__l">MRR</span><span className="kv__v mono">$2,500</span></li>
            </ul>
          </Card>

          <Card>
            <CardHead title="Acciones rápidas"/>
            <div className="stack-3">
              <Button variant="tonal" icon={Icons.Mail} className="btn--full">Enviar email manual</Button>
              <Button variant="tonal" icon={Icons.Refresh} className="btn--full">Reactivar prueba 14 días</Button>
              <Button variant="ghost" icon={Icons.Eye} className="btn--full">Ver como médico</Button>
              <Button variant="danger" icon={Icons.Trash} className="btn--full">Eliminar consultorio</Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { AdminScreen, AdminEditScreen });
