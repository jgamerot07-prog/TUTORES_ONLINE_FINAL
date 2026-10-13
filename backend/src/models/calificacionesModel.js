const oracledb = require("oracledb");
const db = require("../config/db");

async function existePorReserva(idReserva) {
  const result = await db.query(`SELECT COUNT(*) AS total FROM calificaciones WHERE id_reserva = :idReserva`, { idReserva });
  return result.rows[0].TOTAL > 0;
}

async function crear({ idReserva, idEstudiante, idTutor, puntuacion, comentario }) {
  const result = await db.query(
    `INSERT INTO calificaciones (id_reserva, id_estudiante, id_tutor, puntuacion, comentario)
     VALUES (:idReserva, :idEstudiante, :idTutor, :puntuacion, :comentario)
     RETURNING id_calificacion INTO :id`,
    {
      idReserva, idEstudiante, idTutor, puntuacion, comentario: comentario || null,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  return result.outBinds.id[0];
}

async function listarPorTutor(idTutor) {
  const result = await db.query(
    `SELECT c.id_calificacion, c.puntuacion, c.comentario, c.fecha_creacion,
            ue.nombre || ' ' || SUBSTR(ue.apellido,1,1) || '.' AS estudiante_nombre
     FROM calificaciones c
     JOIN estudiantes e ON e.id_estudiante = c.id_estudiante
     JOIN usuarios ue ON ue.id_usuario = e.id_usuario
     WHERE c.id_tutor = :idTutor ORDER BY c.fecha_creacion DESC`,
    { idTutor }
  );
  return result.rows;
}

module.exports = { existePorReserva, crear, listarPorTutor };
