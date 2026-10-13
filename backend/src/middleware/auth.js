const { verificarToken } = require("../utils/jwt");
const { HttpError } = require("../utils/httpError");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "No autenticado. Envia un token Bearer valido."));
  }
  try {
    req.usuario = verificarToken(token);
    next();
  } catch (e) {
    next(new HttpError(401, "Token invalido o expirado."));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return next(new HttpError(403, "No tienes permiso para realizar esta accion."));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
