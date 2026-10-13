(async function () {
  await UI.renderHeader();
  UI.renderFooter();

  const existing = await DataService.me();
  if (existing) {
    window.location.href = existing.rol === "TUTOR" ? "dashboard-tutor.html" : "dashboard-estudiante.html";
    return;
  }

  const form = document.getElementById("form-login");
  const alertBox = document.getElementById("form-alert");
  const btn = document.getElementById("btn-submit");

  function setError(field, message) {
    const el = form.querySelector(`[data-error-for="${field}"]`);
    if (el) el.textContent = message || "";
    form.querySelector(`#${field}`)?.closest(".field")?.classList.toggle("has-error", !!message);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.innerHTML = "";
    setError("email", ""); setError("password", "");

    const email = form.email.value.trim();
    const password = form.password.value;
    let ok = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email", "Ingresa un correo valido."); ok = false; }
    if (!password) { setError("password", "Ingresa tu contraseña."); ok = false; }
    if (!ok) return;

    btn.disabled = true;
    btn.querySelector(".btn-label").innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Verificando...';

    try {
      const { user } = await DataService.login({ email, password });
      UI.toast(`Bienvenido/a, ${user.nombre}.`, "success");
      setTimeout(() => {
        window.location.href = user.rol === "TUTOR" ? "dashboard-tutor.html" : "dashboard-estudiante.html";
      }, 500);
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
      btn.disabled = false;
      btn.querySelector(".btn-label").textContent = "Iniciar sesion";
    }
  });
})();
