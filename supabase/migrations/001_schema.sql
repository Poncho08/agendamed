-- AgendaMed v1.2 — Schema completo
-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type plan_tipo as enum ('prueba', 'base', 'pro');
create type plan_estado as enum ('activo', 'suspendido', 'cancelado');
create type cita_estado as enum ('pendiente', 'confirmada', 'completada', 'cancelada', 'noshow');
create type tipo_servicio as enum ('presencial', 'teleconsulta');

-- ============================================================
-- TABLA: consultorios
-- ============================================================
create table consultorios (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  -- Datos del consultorio
  nombre                  text not null,
  slug                    text unique,
  medico_nombre           text not null,
  especialidad            text not null,
  cedula_profesional      text,
  email                   text not null,
  telefono                text,
  direccion               text,
  ciudad                  text,
  codigo_postal           text,
  logo_url                text,

  -- Plan y facturación
  plan                    plan_tipo not null default 'prueba',
  plan_estado             plan_estado not null default 'activo',
  prueba_termina_en       timestamptz not null default (now() + interval '14 days'),
  plan_activo_desde       timestamptz,
  plan_renovacion         timestamptz,

  -- Zoom OAuth
  zoom_access_token       text,
  zoom_refresh_token      text,
  zoom_token_expira_en    timestamptz,
  zoom_account_email      text,

  -- Límites por plan
  max_pacientes           int not null default 200,

  -- Owner (linked to auth.users)
  user_id                 uuid not null references auth.users(id) on delete cascade
);

create unique index consultorios_user_id_idx on consultorios(user_id);
create index consultorios_slug_idx on consultorios(slug) where slug is not null;

-- ============================================================
-- TABLA: pacientes
-- ============================================================
create table pacientes (
  id                        uuid primary key default gen_random_uuid(),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  consultorio_id            uuid not null references consultorios(id) on delete cascade,

  -- Datos personales
  nombre                    text not null,
  email                     text,
  telefono                  text,
  fecha_nacimiento          date,
  sexo                      text check (sexo in ('M', 'F', 'otro')),
  grupo_sanguineo           text,
  alergias                  text,
  notas_medicas             text,

  -- Consentimientos (RGDP México)
  consentimiento_privacidad boolean not null default false,
  consentimiento_whatsapp   boolean not null default false,

  -- Stats
  total_citas               int not null default 0,
  no_shows_contador         int not null default 0,
  ultima_cita               timestamptz,

  -- Soft-delete: anonimizar nombre, email y telefono
  eliminado_en              timestamptz
);

create index pacientes_consultorio_idx on pacientes(consultorio_id);
create index pacientes_nombre_idx on pacientes(consultorio_id, nombre) where eliminado_en is null;
create index pacientes_nacimiento_idx on pacientes(consultorio_id, fecha_nacimiento) where eliminado_en is null;

-- ============================================================
-- TABLA: servicios
-- ============================================================
create table servicios (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  consultorio_id  uuid not null references consultorios(id) on delete cascade,

  nombre          text not null,
  duracion_min    int not null default 30,
  precio_mxn      numeric(10,2) not null default 0,
  tipo            tipo_servicio not null default 'presencial',
  activo          boolean not null default true,
  orden           int not null default 0
);

create index servicios_consultorio_idx on servicios(consultorio_id) where activo = true;

-- ============================================================
-- TABLA: horarios
-- ============================================================
create table horarios (
  id              uuid primary key default gen_random_uuid(),
  consultorio_id  uuid not null references consultorios(id) on delete cascade,

  -- 0=Dom, 1=Lun, ..., 6=Sáb
  dia_semana      int not null check (dia_semana between 0 and 6),
  activo          boolean not null default true,
  inicio_1        time,  -- turno mañana
  fin_1           time,
  inicio_2        time,  -- turno tarde (optional)
  fin_2           time,

  unique(consultorio_id, dia_semana)
);

-- ============================================================
-- TABLA: citas
-- ============================================================
create table citas (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  consultorio_id      uuid not null references consultorios(id) on delete cascade,
  paciente_id         uuid not null references pacientes(id) on delete restrict,
  servicio_id         uuid references servicios(id) on delete set null,

  -- Tiempo
  inicio              timestamptz not null,
  fin                 timestamptz not null,
  duracion_min        int not null,

  -- Estado
  estado              cita_estado not null default 'pendiente',
  notas               text,
  motivo_cancelacion  text,

  -- Teleconsulta
  zoom_meeting_id     text,
  zoom_join_url       text,
  zoom_start_url      text,

  -- Cancelación por paciente
  cancelacion_token   uuid unique default gen_random_uuid(),
  cancelado_por_pac   boolean not null default false,

  -- Recurrencia
  es_recurrente       boolean not null default false,
  cita_padre_id       uuid references citas(id) on delete set null,

  -- Bloqueo de agenda (sin paciente)
  es_bloqueo          boolean not null default false
);

