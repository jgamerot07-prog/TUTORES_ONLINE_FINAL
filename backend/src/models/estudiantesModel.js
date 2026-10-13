const oracledb = require("oracledb");
const db = require("../config/db");

async function crear({ idUsuario, nivelEducativo, institucion }) {
  const result = await db.query(
    `INSERT INTO estudiantes (id_usuario, nivel_educativo, institucion)
     VALUES (:idUsuario, :nivelEducativo, :institucion)
     RETURNING id_estudiante INTO :id`,
    {
      idUsuario, nivelEducativo, institucion,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  return result.outBinds.id[0];
}

async function buscarPorId(idEstudiante) {
  const result = await db.query(
    `SELECT id_estudiante, id_usuario, nivel_educativo, institucion FROM estudiantes WHERE id_estudiante = :idEstudiante`,
    { idEstudiante }
  );
  return result.rows[0] || null;
}

async function buscarPorUsuario(idUsuario) {
  const result = await db.query(
    `SELECT id_estudiante, id_usuario, nivel_educativo, institucion FROM estudiantes WHERE id_usuario = :idUsuario`,
    { idUsuario }
  );
  return result.rows[0] || null;
}

async function actualizar(idEstudiante, { nivelEducativo, institucion }) {
  await db.query(
    `UPDATE estudiantes SET nivel_educativo = :nivelEducativo, institucion = :institucion WHERE id_estudiante = :idEstudiante`,
    { nivelEducativo, institucion, idEstudiante }
  );
}

module.exports = { crear, buscarPorId, buscarPorUsuario, actualizar };
