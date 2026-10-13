-- =====================================================================
-- Tutores On-Line | Script 3 de 4: datos de prueba coherentes
-- Las contrasenas de prueba son el hash bcrypt de "Tutores2025*"
-- (10 rounds) - unicamente para fines de demostracion academica.
-- =====================================================================

-- ---------------------------------------------------------------------
-- MATERIAS
-- ---------------------------------------------------------------------
INSERT INTO materias (nombre, area, descripcion) VALUES ('Calculo I', 'Matematicas', 'Limites, derivadas e integrales basicas');
INSERT INTO materias (nombre, area, descripcion) VALUES ('Algebra Lineal', 'Matematicas', 'Matrices, vectores y espacios vectoriales');
INSERT INTO materias (nombre, area, descripcion) VALUES ('Fisica Mecanica', 'Fisica', 'Cinematica, dinamica y energia');
INSERT INTO materias (nombre, area, descripcion) VALUES ('Circuitos Electricos I', 'Ingenieria Electrica', 'Analisis de circuitos DC y AC');
INSERT INTO materias (nombre, area, descripcion) VALUES ('Programacion en Python', 'Informatica', 'Fundamentos de programacion y estructuras de datos');
INSERT INTO materias (nombre, area, descripcion) VALUES ('Ingles Conversacional', 'Idiomas', 'Practica de conversacion e inglés general');
INSERT INTO materias (nombre, area, descripcion) VALUES ('Quimica General', 'Quimica', 'Estequiometria, enlaces y reacciones');

-- ---------------------------------------------------------------------
-- USUARIOS (2 tutores + 2 estudiantes + 1 admin)
-- password_hash = bcrypt('Tutores2025*')
-- ---------------------------------------------------------------------
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol) VALUES
 ('Laura', 'Martinez', 'laura.martinez@tutoresonline.com', '$2b$10$e0kq8n0G8m5s0m1F4m5s0eQe0m1F4m5s0eQe0m1F4m5s0eQe0m1Fa', '3001234567', 'TUTOR');
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol) VALUES
 ('Carlos', 'Ramirez', 'carlos.ramirez@tutoresonline.com', '$2b$10$e0kq8n0G8m5s0m1F4m5s0eQe0m1F4m5s0eQe0m1F4m5s0eQe0m1Fa', '3007654321', 'TUTOR');
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol) VALUES
 ('Juan', 'Perez', 'juan.perez@estudiante.com', '$2b$10$e0kq8n0G8m5s0m1F4m5s0eQe0m1F4m5s0eQe0m1F4m5s0eQe0m1Fa', '3109876543', 'ESTUDIANTE');
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol) VALUES
 ('Maria', 'Gomez', 'maria.gomez@estudiante.com', '$2b$10$e0kq8n0G8m5s0m1F4m5s0eQe0m1F4m5s0eQe0m1F4m5s0eQe0m1Fa', '3151122334', 'ESTUDIANTE');
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol) VALUES
 ('Admin', 'Plataforma', 'admin@tutoresonline.com', '$2b$10$e0kq8n0G8m5s0m1F4m5s0eQe0m1F4m5s0eQe0m1F4m5s0eQe0m1Fa', NULL, 'ADMIN');

-- ---------------------------------------------------------------------
-- ESTUDIANTES (referencian a USUARIOS por email -> subquery)
-- ---------------------------------------------------------------------
INSERT INTO estudiantes (id_usuario, nivel_educativo, institucion)
 SELECT id_usuario, 'PREGRADO', 'Corporacion Universitaria de la Costa (CUC)' FROM usuarios WHERE email = 'juan.perez@estudiante.com';
INSERT INTO estudiantes (id_usuario, nivel_educativo, institucion)
 SELECT id_usuario, 'COLEGIO', 'Institucion Educativa San Jose' FROM usuarios WHERE email = 'maria.gomez@estudiante.com';

-- ---------------------------------------------------------------------
-- TUTORES
-- ---------------------------------------------------------------------
INSERT INTO tutores (id_usuario, biografia, anios_experiencia, tarifa_hora, modalidad, ciudad, verificado, calificacion_promedio, total_resenas)
 SELECT id_usuario, 'Ingeniera con 5 anios de experiencia enseniando matematicas y fisica a nivel universitario.', 5, 35000, 'AMBAS', 'Barranquilla', 'S', 4.8, 12
 FROM usuarios WHERE email = 'laura.martinez@tutoresonline.com';
