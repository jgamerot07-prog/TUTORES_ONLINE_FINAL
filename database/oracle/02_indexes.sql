-- =====================================================================
-- Tutores On-Line | Script 2 de 4: indices de apoyo a busqueda/filtrado
-- Los indices de claves unicas e identity ya se crean automaticamente
-- con las restricciones del script 01; aqui solo se agregan los que
-- aceleran las consultas mas frecuentes de la aplicacion.
-- =====================================================================

-- Busqueda de tutores por ciudad (filtro de modalidad presencial)
CREATE INDEX ix_tutores_ciudad ON tutores (ciudad);

-- Ordenar/filtrar tutores por calificacion (listado "mejor calificados")
CREATE INDEX ix_tutores_calificacion ON tutores (calificacion_promedio);

-- Busqueda de especialidades por materia (listado de tutores que ensenan X materia)
CREATE INDEX ix_tutor_materias_materia ON tutor_materias (id_materia);

-- Consultar disponibilidad de un tutor por dia
CREATE INDEX ix_disponibilidad_tutor_dia ON disponibilidad (id_tutor, dia_semana);

-- Historial de reservas por estudiante y por tutor (dashboards)
CREATE INDEX ix_reservas_estudiante ON reservas (id_estudiante, estado);
CREATE INDEX ix_reservas_tutor ON reservas (id_tutor, estado);
CREATE INDEX ix_reservas_fecha ON reservas (fecha_sesion);

-- Notificaciones no leidas de un usuario (campanita de notificaciones)
CREATE INDEX ix_notificaciones_usuario ON notificaciones (id_usuario, leida);
