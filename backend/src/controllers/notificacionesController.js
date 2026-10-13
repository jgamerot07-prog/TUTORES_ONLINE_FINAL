const notificacionesModel = require("../models/notificacionesModel");
const { HttpError, asyncHandler } = require("../utils/httpError");

const listar = asyncHandler(async (req, res) => {
  const idUsuario = Number(req.query.idUsuario);
  if (!idUsuario) throw new HttpError(400, "Debes indicar idUsuario.");
  if (req.usuario.id !== idUsuario) throw new HttpError(403, "No autorizado.");

  const filas = await notificacionesModel.listarPorUsuario(idUsuario);
  res.json(filas.map((n) => ({
    id: n.ID_NOTIFICACION, idUsuario: n.ID_USUARIO, idReserva: n.ID_RESERVA,
    tipo: n.TIPO, mensaje: n.MENSAJE, leida: n.LEIDA === "S", fecha: n.FECHA_CREACION,
  })));
});

const marcarLeida = asyncHandler(async (req, res) => {
  await notificacionesModel.marcarLeida(Number(req.params.id));
  res.json({ ok: true });
});

module.exports = { listar, marcarLeida };
