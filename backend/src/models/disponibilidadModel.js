const oracledb = require("oracledb");
const db = require("../config/db");

async function listarPorTutor(idTutor) {
  const result = await db.query(
    `SELECT id_disponibilidad, id_tutor, dia_semana, hora_inicio, hora_fin, modalidad, activo
     FROM disponibilidad WHERE id_tutor = :idTutor AND activo = 'S'
     ORDER BY DECODE(dia_semana,'LUNES',1,'MARTES',2,'MIERCOLES',3,'JUEVES',4,'VIERNES',5,'SABADO',6,'DOMINGO',7), hora_inicio`,
    { idTutor }
  );
  return result.rows;
}

async function crear({ idTutor, diaSemana, horaInicio, horaFin, modalidad }) {
  const result = await db.query(
    `INSERT INTO disponibilidad (id_tutor, dia_semana, hora_inicio, hora_fin, modalidad)
     VALUES (:idTutor, :diaSemana, :horaInicio, :horaFin, :modalidad)
     RETURNING id_disponibilidad INTO :id`,
    {
      idTutor, diaSemana, horaInicio, horaFin, modalidad: modalidad || "AMBAS",
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  return result.outBinds.id[0];
}

async function eliminar(id, idTutor) {
  const result = await db.query(
    `DELETE FROM disponibilidad WHERE id_disponibilidad = :id AND id_tutor = :idTutor`,
    { id, idTutor }
  );
  return result.rowsAffected > 0;
}

module.exports = { listarPorTutor, crear, eliminar };
