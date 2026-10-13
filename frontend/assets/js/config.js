/**
 * Configuracion global del frontend.
 *
 * MODO_DATOS:
 *   "local"  -> usa localStorage como base de datos de demostracion (sin backend).
 *                Es el modo por defecto para que el sitio sea navegable en un
 *                hosting estatico (GitHub Pages) sin necesitar el backend ni Oracle.
 *   "api"    -> consume la API REST real (backend/ + Oracle) definida en API_BASE_URL.
 *
 * Cambia MODO_DATOS a "api" y ajusta API_BASE_URL cuando el backend este desplegado.
 */
window.APP_CONFIG = {
  MODO_DATOS: "local",
  API_BASE_URL: "http://localhost:3000/api",
  APP_NAME: "Tutores On-Line",
};
