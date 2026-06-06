-- Auditoría I2: seguridad RLS + índice de búsqueda por teléfono

-- Eliminar política RLS peligrosa que permitía cancelación masiva vía anon key.
-- La cancelación pública ya pasa por /api/public/cancelar con service-role,
-- así que esta política es innecesaria.
drop policy if exists "cancel_by_token" on citas;

-- Índice para la búsqueda de paciente por teléfono en el booking público.
create index if not exists pacientes_telefono_idx
  on pacientes (consultorio_id, telefono)
  where eliminado_en is null;
