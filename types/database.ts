export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PlanTipo = "prueba" | "base" | "pro"
export type PlanEstado = "activo" | "suspendido" | "cancelado"
export type CitaEstado = "pendiente" | "confirmada" | "completada" | "cancelada" | "noshow"
export type TipoServicio = "presencial" | "teleconsulta"

export interface Database {
  public: {
    Tables: {
      consultorios: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          nombre: string
          slug: string | null
          medico_nombre: string
          especialidad: string
          cedula_profesional: string | null
          email: string
          telefono: string | null
          direccion: string | null
          ciudad: string | null
          codigo_postal: string | null
          logo_url: string | null
          plan: PlanTipo
          plan_estado: PlanEstado
          prueba_termina_en: string
          plan_activo_desde: string | null
          plan_renovacion: string | null
          zoom_access_token: string | null
          zoom_refresh_token: string | null
          zoom_token_expira_en: string | null
          zoom_account_email: string | null
          max_pacientes: number
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          nombre: string
          slug?: string | null
          medico_nombre: string
          especialidad: string
          cedula_profesional?: string | null
          email: string
          telefono?: string | null
          direccion?: string | null
          ciudad?: string | null
          codigo_postal?: string | null
          logo_url?: string | null
          plan?: PlanTipo
          plan_estado?: PlanEstado
          prueba_termina_en?: string
          plan_activo_desde?: string | null
          plan_renovacion?: string | null
          zoom_access_token?: string | null
          zoom_refresh_token?: string | null
          zoom_token_expira_en?: string | null
          zoom_account_email?: string | null
          max_pacientes?: number
          user_id: string
        }
        Update: Partial<Database["public"]["Tables"]["consultorios"]["Insert"]>
      }
      pacientes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          consultorio_id: string
          nombre: string
          email: string | null
          telefono: string | null
          fecha_nacimiento: string | null
          sexo: "M" | "F" | "otro" | null
          grupo_sanguineo: string | null
          alergias: string | null
          notas_medicas: string | null
          consentimiento_privacidad: boolean
          consentimiento_whatsapp: boolean
          total_citas: number
          no_shows_contador: number
          ultima_cita: string | null
          eliminado_en: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          consultorio_id: string
          nombre: string
          email?: string | null
          telefono?: string | null
          fecha_nacimiento?: string | null
          sexo?: "M" | "F" | "otro" | null
          grupo_sanguineo?: string | null
          alergias?: string | null
          notas_medicas?: string | null
          consentimiento_privacidad?: boolean
          consentimiento_whatsapp?: boolean
          total_citas?: number
          no_shows_contador?: number
          ultima_cita?: string | null
          eliminado_en?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["pacientes"]["Insert"]>
      }
      servicios: {
        Row: {
          id: string
          created_at: string
          consultorio_id: string
          nombre: string
          duracion_min: number
          precio_mxn: number
          tipo: TipoServicio
          activo: boolean
          orden: number
        }
        Insert: {
          id?: string
          created_at?: string
          consultorio_id: string
          nombre: string
          duracion_min?: number
          precio_mxn?: number
          tipo?: TipoServicio
          activo?: boolean
          orden?: number
        }
        Update: Partial<Database["public"]["Tables"]["servicios"]["Insert"]>
      }
      horarios: {
        Row: {
          id: string
          consultorio_id: string
          dia_semana: number
          activo: boolean
          inicio_1: string | null
          fin_1: string | null
          inicio_2: string | null
          fin_2: string | null
        }
        Insert: {
          id?: string
          consultorio_id: string
          dia_semana: number
          activo?: boolean
          inicio_1?: string | null
          fin_1?: string | null
          inicio_2?: string | null
          fin_2?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["horarios"]["Insert"]>
      }
      citas: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          consultorio_id: string
          paciente_id: string
          servicio_id: string | null
          inicio: string
          fin: string
          duracion_min: number
          estado: CitaEstado
          notas: string | null
          motivo_cancelacion: string | null
          zoom_meeting_id: string | null
          zoom_join_url: string | null
          zoom_start_url: string | null
          cancelacion_token: string | null
          cancelado_por_pac: boolean
          es_recurrente: boolean
          cita_padre_id: string | null
          es_bloqueo: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          consultorio_id: string
          paciente_id: string
          servicio_id?: string | null
          inicio: string
          fin: string
          duracion_min: number
          estado?: CitaEstado
          notas?: string | null
          motivo_cancelacion?: string | null
          zoom_meeting_id?: string | null
          zoom_join_url?: string | null
          zoom_start_url?: string | null
          cancelacion_token?: string | null
          cancelado_por_pac?: boolean
          es_recurrente?: boolean
          cita_padre_id?: string | null
          es_bloqueo?: boolean
        }
        Update: Partial<Database["public"]["Tables"]["citas"]["Insert"]>
      }
      recetas: {
        Row: {
          id: string
          created_at: string
          consultorio_id: string
          paciente_id: string
          cita_id: string | null
          folio: string
          diagnostico: string
          medicamentos: Json
          indicaciones: string | null
          pdf_url: string | null
          enviada_wa: boolean
          enviada_wa_en: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          consultorio_id: string
          paciente_id: string
          cita_id?: string | null
          folio: string
          diagnostico: string
          medicamentos?: Json
          indicaciones?: string | null
          pdf_url?: string | null
          enviada_wa?: boolean
          enviada_wa_en?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["recetas"]["Insert"]>
      }
      plantillas_receta: {
        Row: {
          id: string
          created_at: string
          consultorio_id: string
          nombre: string
          diagnostico: string | null
          medicamentos: Json
          indicaciones: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          consultorio_id: string
          nombre: string
          diagnostico?: string | null
          medicamentos?: Json
          indicaciones?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["plantillas_receta"]["Insert"]>
      }
      mensajes_log: {
        Row: {
          id: string
          created_at: string
          consultorio_id: string
          paciente_id: string | null
          cita_id: string | null
          tipo: string
          canal: string
          estado: string
          error: string | null
          proveedor_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          consultorio_id: string
          paciente_id?: string | null
          cita_id?: string | null
          tipo: string
          canal: string
          estado?: string
          error?: string | null
          proveedor_id?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["mensajes_log"]["Insert"]>
      }
      configuracion_mensajes: {
        Row: {
          id: string
          consultorio_id: string
          recordatorio_24h: boolean
          recordatorio_2h: boolean
          recordatorio_2h_cancelacion: boolean
          cumpleanos: boolean
          encuesta_post_consulta: boolean
          ventana_cancelacion_horas: number
          cumpleanos_hora: string
        }
        Insert: {
          id?: string
          consultorio_id: string
          recordatorio_24h?: boolean
          recordatorio_2h?: boolean
          recordatorio_2h_cancelacion?: boolean
          cumpleanos?: boolean
          encuesta_post_consulta?: boolean
          ventana_cancelacion_horas?: number
          cumpleanos_hora?: string
        }
        Update: Partial<Database["public"]["Tables"]["configuracion_mensajes"]["Insert"]>
      }
    }
    Functions: {
      mi_consultorio_id: {
        Args: Record<string, never>
        Returns: string
      }
      generar_folio_receta: {
        Args: { consultorio_id: string }
        Returns: string
      }
    }
  }
}

// Tipos derivados para uso en componentes
export type Consultorio = Database["public"]["Tables"]["consultorios"]["Row"]
export type Paciente = Database["public"]["Tables"]["pacientes"]["Row"]
export type Servicio = Database["public"]["Tables"]["servicios"]["Row"]
export type Horario = Database["public"]["Tables"]["horarios"]["Row"]
export type Cita = Database["public"]["Tables"]["citas"]["Row"]
export type Receta = Database["public"]["Tables"]["recetas"]["Row"]
export type PlantillaReceta = Database["public"]["Tables"]["plantillas_receta"]["Row"]
export type MensajeLog = Database["public"]["Tables"]["mensajes_log"]["Row"]
export type ConfiguracionMensajes = Database["public"]["Tables"]["configuracion_mensajes"]["Row"]

// Cita con relaciones
export type CitaConRelaciones = Cita & {
  paciente: Paciente
  servicio: Servicio | null
}

// Medicamento dentro de receta
export interface Medicamento {
  nombre: string
  dosis: string
  frecuencia: string
  duracion: string
}