create index citas_consultorio_idx on citas(consultorio_id, inicio);
create index citas_paciente_idx on citas(paciente_id);
create index citas_estado_idx on citas(consultorio_id, estado, inicio);
create index citas_cancelacion_token_idx on citas(cancelacion_token) where cancelacion_token is not null;

-- ============================================================
-- TABLA: recetas
-- ============================================================
create table recetas (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  consultorio_id  uuid not null references consultorios(id) on delete cascade,
  paciente_id     uuid not null references pacientes(id) on delete restrict,
  cita_id         uuid references citas(id) on delete set null,

  folio           text not null,
  diagnostico     text not null,
  medicamentos    jsonb not null default '[]',
  indicaciones    text,
  pdf_url         text,

  -- Enviada por WhatsApp
  enviada_wa      boolean not null default false,
  enviada_wa_en   timestamptz
);

create index recetas_consultorio_idx on recetas(consultorio_id, created_at desc);
create index recetas_paciente_idx on recetas(paciente_id);

-- Folio único por consultorio
create unique index recetas_folio_consultorio_idx on recetas(consultorio_id, folio);

-- ============================================================
-- TABLA: plantillas_receta
-- ============================================================
create table plantillas_receta (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  consultorio_id  uuid not null references consultorios(id) on delete cascade,

  nombre          text not null,
  diagnostico     text,
  medicamentos    jsonb not null default '[]',
  indicaciones    text
);

create index plantillas_consultorio_idx on plantillas_receta(consultorio_id);

-- ============================================================
-- TABLA: mensajes_log
-- ============================================================
create table mensajes_log (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  consultorio_id  uuid not null references consultorios(id) on delete cascade,
  paciente_id     uuid references pacientes(id) on delete set null,
  cita_id         uuid references citas(id) on delete set null,

  tipo            text not null, -- 'recordatorio_24h' | 'recordatorio_2h' | 'cumpleanos' | 'confirmacion'
  canal           text not null, -- 'whatsapp' | 'email'
  estado          text not null default 'enviado', -- 'enviado' | 'fallido'
  error           text,
  proveedor_id    text -- Twilio SID o Resend ID
);

create index mensajes_log_consultorio_idx on mensajes_log(consultorio_id, created_at desc);
create index mensajes_log_cita_idx on mensajes_log(cita_id) where cita_id is not null;

-- ============================================================
-- TABLA: configuracion_mensajes
-- ============================================================
create table configuracion_mensajes (
  id                          uuid primary key default gen_random_uuid(),
  consultorio_id              uuid not null unique references consultorios(id) on delete cascade,

  recordatorio_24h            boolean not null default true,
  recordatorio_2h             boolean not null default true,
  recordatorio_2h_cancelacion boolean not null default true, -- permite cancelar en el link
  cumpleanos                  boolean not null default true,
  encuesta_post_consulta      boolean not null default false,

  ventana_cancelacion_horas   int not null default 3,

  -- Horario de envío de cumpleaños
  cumpleanos_hora             time not null default '09:00'
);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger consultorios_updated_at before update on consultorios
  for each row execute function set_updated_at();

create trigger pacientes_updated_at before update on pacientes
  for each row execute function set_updated_at();

create trigger citas_updated_at before update on citas
  for each row execute function set_updated_at();

-- ============================================================
-- TRIGGER: auto-incrementar no_shows_contador
-- ============================================================
create or replace function on_cita_estado_change()
returns trigger language plpgsql as $$
begin
  if new.estado = 'noshow' and old.estado != 'noshow' then
    update pacientes set no_shows_contador = no_shows_contador + 1
    where id = new.paciente_id;
  end if;
  -- Actualizar ultima_cita en completadas
  if new.estado = 'completada' and old.estado != 'completada' then
    update pacientes set ultima_cita = new.inicio, total_citas = total_citas + 1
    where id = new.paciente_id;
  end if;
  return new;
end;
$$;

create trigger cita_estado_change after update of estado on citas
  for each row execute function on_cita_estado_change();

-- ============================================================
-- FUNCIÓN: folio de receta
-- ============================================================
create or replace function generar_folio_receta(consultorio_id uuid)
returns text language plpgsql as $$
declare
  anio text := extract(year from now())::text;
  cnt int;
begin
  select count(*) + 1 into cnt from recetas r where r.consultorio_id = generar_folio_receta.consultorio_id;
  return 'RX-' || anio || '-' || lpad(cnt::text, 4, '0');
end;
$$;

-- ============================================================
-- RLS: Row Level Security
-- ============================================================
alter table consultorios enable row level security;
alter table pacientes enable row level security;
alter table servicios enable row level security;
alter table horarios enable row level security;
alter table citas enable row level security;
alter table recetas enable row level security;
alter table plantillas_receta enable row level security;
alter table mensajes_log enable row level security;
alter table configuracion_mensajes enable row level security;

