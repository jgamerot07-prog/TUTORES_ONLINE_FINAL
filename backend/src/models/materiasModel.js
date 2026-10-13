const db = require("../config/db");

async function listar() {
  const result = await db.query(`SELECT id_materia, nombre, area, descripcion FROM materias ORDER BY nombre`);
  return result.rows;
}

module.exports = { listar };
