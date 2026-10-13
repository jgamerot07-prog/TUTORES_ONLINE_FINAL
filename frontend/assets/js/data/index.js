/**
 * Selecciona el proveedor de datos (local o API real) segun window.APP_CONFIG.MODO_DATOS
 * y lo expone como window.DataService. El resto del frontend solo usa DataService,
 * nunca LocalProvider/ApiProvider directamente.
 */
(function () {
  const modo = (window.APP_CONFIG && window.APP_CONFIG.MODO_DATOS) || "local";
  window.DataService = modo === "api" ? window.ApiProvider : window.LocalProvider;
  window.DataService.isDemo = modo !== "api";
})();
