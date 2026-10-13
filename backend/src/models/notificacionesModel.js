const oracledb = require("oracledb");
const db = require("../config/db");

async function crear({ idUsuario, idReserva, tipo, mensaje }) {
  const result = await db.query(
    `INSERT INTO notificaciones (id_usuario, id_reserva, tipo, mensaje)
     VALUES (:idUsuario, :idReserva, :tipo, :mensaje)
     RETURNING id_notificacion INTO :id`,
    {
      idUsuario, idReserva: idReserva || null, tipo, mensaje,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  return result.outBinds.id[0];
}

async function listarPorUsuario(idUsuario) {
  const result = await db.query(
    `SELECT id_notificacion, id_usuario, id_reserva, tipo, mensaje, leida, fecha_creacion
     FROM notificaciones WHERE id_usuario = :idUsuario ORDER BY fecha_creacion DESC`,
    { idUsuario }
  );
  return result.rows;
}

async function marcarLeida(id) {
  await db.query(`UPDATE notificaciones SET leida = 'S' WHERE id_notificacion = :id`, { id });
}

module.exports = { crear, listarPorUsuario, marcarLeida };
