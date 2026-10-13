const calificacionesModel = require("../models/calificacionesModel");
const reservasModel = require("../models/reservasModel");
const tutoresModel = require("../models/tutoresModel");
const estudiantesModel = require("../models/estudiantesModel");
const { HttpError, asyncHandler } = require("../utils/httpError");

const crear = asyncHandler(async (req, res) => {
  const { idReserva, idEstudiante, idTutor, puntuacion, comentario } = req.body;

  if (!puntuacion || puntuacion < 1 || puntuacion > 5) throw new HttpError(400, "La puntuacion debe estar entre 1 y 5.");

  const estudiantePropio = await estudiantesModel.buscarPorUsuario(req.usuario.id);
  if (!estudiantePropio || estudiantePropio.ID_ESTUDIANTE !== Number(idEstudiante)) {
    throw new HttpError(403, "Solo puedes calificar tus propias tutorias.");
  }

  const reserva = await reservasModel.buscarPorId(idReserva);
  if (!reserva || reserva.ID_ESTUDIANTE !== Number(idEstudiante)) throw new HttpError(404, "Reserva no encontrada.");
  if (reserva.ESTADO !== "COMPLETADA") throw new HttpError(400, "Solo puedes calificar tutorias completadas.");

  const yaCalificada = await calificacionesModel.existePorReserva(idReserva);
  if (yaCalificada) throw new HttpError(409, "Esta reserva ya fue calificada.");

  const id = await calificacionesModel.crear({ idReserva, idEstudiante, idTutor, puntuacion, comentario });
  await tutoresModel.recalcularCalificacion(idTutor);

  res.status(201).json({ id, idReserva, idEstudiante, idTutor, puntuacion, comentario });
});

module.exports = { crear };
