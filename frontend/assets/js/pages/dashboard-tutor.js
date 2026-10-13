(async function () {
  await UI.renderHeader();
  UI.renderFooter();

  const user = await UI.requireAuth({ rol: "TUTOR" });
  if (!user) return;

  document.getElementById("side-avatar").textContent = UI.initials(user.nombre + " " + user.apellido);
  document.getElementById("side-nombre").textContent = `${user.nombre} ${user.apellido}`;
  document.getElementById("side-email").textContent = user.email;

  const perfil = await DataService.getPerfilCompleto(user.id);
  const tutorInfo = perfil.tutor;
  const idTutor = tutorInfo ? tutorInfo.id : null;

  if (tutorInfo) {
    document.getElementById("p-bio").value = tutorInfo.biografia || "";
    document.getElementById("p-tarifa").value = tutorInfo.tarifaHora || 0;
    document.getElementById("p-modalidad").value = tutorInfo.modalidad || "AMBAS";
    document.getElementById("p-ciudad").value = tutorInfo.ciudad || "";
    document.getElementById("stat-calificacion").textContent = tutorInfo.calificacionPromedio ? tutorInfo.calificacionPromedio.toFixed(1) : "—";
  }

  document.getElementById("form-perfil").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!idTutor) return;
    await DataService.actualizarTutor(idTutor, {
      biografia: document.getElementById("p-bio").value.trim(),
      tarifaHora: Number(document.getElementById("p-tarifa").value),
      modalidad: document.getElementById("p-modalidad").value,
      ciudad: document.getElementById("p-ciudad").value.trim(),
    });
    UI.toast("Perfil publico actualizado.", "success");
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
  let reservasCache = [];

  async function cargarReservas() {
    reservasCache = idTutor ? await DataService.listReservasByTutor(idTutor) : [];

    const pendientes = reservasCache.filter((r) => r.estado === "PENDIENTE");
    const aceptadas = reservasCache.filter((r) => r.estado === "ACEPTADA");

    document.getElementById("stat-pendientes").textContent = pendientes.length;
    document.getElementById("stat-aceptadas").textContent = aceptadas.length;
    document.getElementById("stat-total").textContent = reservasCache.length;
    document.getElementById("badge-pendientes").textContent = pendientes.length || "";

    renderSolicitudes(pendientes);
    renderHistorial(reservasCache.filter((r) => ["ACEPTADA", "COMPLETADA", "RECHAZADA", "CANCELADA"].includes(r.estado)));
  }

  function renderSolicitudes(pendientes) {
    const wrap = document.getElementById("solicitudes-wrap");
    if (!pendientes.length) {
      wrap.innerHTML = `<div class="empty-state"><div class="icon">✅</div><p>No tienes solicitudes pendientes por responder.</p></div>`;
      return;
    }
    wrap.innerHTML = pendientes.map((r) => `
      <div class="panel" style="margin-bottom: var(--space-3); padding: var(--space-4);">
        <div class="panel-header" style="margin-bottom:.5rem;">
          <div>
            <strong>${r.estudianteNombre}</strong> solicita <strong>${r.materiaNombre}</strong>
            <p class="text-muted" style="margin:.25rem 0 0;font-size:var(--fs-sm);">
              ${UI.formatDate(r.fechaSesion)} · ${r.horaInicio} - ${r.horaFin} · ${r.modalidad}
              ${r.ubicacion ? " · " + r.ubicacion : ""}
            </p>
          </div>
          ${estadoBadge(r.estado)}
        </div>
        ${r.comentarioEstudiante ? `<p class="text-muted" style="font-style:italic;">"${r.comentarioEstudiante}"</p>` : ""}
        <div class="row-actions">
          <button class="btn btn-success btn-sm" data-aceptar="${r.id}" data-modalidad="${r.modalidad}">Aceptar</button>
          <button class="btn btn-danger btn-sm" data-rechazar="${r.id}">Rechazar</button>
        </div>
      </div>
    `).join("");

    wrap.querySelectorAll("[data-aceptar]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        let enlace = "";
        if (btn.dataset.modalidad === "VIRTUAL") {
          enlace = prompt("Pega el enlace de videollamada para esta sesion (Meet, Zoom, Teams...):", "https://meet.tutoresonline.com/sala-" + btn.dataset.aceptar) || "";
        }
        await DataService.actualizarEstadoReserva(btn.dataset.aceptar, "ACEPTADA", "", { enlaceVirtual: enlace });
        UI.toast("Solicitud aceptada.", "success");
        cargarReservas();
      });
    });
    wrap.querySelectorAll("[data-rechazar]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("rech-id-reserva").value = btn.dataset.rechazar;
        document.getElementById("modal-rechazar").classList.add("open");
      });
    });
  }

  document.getElementById("cerrar-modal-rechazo").addEventListener("click", () => document.getElementById("modal-rechazar").classList.remove("open"));
  document.getElementById("form-rechazo").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("rech-id-reserva").value;
    const motivo = document.getElementById("rech-motivo").value.trim();
    await DataService.actualizarEstadoReserva(id, "RECHAZADA", motivo);
    document.getElementById("modal-rechazar").classList.remove("open");
    document.getElementById("form-rechazo").reset();
    UI.toast("Solicitud rechazada.", "info");
    cargarReservas();
  });

  function renderHistorial(lista) {
    const wrap = document.getElementById("historial-wrap");
    if (!lista.length) {
      wrap.innerHTML = `<p class="text-muted">Aun no tienes tutorias en tu historial.</p>`;
      return;
    }
    wrap.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Estudiante</th><th>Materia</th><th>Fecha</th><th>Estado</th><th>Calificacion</th></tr></thead>
          <tbody>
            ${lista.map((r) => `
              <tr>
                <td>${r.estudianteNombre}</td>
                <td>${r.materiaNombre}</td>
                <td>${UI.formatDate(r.fechaSesion)}</td>
                <td>${estadoBadge(r.estado)}</td>
                <td>${r.calificacion ? "★ " + r.calificacion.puntuacion : "—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // ---------- Disponibilidad ----------
  async function cargarAgenda() {
    const wrap = document.getElementById("agenda-wrap");
    const slots = idTutor ? await DataService.listDisponibilidadByTutor(idTutor) : [];
    wrap.innerHTML = slots.length
      ? slots.map((d) => `
          <div class="day-slot">
            <strong style="min-width:110px;">${UI.diaSemanaLabel(d.diaSemana)}</strong>
            <span>${d.horaInicio} - ${d.horaFin}</span>
            <span class="badge badge-aceptada">${d.modalidad === "AMBAS" ? "Virtual y presencial" : d.modalidad}</span>
            <button class="btn btn-ghost btn-sm" data-quitar="${d.id}" style="margin-left:auto;">Quitar</button>
          </div>
        `).join("")
      : `<p class="text-muted">No has agregado franjas de disponibilidad.</p>`;

    wrap.querySelectorAll("[data-quitar]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await DataService.removeDisponibilidad(btn.dataset.quitar);
        cargarAgenda();
      });
    });
  }

  document.getElementById("form-disponibilidad").addEventListener("submit", async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById("disponibilidad-alert");
    alertBox.innerHTML = "";
    const inicio = document.getElementById("d-inicio").value;
    const fin = document.getElementById("d-fin").value;
    if (inicio >= fin) {
      alertBox.innerHTML = `<div class="alert alert-danger">La hora de fin debe ser posterior a la de inicio.</div>`;
      return;
    }
    if (!idTutor) return;
    await DataService.addDisponibilidad(idTutor, {
      diaSemana: document.getElementById("d-dia").value,
      horaInicio: inicio, horaFin: fin,
      modalidad: document.getElementById("d-modalidad").value,
    });
    UI.toast("Franja agregada a tu disponibilidad.", "success");
    e.target.reset();
    cargarAgenda();
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
  await cargarAgenda();
  await cargarNotificaciones();
})();
