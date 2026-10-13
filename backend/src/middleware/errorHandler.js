const { HttpError } = require("../utils/httpError");

function notFoundHandler(req, res) {
  res.status(404).json({ message: "Ruta no encontrada: " + req.method + " " + req.originalUrl });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  // Errores de conexion/consulta a Oracle no envueltos en HttpError
  if (err && err.message && err.message.includes("Oracle")) {
    console.error("[DB ERROR]", err);
    return res.status(503).json({ message: "Servicio de base de datos no disponible: " + err.message });
  }

  console.error("[ERROR NO MANEJADO]", err);
  res.status(500).json({ message: "Error interno del servidor." });
}

module.exports = { notFoundHandler, errorHandler };
