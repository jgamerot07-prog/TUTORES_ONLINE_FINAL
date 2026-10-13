const usuariosModel = require("../models/usuariosModel");
const estudiantesModel = require("../models/estudiantesModel");
const tutoresModel = require("../models/tutoresModel");
const { hashPassword, compararPassword } = require("../utils/password");
const { firmarToken } = require("../utils/jwt");
const { HttpError, asyncHandler } = require("../utils/httpError");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanearUsuario(row) {
  return {
    id: row.ID_USUARIO,
    nombre: row.NOMBRE,
    apellido: row.APELLIDO,
    email: row.EMAIL,
    telefono: row.TELEFONO,
    rol: row.ROL,
    estado: row.ESTADO,
  };
}

const registro = asyncHandler(async (req, res) => {
  const { nombre, apellido, email, password, telefono, rol, extra } = req.body;

  if (!nombre || nombre.trim().length < 2) throw new HttpError(400, "El nombre es obligatorio.");
  if (!apellido || apellido.trim().length < 2) throw new HttpError(400, "El apellido es obligatorio.");
  if (!email || !EMAIL_RE.test(email)) throw new HttpError(400, "Ingresa un correo valido.");
  if (!password || password.length < 8) throw new HttpError(400, "La contraseña debe tener al menos 8 caracteres.");
  if (!["ESTUDIANTE", "TUTOR"].includes(rol)) throw new HttpError(400, "Rol invalido.");

  const existente = await usuariosModel.buscarPorEmail(email);
  if (existente) throw new HttpError(409, "Ya existe una cuenta registrada con ese correo.");

  const passwordHash = await hashPassword(password);
  const idUsuario = await usuariosModel.crear({ nombre, apellido, email, passwordHash, telefono, rol });

  if (rol === "ESTUDIANTE") {
    await estudiantesModel.crear({
      idUsuario,
      nivelEducativo: (extra && extra.nivelEducativo) || "PREGRADO",
      institucion: (extra && extra.institucion) || null,
    });
  } else {
    await tutoresModel.crear({
      idUsuario,
      biografia: extra && extra.biografia,
      aniosExperiencia: extra && Number(extra.aniosExperiencia),
      tarifaHora: extra && Number(extra.tarifaHora),
      modalidad: extra && extra.modalidad,
      ciudad: extra && extra.ciudad,
      materias: extra && extra.materias,
    });
  }

  const usuario = await usuariosModel.buscarPorId(idUsuario);
  const token = firmarToken({ id: idUsuario, rol, email });
  res.status(201).json({ user: sanearUsuario(usuario), token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, "Correo y contraseña son obligatorios.");

  const usuario = await usuariosModel.buscarPorEmail(email);
  if (!usuario) throw new HttpError(401, "Correo o contraseña incorrectos.");

  const coincide = await compararPassword(password, usuario.PASSWORD_HASH);
  if (!coincide) throw new HttpError(401, "Correo o contraseña incorrectos.");
  if (usuario.ESTADO !== "ACTIVO") throw new HttpError(403, "Esta cuenta esta inactiva.");

  const token = firmarToken({ id: usuario.ID_USUARIO, rol: usuario.ROL, email: usuario.EMAIL });
  res.json({ user: sanearUsuario(usuario), token });
});

const me = asyncHandler(async (req, res) => {
  const usuario = await usuariosModel.buscarPorId(req.usuario.id);
  if (!usuario) throw new HttpError(404, "Usuario no encontrado.");
  res.json(sanearUsuario(usuario));
});

module.exports = { registro, login, me, sanearUsuario };