INSERT INTO tutores (id_usuario, biografia, anios_experiencia, tarifa_hora, modalidad, ciudad, verificado, calificacion_promedio, total_resenas)
 SELECT id_usuario, 'Tutor especializado en programacion e ingenieria electrica, clases practicas y orientadas a proyectos.', 3, 30000, 'VIRTUAL', 'Barranquilla', 'S', 4.6, 8
 FROM usuarios WHERE email = 'carlos.ramirez@tutoresonline.com';

-- ---------------------------------------------------------------------
-- TUTOR_MATERIAS (especialidades)
-- ---------------------------------------------------------------------
INSERT INTO tutor_materias (id_tutor, id_materia, nivel_experiencia)
 SELECT t.id_tutor, m.id_materia, 'EXPERTO' FROM tutores t, usuarios u, materias m
 WHERE t.id_usuario = u.id_usuario AND u.email = 'laura.martinez@tutoresonline.com' AND m.nombre = 'Calculo I';
INSERT INTO tutor_materias (id_tutor, id_materia, nivel_experiencia)
 SELECT t.id_tutor, m.id_materia, 'AVANZADO' FROM tutores t, usuarios u, materias m
 WHERE t.id_usuario = u.id_usuario AND u.email = 'laura.martinez@tutoresonline.com' AND m.nombre = 'Algebra Lineal';
INSERT INTO tutor_materias (id_tutor, id_materia, nivel_experiencia)
 SELECT t.id_tutor, m.id_materia, 'EXPERTO' FROM tutores t, usuarios u, materias m
 WHERE t.id_usuario = u.id_usuario AND u.email = 'laura.martinez@tutoresonline.com' AND m.nombre = 'Fisica Mecanica';
INSERT INTO tutor_materias (id_tutor, id_materia, nivel_experiencia)
 SELECT t.id_tutor, m.id_materia, 'EXPERTO' FROM tutores t, usuarios u, materias m
 WHERE t.id_usuario = u.id_usuario AND u.email = 'carlos.ramirez@tutoresonline.com' AND m.nombre = 'Programacion en Python';
INSERT INTO tutor_materias (id_tutor, id_materia, nivel_experiencia)
 SELECT t.id_tutor, m.id_materia, 'AVANZADO' FROM tutores t, usuarios u, materias m
 WHERE t.id_usuario = u.id_usuario AND u.email = 'carlos.ramirez@tutoresonline.com' AND m.nombre = 'Circuitos Electricos I';

-- ---------------------------------------------------------------------
-- DISPONIBILIDAD
-- ---------------------------------------------------------------------
INSERT INTO disponibilidad (id_tutor, dia_semana, hora_inicio, hora_fin, modalidad)
 SELECT t.id_tutor, 'LUNES', '15:00', '18:00', 'AMBAS' FROM tutores t, usuarios u
 WHERE t.id_usuario = u.id_usuario AND u.email = 'laura.martinez@tutoresonline.com';
INSERT INTO disponibilidad (id_tutor, dia_semana, hora_inicio, hora_fin, modalidad)
 SELECT t.id_tutor, 'MIERCOLES', '15:00', '18:00', 'VIRTUAL' FROM tutores t, usuarios u
 WHERE t.id_usuario = u.id_usuario AND u.email = 'laura.martinez@tutoresonline.com';
INSERT INTO disponibilidad (id_tutor, dia_semana, hora_inicio, hora_fin, modalidad)
 SELECT t.id_tutor, 'MARTES', '18:00', '21:00', 'VIRTUAL' FROM tutores t, usuarios u
 WHERE t.id_usuario = u.id_usuario AND u.email = 'carlos.ramirez@tutoresonline.com';
INSERT INTO disponibilidad (id_tutor, dia_semana, hora_inicio, hora_fin, modalidad)
 SELECT t.id_tutor, 'JUEVES', '18:00', '21:00', 'VIRTUAL' FROM tutores t, usuarios u
 WHERE t.id_usuario = u.id_usuario AND u.email = 'carlos.ramirez@tutoresonline.com';

