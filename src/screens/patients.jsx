/* eslint-disable */
// AgendaMed — Pacientes screens (lista, perfil)

// ============================================================
// Lista de pacientes
// ============================================================
function PatientsListScreen({ nav }) {
  const [search, setSearch] = useState("");
  const filtered = AGENDA_DATA.PATIENTS.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Directorio</span>
          <h1 className="page__title">Pacientes</h1>
          <p className="page__sub">234 pacientes activos · 12 nuevos este mes</p>
        </div>
        <div className="page__actions">
          <Button variant="secondary" icon={Icons.Download}>Exportar CSV</Button>
          <Button icon={Icons.Plus}>Nuevo paciente</Button>
        </div>
      </header>

      <Card padding="sm">
        <div className="filters filters--pat">
          <span className="input input--with-icon filters__search">
            <Icons.Search size={16} className="input__icon"/>
            <input placeholder="Buscar por nombre, teléfono o email…" value={search} onChange={(e) => setSearch(e.target.value)}/>
          </span>
          <Select><option>Ordenar: nombre A-Z</option><option>Última cita</option><option>Próxima cita</option><option>Total de citas</option></Select>
          <Select><option>Estado: todos</option><option>Activos</option><option>Sin actividad 6m+</option><option>Con no-shows</option></Select>
          <span className="muted" style={{fontSize: 13, whiteSpace: "nowrap"}}>{filtered.length} resultados</span>
        </div>
      </Card>

      <Card padding="none" className="pat-table-card">
        <table className="pat-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Contacto</th>
              <th>Última cita</th>
              <th>Próxima cita</th>
              <th className="t-r">Total</th>
              <th>Estado</th>
              <th aria-label="Acciones"/>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} onClick={() => nav("perfil")} className="pat-row">
                <td>
                  <div className="pat-cell">
                    <Avatar name={p.nombre} size={32}/>
                    <div>
                      <div className="pat-cell__name">{p.nombre}</div>
                      <div className="pat-cell__meta muted">{p.edad} años · {p.grupoSanguineo}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="mono" style={{fontSize: 12.5}}>{p.tel}</div>
                  <div className="muted" style={{fontSize: 12}}>{p.email}</div>
                </td>
                <td className="mono" style={{fontSize: 12.5}}>{fmtDate(p.ultimaCita)}</td>
                <td>
                  {p.proximaCita ? <span className="mono" style={{fontSize: 12.5, color: "var(--c-brand-fg)"}}>{fmtDate(p.proximaCita)}</span>
                    : <span className="muted" style={{fontSize: 12.5}}>—</span>}
                </td>
                <td className="t-r mono tnum">{p.totalCitas}</td>
                <td>
                  {p.noShows >= 2 ? <Badge tone="danger" size="sm" icon={Icons.AlertT}>{p.noShows} no-shows</Badge>
                  : p.noShows === 1 ? <Badge tone="warning" size="sm">1 no-show</Badge>
                  : <Badge tone="success" size="sm">Activo</Badge>}
                </td>
                <td>
                  <button className="iconbtn" aria-label="Ver"><Icons.ChevronR size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="row split" style={{marginTop: 4}}>
        <span className="muted" style={{fontSize: 13}}>Mostrando 12 de 234 pacientes</span>
        <div className="row-tight">
          <Button variant="secondary" size="sm" icon={Icons.ChevronL}>Anterior</Button>
          <span className="mono" style={{fontSize: 13, padding: "0 8px"}}>1 / 20</span>
          <Button variant="secondary" size="sm" iconRight={Icons.ChevronR}>Siguiente</Button>
        </div>
      </div>
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${meses[m-1]} ${y}`;
}

// ============================================================
// Perfil de paciente
// ============================================================
function PatientProfileScreen({ nav }) {
  const p = AGENDA_DATA.PATIENTS[0]; // María González Ruiz
  const [tab, setTab] = useState("citas");

  const past = [
    { fecha: "2026-05-12", hora: "11:00", servicio: "Consulta general", estado: "completada", motivo: "Control de presión" },
    { fecha: "2026-04-22", hora: "10:30", servicio: "Seguimiento",      estado: "completada", motivo: "Revisión de medicación" },
    { fecha: "2026-03-15", hora: "16:00", servicio: "Consulta general", estado: "completada", motivo: "Cefalea recurrente" },
    { fecha: "2026-02-08", hora: "09:00", servicio: "Teleconsulta",     estado: "completada", motivo: "Receta de control" },
    { fecha: "2026-01-12", hora: "11:30", servicio: "Consulta general", estado: "completada", motivo: "Chequeo anual" },
  ];

  return (
    <div className="stack">
      <header className="patp__head">
        <Button variant="ghost" icon={Icons.ArrowL} onClick={() => nav("pacientes")}>Volver</Button>
        <div className="row-tight" style={{ marginLeft: "auto" }}>
          <Button variant="secondary" size="sm" icon={Icons.Pencil}>Editar datos</Button>
          <Button size="sm" icon={Icons.Plus} onClick={() => nav("nueva-cita")}>Agendar cita</Button>
        </div>
      </header>

      <Card padding="md" className="patp__hero">
        <Avatar name={p.nombre} size={72}/>
        <div className="patp__info">
          <h1 className="patp__name">{p.nombre}</h1>
          <div className="patp__meta">
            <span><Icons.User size={14}/> {p.edad} años · {p.grupoSanguineo}</span>
            <span><Icons.Phone size={14}/> {p.tel}</span>
            <span><Icons.Mail size={14}/> {p.email}</span>
            <span><Icons.Cake size={14}/> 26 mayo · cumple hoy</span>
          </div>
          <div className="patp__tags" style={{ marginTop: 10 }}>
            <Badge tone="warning" icon={Icons.Cake}>Cumpleaños hoy</Badge>
            <Badge tone="success">Sin no-shows</Badge>
            <Badge tone="brand">Paciente desde ene 2024</Badge>
            <Badge tone="warning" icon={Icons.AlertT}>Alergia: penicilina</Badge>
          </div>
        </div>
        <div className="patp__quick">
          <div className="patp__quick-row">
            <div className="patp__quick-cell"><div className="patp__quick-l">Total citas</div><div className="patp__quick-v tnum">{p.totalCitas}</div></div>
            <div className="patp__quick-cell"><div className="patp__quick-l">No-shows</div><div className="patp__quick-v tnum">{p.noShows}</div></div>
            <div className="patp__quick-cell"><div className="patp__quick-l">Recetas</div><div className="patp__quick-v tnum">8</div></div>
          </div>
        </div>
      </Card>

      <div className="patp__body">
        <div>
          <Tabs
            value={tab} onChange={setTab}
            items={[
              { value: "citas", label: "Citas", count: 14 },
              { value: "recetas", label: "Recetas", count: 8 },
              { value: "notas", label: "Notas generales" },
              { value: "documentos", label: "Documentos", count: 3 },
            ]}
          />

          {tab === "citas" && (
            <div className="stack" style={{ marginTop: 18 }}>
              <Card padding="md">
                <CardHead title="Próxima cita" actions={<Button size="sm" variant="ghost" onClick={() => nav("detalle-cita")}>Ver detalle</Button>}/>
                <div className="appt-next">
                  <div className="appt-next__date">
                    <span className="appt-next__day mono">26</span>
                    <span className="appt-next__month">MAY</span>
                  </div>
                  <div className="appt-next__info">
                    <div className="appt-next__title">Consulta general · 11:00</div>
                    <div className="muted" style={{fontSize: 13}}>Control de presión arterial · 30 min</div>
                  </div>
                  <StatusBadge status="confirmada"/>
                </div>
              </Card>

              <Card padding="none" className="card-tight">
                <CardHead title="Historial de citas" subtitle={`${past.length} consultas pasadas`}/>
                <ul className="hist-list">
                  {past.map((c, i) => (
                    <li key={i} className="hist-list__row">
                      <span className="hist-list__date mono">{fmtDate(c.fecha)} · {c.hora}</span>
                      <span className="hist-list__svc">{c.servicio}</span>
                      <span className="hist-list__motivo muted">{c.motivo}</span>
                      <StatusBadge status={c.estado} size="sm"/>
                      <button className="iconbtn" aria-label="Ver"><Icons.ChevronR size={14}/></button>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {tab === "recetas" && (
            <Card padding="none" className="card-tight" style={{ marginTop: 18 }}>
              <CardHead title="Recetas generadas" subtitle="8 documentos de apoyo"/>
              <ul className="rx-list">
                {[
                  { folio:"RX-2026-0138", fecha:"2026-05-15", dx:"Migraña recurrente", meds: 2 },
                  { folio:"RX-2026-0119", fecha:"2026-04-22", dx:"Control de presión arterial", meds: 1 },
                  { folio:"RX-2026-0094", fecha:"2026-03-15", dx:"Cefalea tensional", meds: 3 },
                ].map(r => (
                  <li key={r.folio} className="rx-row">
                    <span className="mono" style={{fontSize: 11.5, color: "var(--c-text-muted)"}}>{r.folio}</span>
                    <span className="mono" style={{fontSize: 12.5}}>{fmtDate(r.fecha)}</span>
                    <span style={{flex: 1}}>{r.dx}</span>
                    <span className="muted" style={{fontSize: 12.5}}>{r.meds} medicamento{r.meds>1?"s":""}</span>
                    <Button size="sm" variant="ghost" icon={Icons.Eye}>Ver PDF</Button>
                    <Button size="sm" variant="ghost" icon={Icons.WhatsApp}>Reenviar</Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {tab === "notas" && (
            <Card style={{ marginTop: 18 }}>
              <CardHead title="Notas generales del paciente" subtitle="Persistentes entre consultas"/>
              <Textarea rows={10} defaultValue={"Paciente con hipertensión leve diagnosticada en 2022. Toma losartán 50mg c/24h con buena adherencia.\n\nAntecedentes: madre con diabetes tipo 2 (controlada). Padre sano.\n\nAlergias confirmadas: penicilina (rash cutáneo, 2019).\n\nNo fuma. Bebe ocasionalmente (1-2 copas en eventos sociales). Hace ejercicio 3 veces por semana."} max={3000} count/>
              <div className="row" style={{justifyContent: "flex-end", marginTop: 12}}>
                <Button size="sm">Guardar</Button>
              </div>
            </Card>
          )}

          {tab === "documentos" && (
            <Card style={{ marginTop: 18 }}>
              <EmptyState
                title="Próximamente"
                message="El módulo de documentos clínicos estará disponible en julio."
                action={<Button variant="secondary">Conocer más</Button>}
              />
            </Card>
          )}
        </div>

        <aside className="stack">
          <Card>
            <CardHead title="Datos personales"/>
            <ul className="kv">
              <li><span className="kv__l">Nombre completo</span><span className="kv__v">{p.nombre}</span></li>
              <li><span className="kv__l">Edad</span><span className="kv__v">{p.edad} años</span></li>
              <li><span className="kv__l">Nacimiento</span><span className="kv__v">26 may 1987</span></li>
              <li><span className="kv__l">Tipo de sangre</span><span className="kv__v">{p.grupoSanguineo}</span></li>
              <li><span className="kv__l">Teléfono</span><span className="kv__v mono">{p.tel}</span></li>
              <li><span className="kv__l">Email</span><span className="kv__v">{p.email}</span></li>
            </ul>
          </Card>

          <Card>
            <CardHead title="Datos clínicos"/>
            <ul className="kv">
              <li><span className="kv__l">Alergias</span><span className="kv__v"><Badge tone="warning" size="sm">Penicilina</Badge></span></li>
              <li><span className="kv__l">Padecimientos</span><span className="kv__v">Hipertensión leve</span></li>
              <li><span className="kv__l">Medicación crónica</span><span className="kv__v">Losartán 50mg</span></li>
            </ul>
          </Card>

          <Card>
            <CardHead title="Consentimientos"/>
            <ul className="consent">
              <li className="consent__row"><Icons.Check size={14} className="consent__icon"/>Aviso de privacidad <span className="muted">· 12 ene 2024</span></li>
              <li className="consent__row"><Icons.Check size={14} className="consent__icon"/>Recordatorios WhatsApp</li>
              <li className="consent__row"><Icons.Check size={14} className="consent__icon"/>Felicitaciones de cumpleaños</li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { PatientsListScreen, PatientProfileScreen });
