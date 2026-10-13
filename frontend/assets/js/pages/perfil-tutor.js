(async function () {
  await UI.renderHeader("tutores");
  UI.renderFooter();

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const loadingEl = document.getElementById("perfil-loading");
  const contentEl = document.getElementById("perfil-content");
  const notFoundEl = document.getElementById("perfil-not-found");

  if (!id) { loadingEl.style.display = "none"; notFoundEl.style.display = "block"; return; }

  let tutor;
  try {
    tutor = await DataService.getTutorById(id);
  } catch (e) {
    console.error(e);
  }

  loadingEl.style.display = "none";
  if (!tutor) { notFoundEl.style.display = "block"; return; }
  contentEl.style.display = "block";

  document.title = `${tutor.nombre} — Tutores On-Line`;
  document.getElementById("perfil-avatar").textContent = UI.initials(tutor.nombre);
  document.getElementById("perfil-nombre").textContent = tutor.nombre + (tutor.verificado ? " ✅" : "");
  document.getElementById("perfil-meta").textContent =
    `${tutor.ciudad || "Modalidad virtual"} · ${tutor.aniosExperiencia} años de experiencia · ${UI.formatCurrency(tutor.tarifaHora)}/hora`;
  document.getElementById("perfil-rating").innerHTML =
    `★ ${tutor.calificacionPromedio ? tutor.calificacionPromedio.toFixed(1) : "Nuevo"} <span class="count">(${tutor.totalResenas} reseñas)</span>`;
  document.getElementById("perfil-materias").innerHTML =
    tutor.materiasDetalle.map((m) => `<span class="tag">${m.nombre}</span>`).join("");
  document.getElementById("perfil-bio").textContent = tutor.biografia || "Este tutor aun no ha escrito su biografia.";

  // ---------- Disponibilidad ----------
  const dispWrap = document.getElementById("perfil-disponibilidad");
  if (tutor.disponibilidad.length) {
    dispWrap.innerHTML = tutor.disponibilidad.map((d) => `
      <div class="day-slot">
        <strong style="min-width:110px;">${UI.diaSemanaLabel(d.diaSemana)}</strong>
        <span>${d.horaInicio} - ${d.horaFin}</span>
        <span class="badge badge-aceptada">${d.modalidad === "AMBAS" ? "Virtual y presencial" : d.modalidad}</span>
      </div>
    `).join("");
  } else {
    dispWrap.innerHTML = `<p class="text-muted">Este tutor aun no ha publicado su disponibilidad.</p>`;
  }

  // ---------- Reseñas ----------
  const resenasWrap = document.getElementById("perfil-resenas");
  if (tutor.resenas.length) {
    resenasWrap.innerHTML = tutor.resenas.map((r) => `
      <div class="review-item">
        <div class="review-head"><strong>${r.estudianteNombre}</strong><span>★ ${r.puntuacion}</span></div>
        <p class="text-muted" style="margin:0;">${r.comentario || ""}</p>
      </div>
    `).join("");
  } else {
    resenasWrap.innerHTML = `<p class="text-muted">Aun no tiene reseñas. ¡Se el primero en calificarlo!</p>`;
  }

  // ---------- Formulario de reserva ----------
  const form = document.getElementById("form-reserva");
  const selectMateria = document.getElementById("r-materia");
  selectMateria.innerHTML = tutor.materiasDetalle.map((m) => `<option value="${m.id}">${m.nombre}</option>`).join("");

  const modalidadesDisponibles = tutor.modalidad === "AMBAS" ? ["VIRTUAL", "PRESENCIAL"] : [tutor.modalidad];
  const switchWrap = document.getElementById("modalidad-switch");
  switchWrap.innerHTML = modalidadesDisponibles.map((m, i) => `
    <label>
      <input type="radio" name="modalidad" value="${m}" ${i === 0 ? "checked" : ""} />
      <span>${m === "VIRTUAL" ? "Virtual" : "Presencial"}</span>
    </label>
  `).join("");
  document.getElementById("campo-ubicacion").style.display = modalidadesDisponibles[0] === "PRESENCIAL" ? "block" : "none";
  switchWrap.addEventListener("change", (e) => {
    document.getElementById("campo-ubicacion").style.display = e.target.value === "PRESENCIAL" ? "block" : "none";
  });

  const fechaInput = document.getElementById("r-fecha");
  const manana = new Date(); manana.setDate(manana.getDate() + 1);
  fechaInput.min = manana.toISOString().slice(0, 10);

  const slotGroup = document.getElementById("slot-pill-group");
  let horaSeleccionada = null;

  function generarSlots(horaInicio, horaFin) {
    const slots = [];
    let [h, m] = horaInicio.split(":").map(Number);
    const [hf, mf] = horaFin.split(":").map(Number);
    while (h < hf || (h === hf && m < mf)) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      h += 1;
    }
    return slots;
  }

  const diaIndexMap = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

  fechaInput.addEventListener("change", () => {
    horaSeleccionada = null;
    const fecha = new Date(fechaInput.value + "T00:00:00");
    const diaKey = diaIndexMap[fecha.getDay()];
    const disp = tutor.disponibilidad.find((d) => d.diaSemana === diaKey);

    if (!disp) {
      slotGroup.innerHTML = `<span class="text-muted" style="font-size:var(--fs-sm);">El tutor no atiende los ${UI.diaSemanaLabel(diaKey).toLowerCase()}.</span>`;
      return;
    }
    const slots = generarSlots(disp.horaInicio, disp.horaFin);
    slotGroup.innerHTML = slots.map((s) => `<button type="button" class="slot-pill" data-hora="${s}">${s}</button>`).join("");
    slotGroup.querySelectorAll(".slot-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        slotGroup.querySelectorAll(".slot-pill").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        horaSeleccionada = btn.dataset.hora;
      });
    });
  });

  const alertBox = document.getElementById("reserva-alert");
  const btnReservar = document.getElementById("btn-reservar");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.innerHTML = "";
    document.querySelector('[data-error-for="r-fecha"]').textContent = "";
    document.querySelector('[data-error-for="r-hora"]').textContent = "";

    const user = await UI.requireAuth({ rol: "ESTUDIANTE" });
    if (!user) return;

    let ok = true;
    if (!fechaInput.value) { document.querySelector('[data-error-for="r-fecha"]').textContent = "Elige una fecha."; ok = false; }
    if (!horaSeleccionada) { document.querySelector('[data-error-for="r-hora"]').textContent = "Elige una hora disponible."; ok = false; }
    if (!ok) return;

    const modalidad = form.modalidad.value;
    const perfil = await DataService.getPerfilCompleto(user.id);
    const idEstudiante = perfil.estudiante ? perfil.estudiante.id : null;
    if (!idEstudiante) {
      alertBox.innerHTML = `<div class="alert alert-danger">Tu cuenta no tiene un perfil de estudiante asociado.</div>`;
      return;
    }

    const [hh, mm] = horaSeleccionada.split(":").map(Number);
    const horaFin = `${String(hh + 1).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

    btnReservar.disabled = true;
    btnReservar.querySelector(".btn-label").innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Enviando...';

    try {
      await DataService.crearReserva({
        idEstudiante,
        idTutor: tutor.id,
        idMateria: Number(form.materia.value),
        fechaSesion: fechaInput.value,
        horaInicio: horaSeleccionada,
        horaFin,
        modalidad,
        ubicacion: form.ubicacion.value.trim(),
        comentarioEstudiante: form.comentario.value.trim(),
      });
      UI.toast("¡Solicitud enviada! El tutor debe confirmarla.", "success");
      alertBox.innerHTML = `<div class="alert alert-success">Tu solicitud fue enviada. Puedes ver su estado en tu <a href="dashboard-estudiante.html">panel de reservas</a>.</div>`;
      form.reset();
      slotGroup.innerHTML = `<span class="text-muted" style="font-size:var(--fs-sm);">Elige primero una fecha.</span>`;
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    } finally {
      btnReservar.disabled = false;
      btnReservar.querySelector(".btn-label").textContent = "Enviar solicitud de tutoria";
    }
  });
})();
