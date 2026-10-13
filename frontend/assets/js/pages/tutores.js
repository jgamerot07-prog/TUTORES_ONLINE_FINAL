(async function () {
  await UI.renderHeader("tutores");
  UI.renderFooter();

  const form = document.getElementById("form-filtros");
  const resultados = document.getElementById("resultados");
  const resultsCount = document.getElementById("results-count");
  const selectMateria = document.getElementById("materia");

  const params = new URLSearchParams(location.search);

  try {
    const materias = await DataService.listMaterias();
    selectMateria.innerHTML += materias.map((m) => `<option value="${m.id}">${m.nombre}</option>`).join("");
    if (params.get("materia")) selectMateria.value = params.get("materia");
  } catch (e) { console.error(e); }

  function tutorCardHtml(t) {
    return `
      <article class="card card-hover tutor-card">
        <div class="tutor-card__head">
          <span class="avatar-circle">${UI.initials(t.nombre)}</span>
          <div>
            <p class="tutor-card__name">${t.nombre} ${t.verificado ? "✅" : ""}</p>
            <p class="tutor-card__city">${t.ciudad || "—"} · ${t.modalidad === "AMBAS" ? "Virtual y presencial" : t.modalidad === "VIRTUAL" ? "Virtual" : "Presencial"}</p>
          </div>
        </div>
        <div class="rating">★ ${t.calificacionPromedio ? t.calificacionPromedio.toFixed(1) : "Nuevo"} ${t.totalResenas ? `<span class="count">(${t.totalResenas} reseñas)</span>` : ""}</div>
        <div class="tag-list">${t.materiasDetalle.map((m) => `<span class="tag">${m.nombre}</span>`).join("") || '<span class="text-muted">Sin materias registradas</span>'}</div>
        <div class="tutor-card__footer">
          <span class="price">${UI.formatCurrency(t.tarifaHora)} <small>/ hora</small></span>
          <a href="perfil-tutor.html?id=${t.id}" class="btn btn-primary btn-sm">Ver perfil</a>
        </div>
      </article>
    `;
  }

  async function buscar() {
    resultados.innerHTML = "";
    UI.setLoading(resultados, true, "Buscando tutores...");

    const filtros = {
      q: form.q.value.trim(),
      materiaId: form.materia.value,
      modalidad: form.modalidad.value,
      ordenar: form.ordenar.value,
    };

    try {
      const tutores = await DataService.listTutores(filtros);
      resultsCount.textContent = `${tutores.length} tutor${tutores.length === 1 ? "" : "es"} encontrado${tutores.length === 1 ? "" : "s"}`;
      resultados.innerHTML = tutores.length
        ? tutores.map(tutorCardHtml).join("")
        : `<div class="empty-state" style="grid-column:1/-1;"><div class="icon">🔍</div><p>No encontramos tutores con esos filtros.</p><button class="btn btn-secondary btn-sm" id="btn-limpiar-vacio">Limpiar filtros</button></div>`;

      const btnVacio = document.getElementById("btn-limpiar-vacio");
      if (btnVacio) btnVacio.addEventListener("click", limpiar);
    } catch (err) {
      resultados.innerHTML = `<div class="alert alert-danger" style="grid-column:1/-1;">${err.message}</div>`;
    }
  }

  function limpiar() {
    form.reset();
    buscar();
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); buscar(); });
  document.getElementById("btn-limpiar").addEventListener("click", limpiar);

  if (params.get("materia")) {
    buscar();
  } else {
    buscar();
  }
})();
