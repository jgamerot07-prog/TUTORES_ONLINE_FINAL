/**
 * Proveedor de datos que consume la API REST real (backend/ conectado a Oracle).
 * Implementa la misma interfaz que LocalProvider para que las paginas no tengan
 * que saber en que modo esta corriendo la aplicacion (ver data/index.js).
 */
(function () {
  const SESSION_KEY = "tol_session_v1";

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
    catch (e) { return null; }
  }
  function setSession(session) {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }

  async function request(path, options) {
    const base = window.APP_CONFIG.API_BASE_URL;
    const session = getSession();
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      options && options.headers
    );
    if (session && session.token) headers.Authorization = "Bearer " + session.token;

    const res = await fetch(base + path, Object.assign({}, options, { headers }));
    let body = null;
    try { body = await res.json(); } catch (e) { /* respuesta sin cuerpo */ }
    if (!res.ok) {
      throw new Error((body && body.message) || "Error de comunicacion con el servidor (" + res.status + ").");
    }
    return body;
  }

  const ApiProvider = {
    mode: "api",

    async register(data) {
      const result = await request("/auth/registro", { method: "POST", body: JSON.stringify(data) });
      setSession({ userId: result.user.id, token: result.token });
      return result;
    },
    async login(data) {
      const result = await request("/auth/login", { method: "POST", body: JSON.stringify(data) });
      setSession({ userId: result.user.id, token: result.token });
      return result;
    },
    async me() {
      const session = getSession();
      if (!session) return null;
      try { return await request("/auth/me"); } catch (e) { return null; }
    },
    logout() { setSession(null); },

    getPerfilCompleto(idUsuario) { return request("/usuarios/" + idUsuario); },
    listMaterias() { return request("/materias"); },

    listTutores(filters) {
      const qs = new URLSearchParams(filters || {}).toString();
      return request("/tutores" + (qs ? "?" + qs : ""));
    },
    getTutorById(id) { return request("/tutores/" + id); },

    actualizarTutor(idTutor, data) { return request("/tutores/" + idTutor, { method: "PATCH", body: JSON.stringify(data) }); },

    listDisponibilidadByTutor(idTutor) { return request("/tutores/" + idTutor + "/disponibilidad"); },
    addDisponibilidad(idTutor, slot) {
      return request("/tutores/" + idTutor + "/disponibilidad", { method: "POST", body: JSON.stringify(slot) });
    },
    removeDisponibilidad(id) { return request("/disponibilidad/" + id, { method: "DELETE" }); },

    crearReserva(data) { return request("/reservas", { method: "POST", body: JSON.stringify(data) }); },
    listReservasByEstudiante(idEstudiante) { return request("/reservas?idEstudiante=" + idEstudiante); },
    listReservasByTutor(idTutor) { return request("/reservas?idTutor=" + idTutor); },
    actualizarEstadoReserva(idReserva, estado, motivo) {
      return request("/reservas/" + idReserva + "/estado", { method: "PATCH", body: JSON.stringify({ estado, motivo }) });
    },

    crearCalificacion(data) { return request("/calificaciones", { method: "POST", body: JSON.stringify(data) }); },

    listNotificaciones(idUsuario) { return request("/notificaciones?idUsuario=" + idUsuario); },
    marcarNotificacionLeida(id) { return request("/notificaciones/" + id + "/leer", { method: "PATCH" }); },
  };

  window.ApiProvider = ApiProvider;
})();
