const express = require("express");
const cors = require("cors");
const { CORS_ORIGIN } = require("./config/env");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const usuariosRoutes = require("./routes/usuariosRoutes");
const tutoresRoutes = require("./routes/tutoresRoutes");
const disponibilidadRoutes = require("./routes/disponibilidadRoutes");
const reservasRoutes = require("./routes/reservasRoutes");
const calificacionesRoutes = require("./routes/calificacionesRoutes");
const notificacionesRoutes = require("./routes/notificacionesRoutes");
const materiasRoutes = require("./routes/materiasRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/api/health", async (req, res) => {
  const oracleConfigurado = await db.isConfigured();
  res.json({
    status: "ok",
    servicio: "Tutores On-Line API",
    oracleConfigurado,
    mensaje: oracleConfigurado
      ? "Conectado a Oracle."
      : "Oracle no configurado todavia: define ORACLE_USER, ORACLE_PASSWORD y ORACLE_CONNECT_STRING en .env.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/tutores", tutoresRoutes);
app.use("/api/disponibilidad", disponibilidadRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/calificaciones", calificacionesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/materias", materiasRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
