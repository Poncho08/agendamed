import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import type { Receta, Consultorio, Paciente, Medicamento } from "@/types/database"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#222",
    padding: "32pt 36pt",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a2e",
    marginBottom: 14,
  },
  logo: { fontSize: 14, fontWeight: "bold", color: "#3b5bdb" },
  medicoNombre: { fontSize: 11, fontWeight: "bold", marginTop: 8 },
  headerRight: { alignItems: "flex-end" },
  patRow: { flexDirection: "row", gap: 20, marginBottom: 12 },
  patItem: { flexDirection: "row", gap: 4 },
  label: { color: "#666" },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#666",
    marginBottom: 5,
  },
  medItem: { marginBottom: 6 },
  medNombre: { fontWeight: "bold" },
  signLine: { width: 100, borderBottomWidth: 1, borderBottomColor: "#222", marginBottom: 4, marginTop: 24 },
  footer: {
    fontSize: 8,
    color: "#aaa",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 6,
    marginTop: 12,
  },
})

interface Props {
  receta: Receta & {
    paciente: Paciente | null
    consultorio: Consultorio | null
  }
}

export function RecetaPDF({ receta }: Props) {
  const cons = receta.consultorio
  const pac = receta.paciente
  const meds = (receta.medicamentos as unknown as Medicamento[]) ?? []
  const hoy = format(new Date(receta.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>AgendaMed</Text>
            <Text style={styles.medicoNombre}>{cons?.medico_nombre}</Text>
            <Text>{cons?.especialidad}</Text>
            {/* Cédula comentada hasta deploy final */}
            {/* <Text>Céd. Prof. {cons?.cedula_profesional}</Text> */}
            <Text>{cons?.email}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontWeight: "bold" }}>{cons?.nombre}</Text>
            {cons?.direccion && <Text>{cons.direccion}</Text>}
            {cons?.ciudad && <Text>{cons.ciudad}</Text>}
            {cons?.telefono && <Text>{cons.telefono}</Text>}
          </View>
        </View>

        {/* Datos paciente */}
        <View style={styles.patRow}>
          <View style={styles.patItem}><Text style={styles.label}>Paciente: </Text><Text style={{ fontWeight: "bold" }}>{pac?.nombre}</Text></View>
          <View style={styles.patItem}><Text style={styles.label}>Fecha: </Text><Text style={{ fontWeight: "bold" }}>{hoy}</Text></View>
          <View style={styles.patItem}><Text style={styles.label}>Folio: </Text><Text style={{ fontWeight: "bold" }}>{receta.folio}</Text></View>
        </View>

        {/* Diagnóstico */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnóstico</Text>
          <Text>{receta.diagnostico}</Text>
        </View>

        {/* Medicamentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicación médica</Text>
          {meds.map((m, i) => (
            <View key={i} style={styles.medItem}>
              <Text><Text style={styles.medNombre}>{i + 1}. {m.nombre}</Text>{m.dosis ? ` · ${m.dosis}` : ""}</Text>
              <Text style={{ color: "#555", marginLeft: 12 }}>
                {m.frecuencia || "—"}{m.duracion ? ` · ${m.duracion}` : ""}
              </Text>
            </View>
          ))}
        </View>

        {/* Indicaciones */}
        {receta.indicaciones && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recomendaciones</Text>
            <Text>{receta.indicaciones}</Text>
          </View>
        )}

        {/* Firma */}
        <View>
          <View style={styles.signLine} />
          <Text style={{ fontWeight: "bold" }}>{cons?.medico_nombre}</Text>
          {/* Cédula comentada hasta deploy final */}
          {/* <Text style={{ color: "#666", fontSize: 9 }}>Cédula profesional {cons?.cedula_profesional}</Text> */}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Documento de apoyo emitido por AgendaMed · No sustituye una receta médica oficial. Conserve para sus registros.
        </Text>
      </Page>
    </Document>
  )
}
