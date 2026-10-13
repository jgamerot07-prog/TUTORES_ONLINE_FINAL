const app = require("./app");
const { PORT } = require("./config/env");
const db = require("./config/db");

app.listen(PORT, async () => {
  console.log(`Tutores On-Line API escuchando en http://localhost:${PORT}`);
  const conectado = await db.isConfigured();
  if (conectado) {
    console.log("Conexion a Oracle verificada correctamente.");
  } else {
    console.warn(
      "AVISO: Oracle no esta configurado (faltan variables en .env). " +
      "La API esta corriendo pero los endpoints que consultan datos devolveran error 503 hasta que configures la conexion."
    );
  }
});
