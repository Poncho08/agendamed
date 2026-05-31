-- Migración: prevenir doble booking en citas activas
-- Una cita cancelada libera el slot para una nueva reserva,
-- por eso usamos un índice PARCIAL que excluye citas canceladas.

CREATE UNIQUE INDEX IF NOT EXISTS citas_no_double_booking_idx
  ON citas (consultorio_id, inicio)
  WHERE estado != 'cancelada';

-- Comentario: si ya existen citas duplicadas en la DB (datos de prueba),
-- este comando fallará. Resolverlo primero con:
-- DELETE FROM citas WHERE id NOT IN (
--   SELECT DISTINCT ON (consultorio_id, inicio) id
--   FROM citas WHERE estado != 'cancelada'
--   ORDER BY consultorio_id, inicio, created_at
-- );