-- ---------------------------------------------------------------------
-- RESERVAS (una pendiente, una aceptada futura, una completada pasada)
-- ---------------------------------------------------------------------
INSERT INTO reservas (id_estudiante, id_tutor, id_materia, fecha_sesion, hora_inicio, hora_fin, modalidad, enlace_virtual, estado, comentario_estudiante)
 SELECT e.id_estudiante, t.id_tutor, m.id_materia, TRUNC(SYSDATE) + 3, '15:00', '16:00', 'VIRTUAL',
        'https://meet.tutoresonline.com/sala-demo-1', 'PENDIENTE', 'Necesito ayuda con derivadas para el parcial.'
 FROM estudiantes e, usuarios ue, tutores t, usuarios ut, materias m
 WHERE e.id_usuario = ue.id_usuario AND ue.email = 'juan.perez@estudiante.com'
   AND t.id_usuario = ut.id_usuario AND ut.email = 'laura.martinez@tutoresonline.com'
   AND m.nombre = 'Calculo I';

INSERT INTO reservas (id_estudiante, id_tutor, id_materia, fecha_sesion, hora_inicio, hora_fin, modalidad, enlace_virtual, estado)
 SELECT e.id_estudiante, t.id_tutor, m.id_materia, TRUNC(SYSDATE) + 7, '18:00', '19:00', 'VIRTUAL',
        'https://meet.tutoresonline.com/sala-demo-2', 'ACEPTADA'
 FROM estudiantes e, usuarios ue, tutores t, usuarios ut, materias m
 WHERE e.id_usuario = ue.id_usuario AND ue.email = 'maria.gomez@estudiante.com'
   AND t.id_usuario = ut.id_usuario AND ut.email = 'carlos.ramirez@tutoresonline.com'
   AND m.nombre = 'Programacion en Python';

INSERT INTO reservas (id_estudiante, id_tutor, id_materia, fecha_sesion, hora_inicio, hora_fin, modalidad, estado)
 SELECT e.id_estudiante, t.id_tutor, m.id_materia, TRUNC(SYSDATE) - 10, '15:00', '16:00', 'PRESENCIAL', 'COMPLETADA'
 FROM estudiantes e, usuarios ue, tutores t, usuarios ut, materias m
 WHERE e.id_usuario = ue.id_usuario AND ue.email = 'juan.perez@estudiante.com'
   AND t.id_usuario = ut.id_usuario AND ut.email = 'laura.martinez@tutoresonline.com'
   AND m.nombre = 'Fisica Mecanica';

-- Ubicacion para la reserva presencial completada
UPDATE reservas SET ubicacion = 'Biblioteca CUC, sala de estudio 4'
 WHERE modalidad = 'PRESENCIAL' AND estado = 'COMPLETADA';

-- ---------------------------------------------------------------------
-- CALIFICACIONES (solo sobre la reserva COMPLETADA)
-- ---------------------------------------------------------------------
INSERT INTO calificaciones (id_reserva, id_estudiante, id_tutor, puntuacion, comentario)
 SELECT r.id_reserva, r.id_estudiante, r.id_tutor, 5, 'Excelente explicacion, muy paciente y clara.'
 FROM reservas r WHERE r.estado = 'COMPLETADA';

-- ---------------------------------------------------------------------
-- NOTIFICACIONES
-- ---------------------------------------------------------------------
INSERT INTO notificaciones (id_usuario, id_reserva, tipo, mensaje)
 SELECT ut.id_usuario, r.id_reserva, 'NUEVA_SOLICITUD', 'Tienes una nueva solicitud de tutoria pendiente por responder.'
 FROM reservas r
 JOIN tutores t ON t.id_tutor = r.id_tutor
 JOIN usuarios ut ON ut.id_usuario = t.id_usuario
 WHERE r.estado = 'PENDIENTE';

INSERT INTO notificaciones (id_usuario, id_reserva, tipo, mensaje)
 SELECT ue.id_usuario, r.id_reserva, 'RESERVA_ACEPTADA', 'Tu tutoria fue aceptada. Revisa la fecha y el enlace de la sesion.'
 FROM reservas r
 JOIN estudiantes e ON e.id_estudiante = r.id_estudiante
 JOIN usuarios ue ON ue.id_usuario = e.id_usuario
 WHERE r.estado = 'ACEPTADA';

COMMIT;
