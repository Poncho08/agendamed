/* eslint-disable */
// AgendaMed — Recetas (generador, historial)

// ============================================================
// Generador de recetas
// ============================================================
function RxNewScreen({ nav }) {
  const [diag, setDiag] = useState("Hipertensión arterial controlada");
  const [meds, setMeds] = useState([
    { id: 1, nombre: "Losartán", dosis: "50 mg", frecuencia: "Cada 24 horas, por la mañana", duracion: "30 días" },
    { id: 2, nombre: "Amlodipino", dosis: "5 mg", frecuencia: "Cada 24 horas, por la noche", duracion: "30 días" },
  ]);
  const [indicaciones, setIndicaciones] = useState("Reducir consumo de sal a menos de 5g al día. Caminar 30 minutos al menos 5 días por semana. Vigilar presión arterial 2 veces por semana (mañana y tarde). Acudir a control en 6 semanas.");
  const toast = useToast();

  const p = AGENDA_DATA.PATIENTS[0];
  const addMed = () => setMeds(m => [...m, { id: Date.now(), nombre: "", dosis: "", frecuencia: "", duracion: "" }]);
  const removeMed = (id) => setMeds(m => m.filter(x => x.id !== id));
  const updMed = (id, k, v) => setMeds(m => m.map(x => x.id === id ? { ...x, [k]: v } : x));

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Documento de apoyo</span>
          <h1 className="page__title">Nueva receta</h1>
          <p className="page__sub">Para <strong>{p.nombre}</strong> · {p.edad} años · {p.grupoSanguineo}</p>
        </div>
        <div className="page__actions">
          <Button variant="ghost" onClick={() => nav("recetas")}>Cancelar</Button>
          <Button variant="secondary" icon={Icons.Download}>Generar PDF</Button>
          <Button variant="primary" icon={Icons.WhatsApp} onClick={() => toast({ tone: "success", title: "Receta enviada", message: "Se compartió por WhatsApp a María González." })}>Enviar por WhatsApp</Button>
        </div>
      </header>

      <div className="rx-grid">
        {/* Form column */}
        <div className="stack">
          <Card>
            <CardHead title="Paciente y plantilla" />
            <div className="grid-2">
              <Field label="Paciente">
                <div className="patient-pill" style={{ background: "var(--c-surface)" }}>
                  <Avatar name={p.nombre} size={32}/>
                  <div className="patient-pill__info">
                    <div className="patient-pill__name" style={{ fontSize: 13 }}>{p.nombre}</div>
                    <div className="patient-pill__meta muted">{p.edad} años · {p.grupoSanguineo}</div>
                  </div>
                  <button className="iconbtn"><Icons.Pencil size={14}/></button>
                </div>
              </Field>
              <Field label="Plantilla" hint="Usa una plantilla guardada para acelerar.">
                <Select>
                  <option>— Sin plantilla —</option>
                  {AGENDA_DATA.RX_TEMPLATES.map(t => <option key={t.id}>{t.nombre}</option>)}
                </Select>
              </Field>
            </div>
          </Card>

          <Card>
            <CardHead title="Diagnóstico" />
            <Input value={diag} onChange={(e) => setDiag(e.target.value)} placeholder="Ej: hipertensión arterial controlada"/>
          </Card>

          <Card>
            <CardHead title="Medicamentos" subtitle="Añade uno por línea" actions={<Button size="sm" variant="tonal" icon={Icons.Plus} onClick={addMed}>Agregar medicamento</Button>}/>
            <div className="med-list">
              {meds.map((m, i) => (
                <div key={m.id} className="med-row">
                  <div className="med-row__head">
                    <span className="med-row__num mono">#{i+1}</span>
                    <button className="iconbtn" aria-label="Eliminar" onClick={() => removeMed(m.id)}><Icons.Trash size={14}/></button>
                  </div>
                  <div className="med-row__grid">
                    <Field label="Medicamento" required className="med-row__big">
                      <Input value={m.nombre} onChange={(e) => updMed(m.id, "nombre", e.target.value)} placeholder="Ej: Losartán"/>
                    </Field>
                    <Field label="Dosis" required>
                      <Input value={m.dosis} onChange={(e) => updMed(m.id, "dosis", e.target.value)} placeholder="50 mg"/>
                    </Field>
                    <Field label="Duración" required>
                      <Input value={m.duracion} onChange={(e) => updMed(m.id, "duracion", e.target.value)} placeholder="30 días"/>
                    </Field>
                    <Field label="Frecuencia / vía" required className="med-row__big">
                      <Input value={m.frecuencia} onChange={(e) => updMed(m.id, "frecuencia", e.target.value)} placeholder="Cada 24h por la mañana, vía oral"/>
                    </Field>
                  </div>
                </div>
              ))}
              {meds.length === 0 && (
                <div className="muted" style={{ padding: 24, textAlign: "center", fontSize: 13 }}>Sin medicamentos. Usa "Agregar" para empezar.</div>
              )}
            </div>
          </Card>

          <Card>
            <CardHead title="Indicaciones generales" />
            <Textarea value={indicaciones} onChange={(e) => setIndicaciones(e.target.value)} rows={6} max={1500} count placeholder="Recomendaciones, cuidados, frecuencia de monitoreo…"/>
          </Card>

          <Card>
            <div className="row split">
              <div>
                <div style={{fontWeight: 500}}>Guardar como plantilla</div>
                <div className="muted" style={{fontSize: 12, marginTop: 2}}>Reutiliza este conjunto en futuras recetas.</div>
              </div>
              <Toggle checked={false} onChange={() => {}}/>
            </div>
          </Card>
        </div>

        {/* Preview column */}
        <div className="rx-preview-wrap">
          <div className="rx-preview-head">
            <span className="muted" style={{fontSize: 12}}>Vista previa del PDF</span>
            <Button size="sm" variant="ghost" icon={Icons.Eye}>Ampliar</Button>
          </div>
          <div className="rx-preview">
            <div className="rx-doc">
              <div className="rx-doc__head">
                <div>
                  <Logo size={20}/>
                  <div className="rx-doc__med" style={{ marginTop: 14 }}>
                    <strong>{AGENDA_DATA.CLINIC.medico}</strong><br/>
                    <span>{AGENDA_DATA.CLINIC.especialidad}</span><br/>
                    <span>Céd. Prof. {AGENDA_DATA.CLINIC.cedula} · {AGENDA_DATA.CLINIC.email}</span>
                  </div>
                </div>
                <div className="rx-doc__addr">
                  <strong>{AGENDA_DATA.CLINIC.nombre}</strong><br/>
                  {AGENDA_DATA.CLINIC.direccion}<br/>
                  {AGENDA_DATA.CLINIC.ciudad}<br/>
                  Tel. {AGENDA_DATA.CLINIC.telefono}
                </div>
              </div>

              <div className="rx-doc__pat">
                <div className="rx-doc__pat-row"><span>Paciente:</span><strong>{p.nombre}</strong></div>
                <div className="rx-doc__pat-row"><span>Edad:</span><strong>{p.edad} años</strong></div>
                <div className="rx-doc__pat-row"><span>Fecha:</span><strong>26 mayo 2026</strong></div>
                <div className="rx-doc__pat-row"><span>Folio:</span><strong className="mono">RX-2026-0143</strong></div>
              </div>

              <div className="rx-doc__sec">
                <h4>Diagnóstico</h4>
                <p>{diag || <em className="muted">—</em>}</p>
              </div>

              <div className="rx-doc__sec">
                <h4>Indicación médica</h4>
                <ol className="rx-doc__meds">
                  {meds.map((m, i) => (
                    <li key={m.id}>
                      <strong>{m.nombre || "—"} {m.dosis && `· ${m.dosis}`}</strong><br/>
                      <span>{m.frecuencia || "—"}{m.duracion && ` · ${m.duracion}`}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rx-doc__sec">
                <h4>Recomendaciones</h4>
                <p>{indicaciones || <em className="muted">—</em>}</p>
              </div>

              <div className="rx-doc__sign">
                <div className="rx-doc__sign-line"/>
                <div className="rx-doc__sign-name">{AGENDA_DATA.CLINIC.medico}</div>
                <div className="rx-doc__sign-cedula muted">Cédula profesional {AGENDA_DATA.CLINIC.cedula}</div>
              </div>

              <div className="rx-doc__legal muted">
                Documento de apoyo emitido por AgendaMed · No sustituye una receta médica oficial. Conserve para sus registros.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Historial de recetas
// ============================================================
function RxHistoryScreen({ nav }) {
  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Documentos</span>
          <h1 className="page__title">Historial de recetas</h1>
          <p className="page__sub">142 recetas generadas · 8 este mes</p>
        </div>
        <div className="page__actions">
          <Button variant="secondary" icon={Icons.Download}>Exportar</Button>
          <Button icon={Icons.Plus} onClick={() => nav("recetas-nueva")}>Nueva receta</Button>
        </div>
      </header>

      <Card padding="sm">
        <div className="filters filters--pat">
          <span className="input input--with-icon filters__search">
            <Icons.Search size={16} className="input__icon"/>
            <input placeholder="Buscar por paciente, folio o diagnóstico…"/>
          </span>
          <Select><option>Periodo: este mes</option><option>Últimos 7 días</option><option>Últimos 90 días</option><option>Este año</option></Select>
          <Select><option>Paciente: todos</option>{AGENDA_DATA.PATIENTS.map(p => <option key={p.id}>{p.nombre}</option>)}</Select>
          <span className="muted" style={{fontSize: 13, whiteSpace: "nowrap"}}>{AGENDA_DATA.PRESCRIPTIONS.length} resultados</span>
        </div>
      </Card>

      <Card padding="none" className="pat-table-card">
        <table className="pat-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Diagnóstico</th>
              <th className="t-r">Meds</th>
              <th aria-label="Acciones"/>
            </tr>
          </thead>
          <tbody>
            {AGENDA_DATA.PRESCRIPTIONS.map(rx => {
              const p = getPatient(rx.pacienteId);
              return (
                <tr key={rx.folio} className="pat-row" onClick={() => nav("recetas-nueva")}>
                  <td className="mono" style={{fontSize: 12, color: "var(--c-text-muted)"}}>{rx.folio}</td>
                  <td className="mono" style={{fontSize: 12.5}}>{fmtDate(rx.fecha)}</td>
                  <td>
                    <div className="pat-cell">
                      <Avatar name={p.nombre} size={28}/>
                      <span className="pat-cell__name">{p.nombre}</span>
                    </div>
                  </td>
                  <td>{rx.diagnostico}</td>
                  <td className="t-r mono">{rx.medicamentos}</td>
                  <td>
                    <div className="row-tight" style={{ justifyContent: "flex-end" }}>
                      <Button size="sm" variant="ghost" icon={Icons.Eye}>Ver PDF</Button>
                      <Button size="sm" variant="ghost" icon={Icons.WhatsApp}>Reenviar</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

Object.assign(window, { RxNewScreen, RxHistoryScreen });
