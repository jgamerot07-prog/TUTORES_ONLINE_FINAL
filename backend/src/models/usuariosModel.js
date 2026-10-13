const oracledb = require("oracledb");
const db = require("../config/db");

async function buscarPorEmail(email) {
  const result = await db.query(
    `SELECT id_usuario, nombre, apellido, email, password_hash, telefono, rol, estado, fecha_registro
     FROM usuarios WHERE LOWER(email) = LOWER(:email)`,
    { email }
  );
  return result.rows[0] || null;
}

async function buscarPorId(id) {
  const result = await db.query(
    `SELECT id_usuario, nombre, apellido, email, telefono, rol, estado, fecha_registro
     FROM usuarios WHERE id_usuario = :id`,
    { id }
  );
  return result.rows[0] || null;
}

async function crear({ nombre, apellido, email, passwordHash, telefono, rol }) {
  const result = await db.query(
    `INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol)
     VALUES (:nombre, :apellido, :email, :passwordHash, :telefono, :rol)
     RETURNING id_usuario INTO :id`,
    {
      nombre, apellido, email, passwordHash, telefono, rol,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  return result.outBinds.id[0];
}

module.exports = { buscarPorEmail, buscarPorId, crear };
