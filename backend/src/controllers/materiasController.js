const materiasModel = require("../models/materiasModel");
const { asyncHandler } = require("../utils/httpError");

const listar = asyncHandler(async (req, res) => {
  const filas = await materiasModel.listar();
  res.json(filas.map((m) => ({ id: m.ID_MATERIA, nombre: m.NOMBRE, area: m.AREA, descripcion: m.DESCRIPCION })));
});

module.exports = { listar };
