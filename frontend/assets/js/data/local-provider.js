/**
 * Proveedor de datos en modo DEMOSTRACION LOCAL.
 *
 * No es una base de datos real: persiste en localStorage del navegador para que
 * la plataforma sea navegable de punta a punta (registro, login, busqueda,
 * reservas, calificaciones) sin necesitar el backend ni una instancia Oracle
 * desplegada. Los datos de prueba reflejan el mismo modelo que
 * database/oracle/03_sample_data.sql.
 *
 * El hash de contrasena aqui es solo ofuscacion para la demo local; NO es
 * seguridad real. La autenticacion segura (bcrypt + JWT) vive en backend/.
 */
(function () {
  const DB_KEY = "tol_db_v1";
  const SESSION_KEY = "tol_session_v1";

  function simpleHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return "demo_" + (hash >>> 0).toString(16);
  }

  function uid(list) {
    return list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  function delay(value, ms) {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms || 220));
  }

  function seed() {
    const materias = [
      { id: 1, nombre: "Calculo I", area: "Matematicas", descripcion: "Limites, derivadas e integrales basicas" },
      { id: 2, nombre: "Algebra Lineal", area: "Matematicas", descripcion: "Matrices, vectores y espacios vectoriales" },
      { id: 3, nombre: "Fisica Mecanica", area: "Fisica", descripcion: "Cinematica, dinamica y energia" },
      { id: 4, nombre: "Circuitos Electricos I", area: "Ingenieria Electrica", descripcion: "Analisis de circuitos DC y AC" },
      { id: 5, nombre: "Programacion en Python", area: "Informatica", descripcion: "Fundamentos de programacion" },
      { id: 6, nombre: "Ingles Conversacional", area: "Idiomas", descripcion: "Practica de conversacion" },
      { id: 7, nombre: "Quimica General", area: "Quimica", descripcion: "Estequiometria y reacciones" },
    ];

    const usuarios = [
      { id: 1, nombre: "Laura", apellido: "Martinez", email: "laura.martinez@tutoresonline.com", passwordHash: simpleHash("Tutores2025*"), telefono: "3001234567", rol: "TUTOR", estado: "ACTIVO", fechaRegistro: "2025-02-10T10:00:00.000Z" },
      { id: 2, nombre: "Carlos", apellido: "Ramirez", email: "carlos.ramirez@tutoresonline.com", passwordHash: simpleHash("Tutores2025*"), telefono: "3007654321", rol: "TUTOR", estado: "ACTIVO", fechaRegistro: "2025-03-01T10:00:00.000Z" },
      { id: 3, nombre: "Juan", apellido: "Perez", email: "juan.perez@estudiante.com", passwordHash: simpleHash("Tutores2025*"), telefono: "3109876543", rol: "ESTUDIANTE", estado: "ACTIVO", fechaRegistro: "2025-03-15T10:00:00.000Z" },
      { id: 4, nombre: "Maria", apellido: "Gomez", email: "maria.gomez@estudiante.com", passwordHash: simpleHash("Tutores2025*"), telefono: "3151122334", rol: "ESTUDIANTE", estado: "ACTIVO", fechaRegistro: "2025-03-20T10:00:00.000Z" },
    ];

    const estudiantes = [
      { id: 1, idUsuario: 3, nivelEducativo: "PREGRADO", institucion: "Corporacion Universitaria de la Costa (CUC)" },
      { id: 2, idUsuario: 4, nivelEducativo: "COLEGIO", institucion: "Institucion Educativa San Jose" },
    ];

    const tutores = [
      { id: 1, idUsuario: 1, biografia: "Ingeniera con 5 anios de experiencia enseniando matematicas y fisica a nivel universitario. Me enfoco en que el estudiante entienda el porque, no solo la formula.", aniosExperiencia: 5, tarifaHora: 35000, modalidad: "AMBAS", ciudad: "Barranquilla", verificado: true, calificacionPromedio: 4.8, totalResenas: 12, materias: [1, 2, 3] },
      { id: 2, idUsuario: 2, biografia: "Tutor especializado en programacion e ingenieria electrica, clases practicas y orientadas a proyectos reales.", aniosExperiencia: 3, tarifaHora: 30000, modalidad: "VIRTUAL", ciudad: "Barranquilla", verificado: true, calificacionPromedio: 4.6, totalResenas: 8, materias: [4, 5] },
    ];

    const disponibilidad = [
      { id: 1, idTutor: 1, diaSemana: "LUNES", horaInicio: "15:00", horaFin: "18:00", modalidad: "AMBAS" },
      { id: 2, idTutor: 1, diaSemana: "MIERCOLES", horaInicio: "15:00", horaFin: "18:00", modalidad: "VIRTUAL" },
      { id: 3, idTutor: 2, diaSemana: "MARTES", horaInicio: "18:00", horaFin: "21:00", modalidad: "VIRTUAL" },
      { id: 4, idTutor: 2, diaSemana: "JUEVES", horaInicio: "18:00", horaFin: "21:00", modalidad: "VIRTUAL" },
    ];

    const hoy = new Date();
    const futura = (dias) => {
      const d = new Date(hoy);
      d.setDate(d.getDate() + dias);
      return d.toISOString().slice(0, 10);
    };
    const pasada = (dias) => {
      const d = new Date(hoy);
      d.setDate(d.getDate() - dias);
      return d.toISOString().slice(0, 10);
    };

    const reservas = [
      { id: 1, idEstudiante: 1, idTutor: 1, idMateria: 1, fechaSesion: futura(3), horaInicio: "15:00", horaFin: "16:00", modalidad: "VIRTUAL", enlaceVirtual: "https://meet.tutoresonline.com/sala-demo-1", ubicacion: "", estado: "PENDIENTE", comentarioEstudiante: "Necesito ayuda con derivadas para el parcial.", motivoRechazo: "", fechaSolicitud: new Date().toISOString() },
      { id: 2, idEstudiante: 2, idTutor: 2, idMateria: 5, fechaSesion: futura(7), horaInicio: "18:00", horaFin: "19:00", modalidad: "VIRTUAL", enlaceVirtual: "https://meet.tutoresonline.com/sala-demo-2", ubicacion: "", estado: "ACEPTADA", comentarioEstudiante: "Quiero reforzar listas y diccionarios en Python.", motivoRechazo: "", fechaSolicitud: new Date().toISOString() },
      { id: 3, idEstudiante: 1, idTutor: 1, idMateria: 3, fechaSesion: pasada(10), horaInicio: "15:00", horaFin: "16:00", modalidad: "PRESENCIAL", enlaceVirtual: "", ubicacion: "Biblioteca CUC, sala de estudio 4", estado: "COMPLETADA", comentarioEstudiante: "Repaso de cinematica.", motivoRechazo: "", fechaSolicitud: new Date().toISOString() },
    ];

    const calificaciones = [
      { id: 1, idReserva: 3, idEstudiante: 1, idTutor: 1, puntuacion: 5, comentario: "Excelente explicacion, muy paciente y clara.", fecha: new Date().toISOString() },
    ];

    const notificaciones = [
      { id: 1, idUsuario: 1, idReserva: 1, tipo: "NUEVA_SOLICITUD", mensaje: "Tienes una nueva solicitud de tutoria pendiente por responder.", leida: false, fecha: new Date().toISOString() },
      { id: 2, idUsuario: 4, idReserva: 2, tipo: "RESERVA_ACEPTADA", mensaje: "Tu tutoria fue aceptada. Revisa la fecha y el enlace de la sesion.", leida: false, fecha: new Date().toISOString() },
    ];

    return { usuarios, estudiantes, tutores, materias, disponibilidad, reservas, calificaciones, notificaciones };
  }

  function loadDB() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("No se pudo leer la base de datos local, se reinicia.", e);
    }
    const fresh = seed();
    saveDB(fresh);
    return fresh;
  }

  function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function setSession(session) {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }

  function publicUser(u) {
    if (!u) return null;
    const { passwordHash, ...rest } = u;
    return rest;
  }

  function enrichTutor(db, t) {
    const u = db.usuarios.find((x) => x.id === t.idUsuario);
    const materias = (t.materias || [])
      .map((idm) => db.materias.find((m) => m.id === idm))
      .filter(Boolean);
    return {
      ...t,
      nombre: u ? `${u.nombre} ${u.apellido}` : "Tutor",
      email: u ? u.email : "",
      telefono: u ? u.telefono : "",
      materiasDetalle: materias,
    };
  }

  function enrichReserva(db, r) {
    const est = db.estudiantes.find((e) => e.id === r.idEstudiante);
    const uEst = est ? db.usuarios.find((u) => u.id === est.idUsuario) : null;
    const tut = db.tutores.find((t) => t.id === r.idTutor);
    const uTut = tut ? db.usuarios.find((u) => u.id === tut.idUsuario) : null;
    const materia = db.materias.find((m) => m.id === r.idMateria);
    const calificacion = db.calificaciones.find((c) => c.idReserva === r.id);
    return {
      ...r,
      estudianteNombre: uEst ? `${uEst.nombre} ${uEst.apellido}` : "Estudiante",
      tutorNombre: uTut ? `${uTut.nombre} ${uTut.apellido}` : "Tutor",
      materiaNombre: materia ? materia.nombre : "",
      calificacion: calificacion || null,
    };
  }

  const LocalProvider = {
    mode: "local",

    // ---------------- AUTH ----------------
    async register({ nombre, apellido, email, password, telefono, rol, extra }) {
      const db = loadDB();
      const emailLower = email.trim().toLowerCase();
      if (db.usuarios.some((u) => u.email.toLowerCase() === emailLower)) {
        throw new Error("Ya existe una cuenta registrada con ese correo.");
      }
      const nuevoUsuario = {
        id: uid(db.usuarios),
        nombre, apellido, email: email.trim(),
        passwordHash: simpleHash(password),
        telefono: telefono || "",
        rol,
        estado: "ACTIVO",
        fechaRegistro: new Date().toISOString(),
      };
      db.usuarios.push(nuevoUsuario);

      if (rol === "ESTUDIANTE") {
        db.estudiantes.push({
          id: uid(db.estudiantes.length ? db.estudiantes : [{ id: 0 }]),
          idUsuario: nuevoUsuario.id,
          nivelEducativo: (extra && extra.nivelEducativo) || "PREGRADO",
          institucion: (extra && extra.institucion) || "",
        });
      } else if (rol === "TUTOR") {
        db.tutores.push({
          id: uid(db.tutores.length ? db.tutores : [{ id: 0 }]),
          idUsuario: nuevoUsuario.id,
          biografia: (extra && extra.biografia) || "",
          aniosExperiencia: (extra && Number(extra.aniosExperiencia)) || 0,
          tarifaHora: (extra && Number(extra.tarifaHora)) || 0,
          modalidad: (extra && extra.modalidad) || "AMBAS",
          ciudad: (extra && extra.ciudad) || "",
          verificado: false,
          calificacionPromedio: 0,
          totalResenas: 0,
          materias: (extra && extra.materias) || [],
        });
      }
      saveDB(db);
      const session = { userId: nuevoUsuario.id, token: "demo_" + nuevoUsuario.id + "_" + Date.now() };
      setSession(session);
      return delay({ user: publicUser(nuevoUsuario), token: session.token });
    },

    async login({ email, password }) {
      const db = loadDB();
      const emailLower = email.trim().toLowerCase();
      const user = db.usuarios.find((u) => u.email.toLowerCase() === emailLower);
      if (!user || user.passwordHash !== simpleHash(password)) {
        throw new Error("Correo o contrasena incorrectos.");
      }
      if (user.estado !== "ACTIVO") {
        throw new Error("Esta cuenta esta inactiva. Contacta al administrador.");
      }
      const session = { userId: user.id, token: "demo_" + user.id + "_" + Date.now() };
      setSession(session);
      return delay({ user: publicUser(user), token: session.token });
    },

    async me() {
      const session = getSession();
      if (!session) return null;
      const db = loadDB();
      const user = db.usuarios.find((u) => u.id === session.userId);
      return publicUser(user);
    },

    logout() {
      setSession(null);
    },

    async getPerfilCompleto(idUsuario) {
      const db = loadDB();
      const user = db.usuarios.find((u) => u.id === idUsuario);
      if (!user) return null;
      if (user.rol === "ESTUDIANTE") {
        const est = db.estudiantes.find((e) => e.idUsuario === idUsuario);
        return { usuario: publicUser(user), estudiante: est || null };
      }
      if (user.rol === "TUTOR") {
        const tut = db.tutores.find((t) => t.idUsuario === idUsuario);
        return { usuario: publicUser(user), tutor: tut ? enrichTutor(db, tut) : null };
      }
      return { usuario: publicUser(user) };
    },

    // ---------------- MATERIAS ----------------
    async listMaterias() {
      const db = loadDB();
      return delay(db.materias);
    },

    // ---------------- TUTORES ----------------
    async listTutores(filters) {
      const db = loadDB();
      filters = filters || {};
      let result = db.tutores.map((t) => enrichTutor(db, t));

      if (filters.q) {
        const q = filters.q.toLowerCase();
        result = result.filter(
          (t) => t.nombre.toLowerCase().includes(q) ||
                 t.materiasDetalle.some((m) => m.nombre.toLowerCase().includes(q))
        );
      }
      if (filters.materiaId) {
        result = result.filter((t) => t.materias.includes(Number(filters.materiaId)));
      }
      if (filters.modalidad) {
        result = result.filter((t) => t.modalidad === filters.modalidad || t.modalidad === "AMBAS");
      }
      if (filters.ciudad) {
        result = result.filter((t) => t.ciudad.toLowerCase().includes(filters.ciudad.toLowerCase()));
      }
      if (filters.ordenar === "precio_asc") result.sort((a, b) => a.tarifaHora - b.tarifaHora);
      else if (filters.ordenar === "precio_desc") result.sort((a, b) => b.tarifaHora - a.tarifaHora);
      else result.sort((a, b) => b.calificacionPromedio - a.calificacionPromedio);

      return delay(result);
    },

    async getTutorById(id) {
      const db = loadDB();
      const t = db.tutores.find((x) => x.id === Number(id));
      if (!t) return delay(null);
      const enriched = enrichTutor(db, t);
      const disp = db.disponibilidad.filter((d) => d.idTutor === t.id);
      const resenas = db.calificaciones
        .filter((c) => c.idTutor === t.id)
        .map((c) => {
          const r = db.reservas.find((rr) => rr.id === c.idReserva);
          const est = r ? db.estudiantes.find((e) => e.id === r.idEstudiante) : null;
          const uEst = est ? db.usuarios.find((u) => u.id === est.idUsuario) : null;
          return { ...c, estudianteNombre: uEst ? `${uEst.nombre} ${uEst.apellido.charAt(0)}.` : "Estudiante" };
        });
      return delay({ ...enriched, disponibilidad: disp, resenas });
    },

    // ---------------- PERFIL DE TUTOR ----------------
    async actualizarTutor(idTutor, data) {
      const db = loadDB();
      const t = db.tutores.find((x) => x.id === Number(idTutor));
      if (!t) throw new Error("Tutor no encontrado.");
      Object.assign(t, data);
      saveDB(db);
      return delay(enrichTutor(db, t));
    },

    // ---------------- DISPONIBILIDAD (gestion del tutor) ----------------
    async listDisponibilidadByTutor(idTutor) {
      const db = loadDB();
      return delay(db.disponibilidad.filter((d) => d.idTutor === Number(idTutor)));
    },

    async addDisponibilidad(idTutor, slot) {
      const db = loadDB();
      const nueva = { id: uid(db.disponibilidad.length ? db.disponibilidad : [{ id: 0 }]), idTutor: Number(idTutor), ...slot };
      db.disponibilidad.push(nueva);
      saveDB(db);
      return delay(nueva);
    },

    async removeDisponibilidad(id) {
      const db = loadDB();
      db.disponibilidad = db.disponibilidad.filter((d) => d.id !== Number(id));
      saveDB(db);
      return delay(true);
    },

    // ---------------- RESERVAS ----------------
    async crearReserva(data) {
      const db = loadDB();
      const conflicto = db.reservas.some(
        (r) => r.idTutor === data.idTutor && r.fechaSesion === data.fechaSesion &&
               r.horaInicio === data.horaInicio && ["PENDIENTE", "ACEPTADA"].includes(r.estado)
      );
      if (conflicto) {
        throw new Error("Ese horario ya fue reservado. Elige otra franja disponible.");
      }
      const nueva = {
        id: uid(db.reservas.length ? db.reservas : [{ id: 0 }]),
        estado: "PENDIENTE",
        enlaceVirtual: data.modalidad === "VIRTUAL" ? "" : "",
        ubicacion: data.modalidad === "PRESENCIAL" ? (data.ubicacion || "") : "",
        motivoRechazo: "",
        fechaSolicitud: new Date().toISOString(),
        ...data,
      };
      db.reservas.push(nueva);

      const tut = db.tutores.find((t) => t.id === data.idTutor);
      if (tut) {
        const uTut = db.usuarios.find((u) => u.id === tut.idUsuario);
        if (uTut) {
          db.notificaciones.push({
            id: uid(db.notificaciones.length ? db.notificaciones : [{ id: 0 }]),
            idUsuario: uTut.id, idReserva: nueva.id, tipo: "NUEVA_SOLICITUD",
            mensaje: "Tienes una nueva solicitud de tutoria pendiente por responder.",
            leida: false, fecha: new Date().toISOString(),
          });
        }
      }
      saveDB(db);
      return delay(enrichReserva(db, nueva));
    },

    async listReservasByEstudiante(idEstudiante) {
      const db = loadDB();
      return delay(
        db.reservas.filter((r) => r.idEstudiante === Number(idEstudiante)).map((r) => enrichReserva(db, r))
          .sort((a, b) => (a.fechaSesion < b.fechaSesion ? 1 : -1))
      );
    },

    async listReservasByTutor(idTutor) {
      const db = loadDB();
      return delay(
        db.reservas.filter((r) => r.idTutor === Number(idTutor)).map((r) => enrichReserva(db, r))
          .sort((a, b) => (a.fechaSesion < b.fechaSesion ? 1 : -1))
      );
    },

    async actualizarEstadoReserva(idReserva, estado, motivo, extra) {
      const db = loadDB();
      const r = db.reservas.find((x) => x.id === Number(idReserva));
      if (!r) throw new Error("Reserva no encontrada.");
      r.estado = estado;
      if (motivo) r.motivoRechazo = motivo;
      if (extra && extra.enlaceVirtual) r.enlaceVirtual = extra.enlaceVirtual;

      const est = db.estudiantes.find((e) => e.id === r.idEstudiante);
      if (est) {
        const uEst = db.usuarios.find((u) => u.id === est.idUsuario);
        if (uEst) {
          const mensaje = estado === "ACEPTADA"
            ? "Tu tutoria fue aceptada. Revisa la fecha y los detalles."
            : estado === "RECHAZADA"
            ? "Tu solicitud de tutoria fue rechazada."
            : "El estado de tu reserva cambio a " + estado + ".";
          db.notificaciones.push({
            id: uid(db.notificaciones.length ? db.notificaciones : [{ id: 0 }]),
            idUsuario: uEst.id, idReserva: r.id, tipo: "ESTADO_RESERVA",
            mensaje, leida: false, fecha: new Date().toISOString(),
          });
        }
      }
      saveDB(db);
      return delay(enrichReserva(db, r));
    },

    // ---------------- CALIFICACIONES ----------------
    async crearCalificacion({ idReserva, idEstudiante, idTutor, puntuacion, comentario }) {
      const db = loadDB();
      if (db.calificaciones.some((c) => c.idReserva === Number(idReserva))) {
        throw new Error("Esta reserva ya fue calificada.");
      }
      const nueva = {
        id: uid(db.calificaciones.length ? db.calificaciones : [{ id: 0 }]),
        idReserva: Number(idReserva), idEstudiante, idTutor, puntuacion, comentario,
        fecha: new Date().toISOString(),
      };
      db.calificaciones.push(nueva);

      const tut = db.tutores.find((t) => t.id === idTutor);
      if (tut) {
        const resenasTutor = db.calificaciones.filter((c) => c.idTutor === idTutor);
        const promedio = resenasTutor.reduce((sum, c) => sum + c.puntuacion, 0) / resenasTutor.length;
        tut.calificacionPromedio = Math.round(promedio * 10) / 10;
        tut.totalResenas = resenasTutor.length;
      }
      saveDB(db);
      return delay(nueva);
    },

    // ---------------- NOTIFICACIONES ----------------
    async listNotificaciones(idUsuario) {
      const db = loadDB();
      return delay(
        db.notificaciones.filter((n) => n.idUsuario === Number(idUsuario))
          .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
      );
    },

    async marcarNotificacionLeida(id) {
      const db = loadDB();
      const n = db.notificaciones.find((x) => x.id === Number(id));
      if (n) n.leida = true;
      saveDB(db);
      return delay(true);
    },

    // ---------------- Utilidad ----------------
    resetDemoData() {
      localStorage.removeItem(DB_KEY);
      localStorage.removeItem(SESSION_KEY);
    },
  };

  window.LocalProvider = LocalProvider;
})();
