-- =====================================================================
-- Tutores On-Line | Modelo de datos — Oracle Database / Oracle APEX
-- Script 1 de 4: creacion de tablas, claves primarias, foraneas y CHECK
-- Compatible con Oracle 12c+ (IDENTITY columns)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. USUARIOS: tabla raiz de cualquier persona registrada en la plataforma
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id_usuario       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre           VARCHAR2(80)  NOT NULL,
    apellido         VARCHAR2(80)  NOT NULL,
    email            VARCHAR2(150) NOT NULL,
    password_hash    VARCHAR2(255) NOT NULL,
    telefono         VARCHAR2(20),
    rol              VARCHAR2(10)  NOT NULL,
    estado           VARCHAR2(10)  DEFAULT 'ACTIVO' NOT NULL,
    foto_url         VARCHAR2(255),
    fecha_registro   TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT uq_usuarios_email UNIQUE (email),
    CONSTRAINT ck_usuarios_rol   CHECK (rol IN ('ESTUDIANTE', 'TUTOR', 'ADMIN')),
    CONSTRAINT ck_usuarios_estado CHECK (estado IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO'))
);

COMMENT ON TABLE usuarios IS 'Cuenta base de cualquier persona registrada (estudiante, tutor o admin).';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash bcrypt de la contrasena. Nunca se almacena en texto plano.';

-- ---------------------------------------------------------------------
-- 2. ESTUDIANTES: extension 1-a-1 de USUARIOS con rol ESTUDIANTE
-- ---------------------------------------------------------------------
CREATE TABLE estudiantes (
    id_estudiante     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario        NUMBER NOT NULL,
    nivel_educativo   VARCHAR2(40),
    institucion       VARCHAR2(120),
    CONSTRAINT uq_estudiantes_usuario UNIQUE (id_usuario),
    CONSTRAINT fk_estudiantes_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    CONSTRAINT ck_estudiantes_nivel CHECK (
        nivel_educativo IN ('COLEGIO', 'PREGRADO', 'POSGRADO', 'OTRO') OR nivel_educativo IS NULL
    )
);

COMMENT ON TABLE estudiantes IS 'Atributos propios de un usuario con rol estudiante.';

-- ---------------------------------------------------------------------
-- 3. TUTORES: extension 1-a-1 de USUARIOS con rol TUTOR
-- ---------------------------------------------------------------------
CREATE TABLE tutores (
    id_tutor              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario            NUMBER NOT NULL,
    biografia             CLOB,
    anios_experiencia     NUMBER(3) DEFAULT 0,
    tarifa_hora           NUMBER(10,2) DEFAULT 0,
    modalidad             VARCHAR2(12) DEFAULT 'AMBAS' NOT NULL,
    ciudad                VARCHAR2(80),
    verificado            CHAR(1) DEFAULT 'N' NOT NULL,
    calificacion_promedio NUMBER(3,2) DEFAULT 0,
    total_resenas         NUMBER DEFAULT 0,
    CONSTRAINT uq_tutores_usuario UNIQUE (id_usuario),
    CONSTRAINT fk_tutores_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    CONSTRAINT ck_tutores_modalidad CHECK (modalidad IN ('VIRTUAL', 'PRESENCIAL', 'AMBAS')),
    CONSTRAINT ck_tutores_verificado CHECK (verificado IN ('S', 'N')),
    CONSTRAINT ck_tutores_calif CHECK (calificacion_promedio BETWEEN 0 AND 5)
);

COMMENT ON TABLE tutores IS 'Atributos propios de un usuario con rol tutor: perfil, tarifa y reputacion agregada.';

-- ---------------------------------------------------------------------
-- 4. MATERIAS: catalogo de asignaturas
-- ---------------------------------------------------------------------
CREATE TABLE materias (
    id_materia     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre         VARCHAR2(100) NOT NULL,
    area           VARCHAR2(60),
    descripcion    VARCHAR2(500),
    CONSTRAINT uq_materias_nombre UNIQUE (nombre)
);

COMMENT ON TABLE materias IS 'Catalogo de asignaturas que pueden ser ensenadas en la plataforma.';

-- ---------------------------------------------------------------------
-- 5. TUTOR_MATERIAS: especialidades del tutor (N-a-N tutores <-> materias)
-- ---------------------------------------------------------------------
CREATE TABLE tutor_materias (
    id_tutor            NUMBER NOT NULL,
    id_materia          NUMBER NOT NULL,
    nivel_experiencia   VARCHAR2(15) DEFAULT 'INTERMEDIO',
    CONSTRAINT pk_tutor_materias PRIMARY KEY (id_tutor, id_materia),
    CONSTRAINT fk_tm_tutor FOREIGN KEY (id_tutor)
        REFERENCES tutores (id_tutor) ON DELETE CASCADE,
    CONSTRAINT fk_tm_materia FOREIGN KEY (id_materia)
        REFERENCES materias (id_materia) ON DELETE CASCADE,
    CONSTRAINT ck_tm_nivel CHECK (nivel_experiencia IN ('BASICO', 'INTERMEDIO', 'AVANZADO', 'EXPERTO'))
);

COMMENT ON TABLE tutor_materias IS 'Especialidades: que materias domina cada tutor y en que nivel.';

