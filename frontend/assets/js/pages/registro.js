(async function () {
  await UI.renderHeader();
  UI.renderFooter();

  const form = document.getElementById("form-registro");
  const roleToggle = document.getElementById("role-toggle");
  const camposEstudiante = document.getElementById("campos-estudiante");
  const camposTutor = document.getElementById("campos-tutor");
  const alertBox = document.getElementById("form-alert");
  const btn = document.getElementById("btn-submit");

  let rolSeleccionado = "ESTUDIANTE";

  const params = new URLSearchParams(location.search);
  if (params.get("rol") === "TUTOR") rolSeleccionado = "TUTOR";

  function pintarRol() {
    roleToggle.querySelectorAll(".role-option").forEach((opt) => {
      const activo = opt.dataset.rol === rolSeleccionado;
      opt.classList.toggle("selected", activo);
      opt.setAttribute("aria-checked", String(activo));
    });
    camposEstudiante.style.display = rolSeleccionado === "ESTUDIANTE" ? "block" : "none";
    camposTutor.style.display = rolSeleccionado === "TUTOR" ? "block" : "none";
  }

  roleToggle.querySelectorAll(".role-option").forEach((opt) => {
    opt.addEventListener("click", () => { rolSeleccionado = opt.dataset.rol; pintarRol(); });
    opt.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); rolSeleccionado = opt.dataset.rol; pintarRol(); }
    });
  });
  pintarRol();

  try {
    const materias = await DataService.listMaterias();
    const select = document.getElementById("materias");
    select.innerHTML = materias.map((m) => `<option value="${m.id}">${m.nombre}</option>`).join("");
  } catch (e) { console.error(e); }

  function setError(field, message) {
    const el = form.querySelector(`[data-error-for="${field}"]`);
    const input = form.querySelector(`#${field}`);
    if (el) el.textContent = message || "";
    if (input) input.closest(".field")?.classList.toggle("has-error", !!message);
  }

  function validar(data) {
    let ok = true;
    ["nombre", "apellido", "email", "password", "password2"].forEach((f) => setError(f, ""));
    setError("terminos", "");

    if (!data.nombre || data.nombre.trim().length < 2) { setError("nombre", "Ingresa tu nombre."); ok = false; }
    if (!data.apellido || data.apellido.trim().length < 2) { setError("apellido", "Ingresa tu apellido."); ok = false; }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(data.email || "")) { setError("email", "Ingresa un correo valido."); ok = false; }

    if (!data.password || data.password.length < 8) { setError("password", "Minimo 8 caracteres."); ok = false; }
    else if (!/[A-Za-z]/.test(data.password) || !/[0-9]/.test(data.password)) {
      setError("password", "Debe incluir letras y numeros."); ok = false;
    }
    if (data.password !== data.password2) { setError("password2", "Las contraseñas no coinciden."); ok = false; }

    if (!form.terminos.checked) { setError("terminos", "Debes aceptar los terminos para continuar."); ok = false; }

    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.innerHTML = "";

    const data = {
      nombre: form.nombre.value.trim(),
      apellido: form.apellido.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      password: form.password.value,
      password2: form.password2.value,
    };

    if (!validar(data)) return;

    const extra = rolSeleccionado === "ESTUDIANTE"
      ? { nivelEducativo: form.nivelEducativo.value, institucion: form.institucion.value.trim() }
      : {
          ciudad: form.ciudad.value.trim(),
          tarifaHora: form.tarifaHora.value,
          aniosExperiencia: form.aniosExperiencia.value,
          modalidad: form.modalidad.value,
          biografia: form.biografia.value.trim(),
          materias: Array.from(form.materias.selectedOptions).map((o) => Number(o.value)),
        };

    btn.disabled = true;
    btn.querySelector(".btn-label").innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Creando cuenta...';

    try {
      await DataService.register({ ...data, rol: rolSeleccionado, extra });
      UI.toast("¡Cuenta creada con exito! Bienvenido a Tutores On-Line.", "success");
      setTimeout(() => {
        window.location.href = rolSeleccionado === "TUTOR" ? "dashboard-tutor.html" : "dashboard-estudiante.html";
      }, 700);
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
      btn.disabled = false;
      btn.querySelector(".btn-label").textContent = "Crear cuenta";
    }
  });
})();
