const reservasModel = require("../models/reservasModel");
const notificacionesModel = require("../models/notificacionesModel");
const estudiantesModel = require("../models/estudiantesModel");
const tutoresModel = require("../models/tutoresModel");
const { HttpError, asyncHandler } = require("../utils/httpError");

function mapReserva(r) {
  return {
    id: r.ID_RESERVA,
    idEstudiante: r.ID_ESTUDIANTE,
    idTutor: r.ID_TUTOR,
    idMateria: r.ID_MATERIA,
    fechaSesion: r.FECHA_SESION,
    horaInicio: r.HORA_INICIO,
    horaFin: r.HORA_FIN,
    modalidad: r.MODALIDAD,
    enlaceVirtual: r.ENLACE_VIRTUAL,
    ubicacion: r.UBICACION,
    estado: r.ESTADO,
    comentarioEstudiante: r.COMENTARIO_ESTUDIANTE,
    motivoRechazo: r.MOTIVO_RECHAZO,
    fechaSolicitud: r.FECHA_SOLICITUD,
    estudianteNombre: r.ESTUDIANTE_NOMBRE,
    tutorNombre: r.TUTOR_NOMBRE,
    materiaNombre: r.MATERIA_NOMBRE,
  };
}

const crear = asyncHandler(async (req, res) => {
  const { idEstudiante, idTutor, idMateria, fechaSesion, horaInicio, horaFin, modalidad, ubicacion, comentarioEstudiante } = req.body;

  const estudiantePropio = await estudiantesModel.buscarPorUsuario(req.usuario.id);
  if (!estudiantePropio || estudiantePropio.ID_ESTUDIANTE !== Number(idEstudiante)) {
    throw new HttpError(403, "Solo puedes crear reservas para tu propia cuenta de estudiante.");
  }
  if (!idTutor || !idMateria || !fechaSesion || !horaInicio || !horaFin || !modalidad) {
    throw new HttpError(400, "Faltan datos obligatorios para la reserva.");
  }

  const conflicto = await reservasModel.existeConflicto({ idTutor, fechaSesion, horaInicio });
  if (conflicto) throw new HttpError(409, "Ese horario ya fue reservado. Elige otra franja disponible.");

  const id = await reservasModel.crear({ idEstudiante, idTutor, idMateria, fechaSesion, horaInicio, horaFin, modalidad, ubicacion, comentarioEstudiante });

  const tutor = await tutoresModel.buscarPorId(idTutor);
  if (tutor) {
    await notificacionesModel.crear({
      idUsuario: tutor.ID_USUARIO, idReserva: id, tipo: "NUEVA_SOLICITUD",
      mensaje: "Tienes una nueva solicitud de tutoria pendiente por responder.",
    });
  }

  const creada = await reservasModel.buscarPorId(id);
  res.status(201).json(mapReserva(creada));
});

const listar = asyncHandler(async (req, res) => {
  const { idEstudiante, idTutor } = req.query;

  if (idEstudiante) {
    const propio = await estudiantesModel.buscarPorUsuario(req.usuario.id);
    if (!propio || propio.ID_ESTUDIANTE !== Number(idEstudiante)) throw new HttpError(403, "No autorizado.");
    const filas = await reservasModel.listarPorEstudiante(Number(idEstudiante));
    return res.json(filas.map(mapReserva));
  }

  if (idTutor) {
    const propio = await tutoresModel.buscarPorUsuario(req.usuario.id);
    if (!propio || propio.ID_TUTOR !== Number(idTutor)) throw new HttpError(403, "No autorizado.");
    const filas = await reservasModel.listarPorTutor(Number(idTutor));
    return res.json(filas.map(mapReserva));
  }

  throw new HttpError(400, "Debes indicar idEstudiante o idTutor.");
});

const actualizarEstado = asyncHandler(async (req, res) => {
  const idReserva = Number(req.params.id);
  const { estado, motivo, enlaceVirtual } = req.body;

  if (!["ACEPTADA", "RECHAZADA", "CANCELADA", "COMPLETADA"].includes(estado)) {
    throw new HttpError(400, "Estado invalido.");
  }

  const reserva = await reservasModel.buscarPorId(idReserva);
  if (!reserva) throw new HttpError(404, "Reserva no encontrada.");

  const tutorPropio = await tutoresModel.buscarPorUsuario(req.usuario.id);
  const estudiantePropio = await estudiantesModel.buscarPorUsuario(req.usuario.id);
  const esTutorDeLaReserva = tutorPropio && tutorPropio.ID_TUTOR === reserva.ID_TUTOR;
  const esEstudianteDeLaReserva = estudiantePropio && estudiantePropio.ID_ESTUDIANTE === reserva.ID_ESTUDIANTE;

  if (estado === "CANCELADA" && !esEstudianteDeLaReserva) throw new HttpError(403, "Solo el estudiante puede cancelar su reserva.");
  if (["ACEPTADA", "RECHAZADA", "COMPLETADA"].includes(estado) && !esTutorDeLaReserva) {
    throw new HttpError(403, "Solo el tutor puede cambiar este estado.");
  }

  await reservasModel.actualizarEstado(idReserva, estado, motivo, enlaceVirtual);

  if (esTutorDeLaReserva) {
    const mensaje = estado === "ACEPTADA" ? "Tu tutoria fue aceptada. Revisa la fecha y los detalles."
      : estado === "RECHAZADA" ? "Tu solicitud de tutoria fue rechazada."
      : `El estado de tu reserva cambio a ${estado}.`;
    const estudiante = await estudiantesModel.buscarPorId(reserva.ID_ESTUDIANTE);
    if (estudiante) {
      await notificacionesModel.crear({ idUsuario: estudiante.ID_USUARIO, idReserva, tipo: "ESTADO_RESERVA", mensaje });
    }
  }

  const actualizada = await reservasModel.buscarPorId(idReserva);
  res.json(mapReserva(actualizada));
});

module.exports = { crear, listar, actualizarEstado, mapReserva };