-- ---------------------------------------------------------------------
-- 6. DISPONIBILIDAD: franjas horarias que ofrece un tutor
-- ---------------------------------------------------------------------
CREATE TABLE disponibilidad (
    id_disponibilidad   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_tutor            NUMBER NOT NULL,
    dia_semana          VARCHAR2(10) NOT NULL,
    hora_inicio         VARCHAR2(5)  NOT NULL,  -- formato 'HH24:MI'
    hora_fin            VARCHAR2(5)  NOT NULL,
    modalidad           VARCHAR2(12) DEFAULT 'AMBAS' NOT NULL,
    activo              CHAR(1) DEFAULT 'S' NOT NULL,
    CONSTRAINT fk_disp_tutor FOREIGN KEY (id_tutor)
        REFERENCES tutores (id_tutor) ON DELETE CASCADE,
    CONSTRAINT ck_disp_dia CHECK (dia_semana IN
        ('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO')),
    CONSTRAINT ck_disp_modalidad CHECK (modalidad IN ('VIRTUAL', 'PRESENCIAL', 'AMBAS')),
    CONSTRAINT ck_disp_activo CHECK (activo IN ('S', 'N')),
    CONSTRAINT ck_disp_horas CHECK (hora_inicio < hora_fin)
);

COMMENT ON TABLE disponibilidad IS 'Franjas horarias recurrentes que un tutor ofrece por dia de la semana.';

-- ---------------------------------------------------------------------
-- 7. RESERVAS: solicitudes/reservas de tutoria
-- ---------------------------------------------------------------------
CREATE TABLE reservas (
    id_reserva          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_estudiante       NUMBER NOT NULL,
    id_tutor            NUMBER NOT NULL,
    id_materia          NUMBER NOT NULL,
    fecha_sesion        DATE         NOT NULL,
    hora_inicio         VARCHAR2(5)  NOT NULL,
    hora_fin            VARCHAR2(5)  NOT NULL,
    modalidad           VARCHAR2(12) NOT NULL,
    enlace_virtual      VARCHAR2(255),
    ubicacion           VARCHAR2(255),
    estado              VARCHAR2(12) DEFAULT 'PENDIENTE' NOT NULL,
    comentario_estudiante VARCHAR2(500),
    motivo_rechazo      VARCHAR2(300),
    fecha_solicitud     TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_res_estudiante FOREIGN KEY (id_estudiante)
        REFERENCES estudiantes (id_estudiante),
    CONSTRAINT fk_res_tutor FOREIGN KEY (id_tutor)
        REFERENCES tutores (id_tutor),
    CONSTRAINT fk_res_materia FOREIGN KEY (id_materia)
        REFERENCES materias (id_materia),
    CONSTRAINT ck_res_modalidad CHECK (modalidad IN ('VIRTUAL', 'PRESENCIAL')),
    CONSTRAINT ck_res_estado CHECK (estado IN
        ('PENDIENTE','ACEPTADA','RECHAZADA','CANCELADA','COMPLETADA')),
    CONSTRAINT ck_res_horas CHECK (hora_inicio < hora_fin)
);

COMMENT ON TABLE reservas IS 'Solicitud de tutoria entre un estudiante y un tutor, con estado y modalidad.';

-- Evita que un mismo tutor tenga dos reservas activas (pendiente/aceptada) a la misma hora
CREATE UNIQUE INDEX uq_reserva_tutor_horario ON reservas (
    id_tutor, fecha_sesion, hora_inicio,
    CASE WHEN estado IN ('PENDIENTE','ACEPTADA') THEN 1 ELSE NULL END
);

-- ---------------------------------------------------------------------
-- 8. CALIFICACIONES: resena de una reserva ya completada
-- ---------------------------------------------------------------------
CREATE TABLE calificaciones (
    id_calificacion    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_reserva         NUMBER NOT NULL,
    id_estudiante      NUMBER NOT NULL,
    id_tutor           NUMBER NOT NULL,
    puntuacion         NUMBER(2,1) NOT NULL,
    comentario         VARCHAR2(500),
    fecha_creacion     TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT uq_calificaciones_reserva UNIQUE (id_reserva),
    CONSTRAINT fk_calif_reserva FOREIGN KEY (id_reserva)
        REFERENCES reservas (id_reserva) ON DELETE CASCADE,
    CONSTRAINT fk_calif_estudiante FOREIGN KEY (id_estudiante)
        REFERENCES estudiantes (id_estudiante),
    CONSTRAINT fk_calif_tutor FOREIGN KEY (id_tutor)
        REFERENCES tutores (id_tutor),
    CONSTRAINT ck_calif_puntuacion CHECK (puntuacion BETWEEN 1 AND 5)
);

COMMENT ON TABLE calificaciones IS 'Calificacion y resena que un estudiante deja sobre una reserva completada.';

-- ---------------------------------------------------------------------
-- 9. NOTIFICACIONES: avisos sobre cambios de estado de una reserva
-- ---------------------------------------------------------------------
CREATE TABLE notificaciones (
    id_notificacion   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario        NUMBER NOT NULL,
    id_reserva        NUMBER,
    tipo              VARCHAR2(30) NOT NULL,
    mensaje           VARCHAR2(300) NOT NULL,
    leida             CHAR(1) DEFAULT 'N' NOT NULL,
    fecha_creacion    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_notif_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_notif_reserva FOREIGN KEY (id_reserva)
        REFERENCES reservas (id_reserva) ON DELETE CASCADE,
    CONSTRAINT ck_notif_leida CHECK (leida IN ('S', 'N'))
);

COMMENT ON TABLE notificaciones IS 'Avisos dirigidos a un usuario sobre eventos de sus reservas.';
