const usuariosModel = require("../models/usuariosModel");
const estudiantesModel = require("../models/estudiantesModel");
const tutoresModel = require("../models/tutoresModel");
const { sanearUsuario } = require("./authController");
const { HttpError, asyncHandler } = require("../utils/httpError");

const perfilCompleto = asyncHandler(async (req, res) => {
  const idUsuario = Number(req.params.id);
  if (req.usuario.id !== idUsuario) throw new HttpError(403, "No puedes ver el perfil de otro usuario.");

  const usuario = await usuariosModel.buscarPorId(idUsuario);
  if (!usuario) throw new HttpError(404, "Usuario no encontrado.");

  if (usuario.ROL === "ESTUDIANTE") {
    const estudiante = await estudiantesModel.buscarPorUsuario(idUsuario);
    return res.json({
      usuario: sanearUsuario(usuario),
      estudiante: estudiante && {
        id: estudiante.ID_ESTUDIANTE,
        nivelEducativo: estudiante.NIVEL_EDUCATIVO,
        institucion: estudiante.INSTITUCION,
      },
    });
  }

  if (usuario.ROL === "TUTOR") {
    const tutor = await tutoresModel.buscarPorUsuario(idUsuario);
    const materias = tutor ? await tutoresModel.listarMateriasDeTutor(tutor.ID_TUTOR) : [];
    return res.json({
      usuario: sanearUsuario(usuario),
      tutor: tutor && {
        id: tutor.ID_TUTOR,
        biografia: tutor.BIOGRAFIA,
        aniosExperiencia: tutor.ANIOS_EXPERIENCIA,
        tarifaHora: tutor.TARIFA_HORA,
        modalidad: tutor.MODALIDAD,
        ciudad: tutor.CIUDAD,
        verificado: tutor.VERIFICADO === "S",
        calificacionPromedio: tutor.CALIFICACION_PROMEDIO,
        totalResenas: tutor.TOTAL_RESENAS,
        materias,
      },
    });
  }

  res.json({ usuario: sanearUsuario(usuario) });
});

module.exports = { perfilCompleto };
