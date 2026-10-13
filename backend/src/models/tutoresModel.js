const oracledb = require("oracledb");
const db = require("../config/db");

async function crear({ idUsuario, biografia, aniosExperiencia, tarifaHora, modalidad, ciudad, materias }) {
  const result = await db.query(
    `INSERT INTO tutores (id_usuario, biografia, anios_experiencia, tarifa_hora, modalidad, ciudad)
     VALUES (:idUsuario, :biografia, :aniosExperiencia, :tarifaHora, :modalidad, :ciudad)
     RETURNING id_tutor INTO :id`,
    {
      idUsuario, biografia: biografia || null, aniosExperiencia: aniosExperiencia || 0,
      tarifaHora: tarifaHora || 0, modalidad: modalidad || "AMBAS", ciudad: ciudad || null,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  const idTutor = result.outBinds.id[0];

  if (Array.isArray(materias) && materias.length) {
    for (const idMateria of materias) {
      await db.query(
        `INSERT INTO tutor_materias (id_tutor, id_materia) VALUES (:idTutor, :idMateria)`,
        { idTutor, idMateria }
      );
    }
  }
  return idTutor;
}

async function buscarPorUsuario(idUsuario) {
  const result = await db.query(
    `SELECT t.id_tutor, t.id_usuario, t.biografia, t.anios_experiencia, t.tarifa_hora,
            t.modalidad, t.ciudad, t.verificado, t.calificacion_promedio, t.total_resenas,
            u.nombre, u.apellido, u.email, u.telefono
     FROM tutores t JOIN usuarios u ON u.id_usuario = t.id_usuario
     WHERE t.id_usuario = :idUsuario`,
    { idUsuario }
  );
  return result.rows[0] || null;
}

async function listarMateriasDeTutor(idTutor) {
  const result = await db.query(
    `SELECT m.id_materia, m.nombre, m.area, m.descripcion, tm.nivel_experiencia
     FROM tutor_materias tm JOIN materias m ON m.id_materia = tm.id_materia
     WHERE tm.id_tutor = :idTutor`,
    { idTutor }
  );
  return result.rows;
}

async function buscar(filtros) {
  const condiciones = [];
  const binds = {};

  let sql = `
    SELECT DISTINCT t.id_tutor, t.id_usuario, t.biografia, t.anios_experiencia, t.tarifa_hora,
           t.modalidad, t.ciudad, t.verificado, t.calificacion_promedio, t.total_resenas,
           u.nombre, u.apellido
    FROM tutores t
    JOIN usuarios u ON u.id_usuario = t.id_usuario
    LEFT JOIN tutor_materias tm ON tm.id_tutor = t.id_tutor
    LEFT JOIN materias m ON m.id_materia = tm.id_materia
    WHERE u.estado = 'ACTIVO'
  `;

  if (filtros.q) {
    condiciones.push(`(LOWER(u.nombre || ' ' || u.apellido) LIKE :q OR LOWER(m.nombre) LIKE :q)`);
    binds.q = `%${filtros.q.toLowerCase()}%`;
  }
  if (filtros.materiaId) {
    condiciones.push(`EXISTS (SELECT 1 FROM tutor_materias tm2 WHERE tm2.id_tutor = t.id_tutor AND tm2.id_materia = :materiaId)`);
    binds.materiaId = Number(filtros.materiaId);
  }
  if (filtros.modalidad) {
    condiciones.push(`(t.modalidad = :modalidad OR t.modalidad = 'AMBAS')`);
    binds.modalidad = filtros.modalidad;
  }
  if (filtros.ciudad) {
    condiciones.push(`LOWER(t.ciudad) LIKE :ciudad`);
    binds.ciudad = `%${filtros.ciudad.toLowerCase()}%`;
  }

  if (condiciones.length) sql += " AND " + condiciones.join(" AND ");

  if (filtros.ordenar === "precio_asc") sql += " ORDER BY t.tarifa_hora ASC";
  else if (filtros.ordenar === "precio_desc") sql += " ORDER BY t.tarifa_hora DESC";
  else sql += " ORDER BY t.calificacion_promedio DESC";

  const result = await db.query(sql, binds);

  const tutores = [];
  for (const row of result.rows) {
    const materias = await listarMateriasDeTutor(row.ID_TUTOR);
    tutores.push({ ...row, MATERIAS: materias });
  }
  return tutores;
}

async function buscarPorId(idTutor) {
  const result = await db.query(
    `SELECT t.id_tutor, t.id_usuario, t.biografia, t.anios_experiencia, t.tarifa_hora,
            t.modalidad, t.ciudad, t.verificado, t.calificacion_promedio, t.total_resenas,
            u.nombre, u.apellido, u.email, u.telefono
     FROM tutores t JOIN usuarios u ON u.id_usuario = t.id_usuario
     WHERE t.id_tutor = :idTutor`,
    { idTutor }
  );
  return result.rows[0] || null;
}

async function actualizar(idTutor, { biografia, tarifaHora, modalidad, ciudad }) {
  await db.query(
    `UPDATE tutores SET biografia = :biografia, tarifa_hora = :tarifaHora, modalidad = :modalidad, ciudad = :ciudad
     WHERE id_tutor = :idTutor`,
    { biografia, tarifaHora, modalidad, ciudad, idTutor }
  );
}

async function recalcularCalificacion(idTutor) {
  await db.query(
    `UPDATE tutores t SET
       calificacion_promedio = (SELECT NVL(ROUND(AVG(puntuacion), 2), 0) FROM calificaciones WHERE id_tutor = :idTutor1),
       total_resenas = (SELECT COUNT(*) FROM calificaciones WHERE id_tutor = :idTutor2)
     WHERE t.id_tutor = :idTutor3`,
    { idTutor1: idTutor, idTutor2: idTutor, idTutor3: idTutor }
  );
}

module.exports = {
  crear, buscarPorUsuario, listarMateriasDeTutor, buscar, buscarPorId, actualizar, recalcularCalificacion,
};
