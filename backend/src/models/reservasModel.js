const oracledb = require("oracledb");
const db = require("../config/db");

const SELECT_BASE = `
  SELECT r.id_reserva, r.id_estudiante, r.id_tutor, r.id_materia, r.fecha_sesion, r.hora_inicio, r.hora_fin,
         r.modalidad, r.enlace_virtual, r.ubicacion, r.estado, r.comentario_estudiante, r.motivo_rechazo,
         r.fecha_solicitud,
         ue.nombre || ' ' || ue.apellido AS estudiante_nombre,
         ut.nombre || ' ' || ut.apellido AS tutor_nombre,
         m.nombre AS materia_nombre
  FROM reservas r
  JOIN estudiantes e ON e.id_estudiante = r.id_estudiante
  JOIN usuarios ue ON ue.id_usuario = e.id_usuario
  JOIN tutores t ON t.id_tutor = r.id_tutor
  JOIN usuarios ut ON ut.id_usuario = t.id_usuario
  JOIN materias m ON m.id_materia = r.id_materia
`;

async function existeConflicto({ idTutor, fechaSesion, horaInicio }) {
  const result = await db.query(
    `SELECT COUNT(*) AS total FROM reservas
     WHERE id_tutor = :idTutor AND fecha_sesion = TO_DATE(:fechaSesion, 'YYYY-MM-DD')
       AND hora_inicio = :horaInicio AND estado IN ('PENDIENTE','ACEPTADA')`,
    { idTutor, fechaSesion, horaInicio }
  );
  return result.rows[0].TOTAL > 0;
}

async function crear({ idEstudiante, idTutor, idMateria, fechaSesion, horaInicio, horaFin, modalidad, ubicacion, comentarioEstudiante }) {
  const result = await db.query(
    `INSERT INTO reservas (id_estudiante, id_tutor, id_materia, fecha_sesion, hora_inicio, hora_fin, modalidad, ubicacion, comentario_estudiante)
     VALUES (:idEstudiante, :idTutor, :idMateria, TO_DATE(:fechaSesion,'YYYY-MM-DD'), :horaInicio, :horaFin, :modalidad, :ubicacion, :comentarioEstudiante)
     RETURNING id_reserva INTO :id`,
    {
      idEstudiante, idTutor, idMateria, fechaSesion, horaInicio, horaFin, modalidad,
      ubicacion: ubicacion || null, comentarioEstudiante: comentarioEstudiante || null,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  return result.outBinds.id[0];
}

async function buscarPorId(id) {
  const result = await db.query(`${SELECT_BASE} WHERE r.id_reserva = :id`, { id });
  return result.rows[0] || null;
}

async function listarPorEstudiante(idEstudiante) {
  const result = await db.query(`${SELECT_BASE} WHERE r.id_estudiante = :idEstudiante ORDER BY r.fecha_sesion DESC`, { idEstudiante });
  return result.rows;
}

async function listarPorTutor(idTutor) {
  const result = await db.query(`${SELECT_BASE} WHERE r.id_tutor = :idTutor ORDER BY r.fecha_sesion DESC`, { idTutor });
  return result.rows;
}

async function actualizarEstado(id, estado, motivo, enlaceVirtual) {
  await db.query(
    `UPDATE reservas SET estado = :estado,
            motivo_rechazo = NVL(:motivo, motivo_rechazo),
            enlace_virtual = NVL(:enlace, enlace_virtual)
     WHERE id_reserva = :id`,
    { estado, motivo: motivo || null, enlace: enlaceVirtual || null, id }
  );
}

module.exports = { existeConflicto, crear, buscarPorId, listarPorEstudiante, listarPorTutor, actualizarEstado };
