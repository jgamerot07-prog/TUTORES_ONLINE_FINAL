const tutoresModel = require("../models/tutoresModel");
const disponibilidadModel = require("../models/disponibilidadModel");
const calificacionesModel = require("../models/calificacionesModel");
const { HttpError, asyncHandler } = require("../utils/httpError");

function mapMateria(m) {
  return { id: m.ID_MATERIA, nombre: m.NOMBRE, area: m.AREA, descripcion: m.DESCRIPCION };
}

function mapTutor(row) {
  return {
    id: row.ID_TUTOR,
    idUsuario: row.ID_USUARIO,
    nombre: `${row.NOMBRE} ${row.APELLIDO}`,
    email: row.EMAIL,
    telefono: row.TELEFONO,
    biografia: row.BIOGRAFIA,
    aniosExperiencia: row.ANIOS_EXPERIENCIA,
    tarifaHora: row.TARIFA_HORA,
    modalidad: row.MODALIDAD,
    ciudad: row.CIUDAD,
    verificado: row.VERIFICADO === "S",
    calificacionPromedio: row.CALIFICACION_PROMEDIO,
    totalResenas: row.TOTAL_RESENAS,
    materias: (row.MATERIAS || []).map((m) => m.ID_MATERIA),
    materiasDetalle: (row.MATERIAS || []).map(mapMateria),
  };
}

const listar = asyncHandler(async (req, res) => {
  const filas = await tutoresModel.buscar(req.query);
  res.json(filas.map(mapTutor));
});

const obtenerPorId = asyncHandler(async (req, res) => {
  const idTutor = Number(req.params.id);
  const row = await tutoresModel.buscarPorId(idTutor);
  if (!row) throw new HttpError(404, "Tutor no encontrado.");

  const materias = await tutoresModel.listarMateriasDeTutor(idTutor);
  const disponibilidad = await disponibilidadModel.listarPorTutor(idTutor);
  const resenas = await calificacionesModel.listarPorTutor(idTutor);

  res.json({
    ...mapTutor({ ...row, MATERIAS: materias }),
    disponibilidad: disponibilidad.map((d) => ({
      id: d.ID_DISPONIBILIDAD, idTutor: d.ID_TUTOR, diaSemana: d.DIA_SEMANA,
      horaInicio: d.HORA_INICIO, horaFin: d.HORA_FIN, modalidad: d.MODALIDAD,
    })),
    resenas: resenas.map((r) => ({
      id: r.ID_CALIFICACION, puntuacion: r.PUNTUACION, comentario: r.COMENTARIO,
      estudianteNombre: r.ESTUDIANTE_NOMBRE, fecha: r.FECHA_CREACION,
    })),
  });
});

const actualizar = asyncHandler(async (req, res) => {
  const idTutor = Number(req.params.id);
  const tutorPropio = await tutoresModel.buscarPorUsuario(req.usuario.id);
  if (!tutorPropio || tutorPropio.ID_TUTOR !== idTutor) {
    throw new HttpError(403, "Solo puedes editar tu propio perfil de tutor.");
  }
  const { biografia, tarifaHora, modalidad, ciudad } = req.body;
  await tutoresModel.actualizar(idTutor, { biografia, tarifaHora, modalidad, ciudad });
  const actualizado = await tutoresModel.buscarPorId(idTutor);
  const materias = await tutoresModel.listarMateriasDeTutor(idTutor);
  res.json(mapTutor({ ...actualizado, MATERIAS: materias }));
});

const listarDisponibilidad = asyncHandler(async (req, res) => {
  const filas = await disponibilidadModel.listarPorTutor(Number(req.params.id));
  res.json(filas.map((d) => ({
    id: d.ID_DISPONIBILIDAD, idTutor: d.ID_TUTOR, diaSemana: d.DIA_SEMANA,
    horaInicio: d.HORA_INICIO, horaFin: d.HORA_FIN, modalidad: d.MODALIDAD,
  })));
});

const agregarDisponibilidad = asyncHandler(async (req, res) => {
  const idTutor = Number(req.params.id);
  const tutorPropio = await tutoresModel.buscarPorUsuario(req.usuario.id);
  if (!tutorPropio || tutorPropio.ID_TUTOR !== idTutor) {
    throw new HttpError(403, "Solo puedes editar tu propia disponibilidad.");
  }
  const { diaSemana, horaInicio, horaFin, modalidad } = req.body;
  if (!diaSemana || !horaInicio || !horaFin) throw new HttpError(400, "Dia, hora de inicio y hora de fin son obligatorios.");
  if (horaInicio >= horaFin) throw new HttpError(400, "La hora de fin debe ser posterior a la de inicio.");

  const id = await disponibilidadModel.crear({ idTutor, diaSemana, horaInicio, horaFin, modalidad });
  res.status(201).json({ id, idTutor, diaSemana, horaInicio, horaFin, modalidad: modalidad || "AMBAS" });
});

const eliminarDisponibilidad = asyncHandler(async (req, res) => {
  const tutorPropio = await tutoresModel.buscarPorUsuario(req.usuario.id);
  if (!tutorPropio) throw new HttpError(403, "No tienes un perfil de tutor.");
  const eliminado = await disponibilidadModel.eliminar(Number(req.params.id), tutorPropio.ID_TUTOR);
  if (!eliminado) throw new HttpError(404, "Franja de disponibilidad no encontrada.");
  res.json({ ok: true });
});

module.exports = { listar, obtenerPorId, actualizar, listarDisponibilidad, agregarDisponibilidad, eliminarDisponibilidad, mapTutor };
