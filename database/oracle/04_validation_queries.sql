-- =====================================================================
-- Tutores On-Line | Script 4 de 4: consultas de validacion del modelo
-- Ejecutar despues de 03_sample_data.sql para comprobar que las
-- relaciones, restricciones y datos funcionan correctamente.
-- =====================================================================

-- 1) Conteo de filas por tabla (ninguna debe quedar en 0 tras los datos de prueba)
SELECT 'USUARIOS' tabla, COUNT(*) filas FROM usuarios
UNION ALL SELECT 'ESTUDIANTES', COUNT(*) FROM estudiantes
UNION ALL SELECT 'TUTORES', COUNT(*) FROM tutores
UNION ALL SELECT 'MATERIAS', COUNT(*) FROM materias
UNION ALL SELECT 'TUTOR_MATERIAS', COUNT(*) FROM tutor_materias
UNION ALL SELECT 'DISPONIBILIDAD', COUNT(*) FROM disponibilidad
UNION ALL SELECT 'RESERVAS', COUNT(*) FROM reservas
UNION ALL SELECT 'CALIFICACIONES', COUNT(*) FROM calificaciones
UNION ALL SELECT 'NOTIFICACIONES', COUNT(*) FROM notificaciones;

-- 2) Listado de tutores con su usuario, materias y calificacion (vista "buscar tutores")
SELECT u.nombre || ' ' || u.apellido AS tutor,
       t.ciudad, t.modalidad, t.tarifa_hora, t.calificacion_promedio,
       LISTAGG(m.nombre, ', ') WITHIN GROUP (ORDER BY m.nombre) AS especialidades
FROM tutores t
JOIN usuarios u ON u.id_usuario = t.id_usuario
JOIN tutor_materias tm ON tm.id_tutor = t.id_tutor
JOIN materias m ON m.id_materia = tm.id_materia
GROUP BY u.nombre, u.apellido, t.ciudad, t.modalidad, t.tarifa_hora, t.calificacion_promedio
ORDER BY t.calificacion_promedio DESC;

-- 3) Disponibilidad semanal de un tutor especifico
SELECT u.nombre || ' ' || u.apellido AS tutor, d.dia_semana, d.hora_inicio, d.hora_fin, d.modalidad
FROM disponibilidad d
JOIN tutores t ON t.id_tutor = d.id_tutor
JOIN usuarios u ON u.id_usuario = t.id_usuario
WHERE u.email = 'laura.martinez@tutoresonline.com'
ORDER BY d.dia_semana;

-- 4) Reservas con todos sus datos legibles (estudiante, tutor, materia, estado)
SELECT r.id_reserva,
       ue.nombre || ' ' || ue.apellido AS estudiante,
       ut.nombre || ' ' || ut.apellido AS tutor,
       m.nombre AS materia,
       r.fecha_sesion, r.hora_inicio, r.hora_fin, r.modalidad, r.estado
FROM reservas r
JOIN estudiantes e ON e.id_estudiante = r.id_estudiante
JOIN usuarios ue ON ue.id_usuario = e.id_usuario
JOIN tutores t ON t.id_tutor = r.id_tutor
JOIN usuarios ut ON ut.id_usuario = t.id_usuario
JOIN materias m ON m.id_materia = r.id_materia
ORDER BY r.fecha_sesion;

-- 5) Historial y calificaciones de un estudiante
SELECT r.id_reserva, m.nombre AS materia, r.fecha_sesion, r.estado,
       c.puntuacion, c.comentario
FROM reservas r
JOIN estudiantes e ON e.id_estudiante = r.id_estudiante
JOIN usuarios ue ON ue.id_usuario = e.id_usuario
JOIN materias m ON m.id_materia = r.id_materia
LEFT JOIN calificaciones c ON c.id_reserva = r.id_reserva
WHERE ue.email = 'juan.perez@estudiante.com'
ORDER BY r.fecha_sesion DESC;

-- 6) Notificaciones no leidas de un usuario
SELECT n.tipo, n.mensaje, n.fecha_creacion
FROM notificaciones n
JOIN usuarios u ON u.id_usuario = n.id_usuario
WHERE u.email = 'carlos.ramirez@tutoresonline.com' AND n.leida = 'N'
ORDER BY n.fecha_creacion DESC;

-- 7) Verificacion de integridad referencial: debe devolver 0 filas en todos los casos
SELECT COUNT(*) huerfanos_reservas_estudiante FROM reservas r
 WHERE NOT EXISTS (SELECT 1 FROM estudiantes e WHERE e.id_estudiante = r.id_estudiante);
SELECT COUNT(*) huerfanos_reservas_tutor FROM reservas r
 WHERE NOT EXISTS (SELECT 1 FROM tutores t WHERE t.id_tutor = r.id_tutor);
SELECT COUNT(*) huerfanos_calificaciones FROM calificaciones c
 WHERE NOT EXISTS (SELECT 1 FROM reservas r WHERE r.id_reserva = c.id_reserva);