-- Helper function: get consultorio_id del usuario actual
create or replace function mi_consultorio_id()
returns uuid language sql stable as $$
  select id from consultorios where user_id = auth.uid() limit 1;
$$;

-- Policies: consultorios
create policy "owner_all" on consultorios
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Policies: pacientes (solo del mismo consultorio)
create policy "consultorio_all" on pacientes
  using (consultorio_id = mi_consultorio_id())
  with check (consultorio_id = mi_consultorio_id());

-- Policies: servicios
create policy "consultorio_all" on servicios
  using (consultorio_id = mi_consultorio_id())
  with check (consultorio_id = mi_consultorio_id());

-- Policies: horarios
create policy "consultorio_all" on horarios
  using (consultorio_id = mi_consultorio_id())
  with check (consultorio_id = mi_consultorio_id());

-- Policies: citas
create policy "consultorio_all" on citas
  using (consultorio_id = mi_consultorio_id())
  with check (consultorio_id = mi_consultorio_id());

-- Policies: recetas
create policy "consultorio_all" on recetas
  using (consultorio_id = mi_consultorio_id())
  with check (consultorio_id = mi_consultorio_id());

-- Policies: plantillas_receta
create policy "consultorio_all" on plantillas_receta
  using (consultorio_id = mi_consultorio_id())
  with check (consultorio_id = mi_consultorio_id());

-- Policies: mensajes_log
create policy "consultorio_read" on mensajes_log
  for select using (consultorio_id = mi_consultorio_id());

-- Policies: configuracion_mensajes
create policy "consultorio_all" on configuracion_mensajes
  using (consultorio_id = mi_consultorio_id())
  with check (consultorio_id = mi_consultorio_id());

-- Política pública para cancelar citas (sin auth) — permite update solo del estado
create policy "cancel_by_token" on citas
  for update using (cancelacion_token is not null)
  with check (estado = 'cancelada' and cancelado_por_pac = true);

-- Política pública de lectura para la página de booking
create policy "public_read_consultorio" on consultorios
  for select using (slug is not null and plan_estado = 'activo');

create policy "public_read_servicios" on servicios
  for select using (
    activo = true and
    consultorio_id in (select id from consultorios where slug is not null and plan_estado = 'activo')
  );

create policy "public_read_horarios" on horarios
  for select using (
    activo = true and
    consultorio_id in (select id from consultorios where slug is not null and plan_estado = 'activo')
  );

-- Política pública de creación de citas (booking público)
create policy "public_insert_cita" on citas
  for insert with check (
    consultorio_id in (select id from consultorios where slug is not null and plan_estado = 'activo')
    and es_bloqueo = false
  );

-- ============================================================
-- Storage: logos
-- ============================================================
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
on conflict do nothing;

create policy "owner_upload_logo" on storage.objects
  for insert with check (
    bucket_id = 'logos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "public_read_logo" on storage.objects
  for select using (bucket_id = 'logos');

-- ============================================================
-- pg_cron: jobs automáticos
-- ============================================================
-- Recordatorios 24h (corre cada hora a :05)
select cron.schedule('recordatorios-24h', '5 * * * *',
  $$ select net.http_post(
    url := 'https://TU_PROJECT_ID.supabase.co/functions/v1/recordatorio-24h',
    headers := '{"Authorization":"Bearer TU_SERVICE_ROLE_KEY","Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  ) $$
);

-- Recordatorios 2h (corre cada hora a :10)
select cron.schedule('recordatorios-2h', '10 * * * *',
  $$ select net.http_post(
    url := 'https://TU_PROJECT_ID.supabase.co/functions/v1/recordatorio-2h',
    headers := '{"Authorization":"Bearer TU_SERVICE_ROLE_KEY","Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  ) $$
);

-- Felicitaciones cumpleaños (corre diario a 09:00)
select cron.schedule('cumpleanos', '0 9 * * *',
  $$ select net.http_post(
    url := 'https://TU_PROJECT_ID.supabase.co/functions/v1/cumpleanos',
    headers := '{"Authorization":"Bearer TU_SERVICE_ROLE_KEY","Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  ) $$
);

-- Marcar no-shows (corre cada hora a :30)
select cron.schedule('marcar-noshows', '30 * * * *',
  $$ select net.http_post(
    url := 'https://TU_PROJECT_ID.supabase.co/functions/v1/marcar-noshows',
    headers := '{"Authorization":"Bearer TU_SERVICE_ROLE_KEY","Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  ) $$
);

-- Ciclo de vida del plan (revisa pruebas expiradas, diario a 01:00)
select cron.schedule('ciclo-vida-plan', '0 1 * * *',
  $$ select net.http_post(
    url := 'https://TU_PROJECT_ID.supabase.co/functions/v1/ciclo-vida-plan',
    headers := '{"Authorization":"Bearer TU_SERVICE_ROLE_KEY","Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  ) $$
);
