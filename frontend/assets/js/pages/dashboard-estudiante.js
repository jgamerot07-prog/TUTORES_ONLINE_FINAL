(async function () {
  await UI.renderHeader();
  UI.renderFooter();

  const user = await UI.requireAuth({ rol: "ESTUDIANTE" });
  if (!user) return;

  document.getElementById("side-avatar").textContent = UI.initials(user.nombre + " " + user.apellido);
  document.getElementById("side-nombre").textContent = `${user.nombre} ${user.apellido}`;
  document.getElementById("side-email").textContent = user.email;

  const perfil = await DataService.getPerfilCompleto(user.id);
  const idEstudiante = perfil.estudiante ? perfil.estudiante.id : null;

  document.getElementById("p-nombre").value = user.nombre;
  document.getElementById("p-apellido").value = user.apellido;
  document.getElementById("p-email").value = user.email;
  if (perfil.estudiante) {
    document.getElementById("p-nivel").value = perfil.estudiante.nivelEducativo || "PREGRADO";
    document.getElementById("p-institucion").value = perfil.estudiante.institucion || "";
  }

  document.getElementById("form-perfil").addEventListener("submit", (e) => {
    e.preventDefault();
    UI.toast("Perfil actualizado (modo demostracion local).", "success");
  });

  // ---------- Tabs ----------
  const tabButtons = document.querySelectorAll(".dashboard-nav button");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".tab-panel").forEach((p) => (p.style.display = "none"));
      document.getElementById("tab-" + btn.dataset.tab).style.display = "block";
    });
  });

  const estadoBadge = (estado) => `<span class="badge badge-${estado.toLowerCase()}">${estado}</span>`;

  async function cargarReservas() {
    const wrap = document.getElementById("reservas-wrap");
    UI.setLoading(wrap, true);
    const reservas = idEstudiante ? await DataService.listReservasByEstudiante(idEstudiante) : [];

    document.getElementById("stat-pendientes").textContent = reservas.filter((r) => r.estado === "PENDIENTE").length;
    document.getElementById("stat-aceptadas").textContent = reservas.filter((r) => r.estado === "ACEPTADA").length;
    document.getElementById("stat-completadas").textContent = reservas.filter((r) => r.estado === "COMPLETADA").length;
    document.getElementById("stat-total").textContent = reservas.length;

    if (!reservas.length) {
      wrap.innerHTML = `<div class="empty-state"><div class="icon">📭</div><p>Aun no tienes reservas.</p><a href="tutores.html" class="btn btn-primary btn-sm">Buscar un tutor</a></div>`;
      return;
    }

    wrap.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Tutor</th><th>Materia</th><th>Fecha</th><th>Hora</th><th>Modalidad</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            ${reservas.map((r) => `
              <tr>
                <td>${r.tutorNombre}</td>
                <td>${r.materiaNombre}</td>
                <td>${UI.formatDate(r.fechaSesion)}</td>
                <td>${r.horaInicio} - ${r.horaFin}</td>
                <td>${r.modalidad}${r.modalidad === "VIRTUAL" && r.enlaceVirtual ? ` · <a href="${r.enlaceVirtual}" target="_blank" rel="noopener">enlace</a>` : ""}</td>
                <td>${estadoBadge(r.estado)}</td>
                <td class="row-actions">
                  ${r.estado === "COMPLETADA" && !r.calificacion ? `<button class="btn btn-secondary btn-sm" data-calificar="${r.id}" data-tutor="${r.idTutor}">Calificar</button>` : ""}
                  ${r.estado === "COMPLETADA" && r.calificacion ? `<span class="badge badge-completada">Calificada ★${r.calificacion.puntuacion}</span>` : ""}
                  ${r.estado === "PENDIENTE" ? `<button class="btn btn-ghost btn-sm" data-cancelar="${r.id}">Cancelar</button>` : ""}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;

    wrap.querySelectorAll("[data-cancelar]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("¿Deseas cancelar esta reserva?")) return;
        await DataService.actualizarEstadoReserva(btn.dataset.cancelar, "CANCELADA");
        UI.toast("Reserva cancelada.", "info");
        cargarReservas();
      });
    });

    wrap.querySelectorAll("[data-calificar]").forEach((btn) => {
      btn.addEventListener("click", () => abrirModalCalificar(btn.dataset.calificar, btn.dataset.tutor));
    });
  }

  function abrirModalCalificar(idReserva, idTutor) {
    document.getElementById("cal-id-reserva").value = idReserva;
    document.getElementById("cal-id-reserva").dataset.idTutor = idTutor;
    document.getElementById("modal-calificar").classList.add("open");
  }
  document.getElementById("cerrar-modal").addEventListener("click", () => document.getElementById("modal-calificar").classList.remove("open"));
  document.getElementById("modal-calificar").addEventListener("click", (e) => {
    if (e.target.id === "modal-calificar") document.getElementById("modal-calificar").classList.remove("open");
  });

  document.getElementById("form-calificar").addEventListener("submit", async (e) => {
    e.preventDefault();
    const idReserva = document.getElementById("cal-id-reserva").value;
    const idTutor = Number(document.getElementById("cal-id-reserva").dataset.idTutor);
    const alertBox = document.getElementById("calificar-alert");
    alertBox.innerHTML = "";
    try {
      await DataService.crearCalificacion({
        idReserva: Number(idReserva),
        idEstudiante,
        idTutor,
        puntuacion: Number(document.getElementById("cal-puntuacion").value),
        comentario: document.getElementById("cal-comentario").value.trim(),
      });
      UI.toast("¡Gracias por tu calificacion!", "success");
      document.getElementById("modal-calificar").classList.remove("open");
      document.getElementById("form-calificar").reset();
      cargarReservas();
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  });

  async function cargarNotificaciones() {
    const wrap = document.getElementById("notif-wrap");
    const notifs = await DataService.listNotificaciones(user.id);
    document.getElementById("badge-notif").textContent = notifs.filter((n) => !n.leida).length || "";

    wrap.innerHTML = notifs.length
      ? notifs.map((n) => `
          <div class="alert ${n.leida ? "alert-info" : "alert-warning"}" style="display:flex;justify-content:space-between;align-items:center;gap:1rem;">
            <span>${n.mensaje}</span>
            ${!n.leida ? `<button class="btn btn-ghost btn-sm" data-leer="${n.id}">Marcar leida</button>` : ""}
          </div>
        `).join("")
      : `<p class="text-muted">No tienes notificaciones.</p>`;

    wrap.querySelectorAll("[data-leer]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await DataService.marcarNotificacionLeida(btn.dataset.leer);
        cargarNotificaciones();
      });
    });
  }

  await cargarReservas();
  await cargarNotificaciones();
})();
