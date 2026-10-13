(async function () {
  await UI.renderHeader("inicio");
  UI.renderFooter();

  try {
    const [tutores, materias] = await Promise.all([DataService.listTutores({}), DataService.listMaterias()]);

    document.getElementById("stat-tutores").textContent = tutores.length;
    document.getElementById("stat-materias").textContent = materias.length;

    const pillsWrap = document.getElementById("materias-pills");
    pillsWrap.innerHTML = materias
      .map((m) => `<a class="subject-pill" href="pages/tutores.html?materia=${m.id}">${m.nombre}</a>`)
      .join("");

    const destacado = tutores[0];
    const preview = document.getElementById("hero-tutor-preview");
    if (destacado) {
      preview.innerHTML = `
        <div class="tutor-card">
          <div class="tutor-card__head">
            <span class="avatar-circle">${UI.initials(destacado.nombre)}</span>
            <div>
              <p class="tutor-card__name">${destacado.nombre}</p>
              <p class="tutor-card__city">${destacado.ciudad || "Modalidad virtual"}</p>
            </div>
          </div>
          <div class="rating">★ ${destacado.calificacionPromedio.toFixed(1)} <span class="count">(${destacado.totalResenas} reseñas)</span></div>
          <div class="tag-list">
            ${destacado.materiasDetalle.slice(0, 3).map((m) => `<span class="tag">${m.nombre}</span>`).join("")}
          </div>
          <div class="tutor-card__footer">
            <span class="price">${UI.formatCurrency(destacado.tarifaHora)} <small>/ hora</small></span>
            <a href="pages/perfil-tutor.html?id=${destacado.id}" class="btn btn-primary btn-sm">Ver perfil</a>
          </div>
        </div>
      `;
    } else {
      preview.innerHTML = `<div class="empty-state">Aun no hay tutores registrados.</div>`;
    }
  } catch (err) {
    console.error(err);
    UI.toast("No se pudieron cargar los datos de inicio.", "danger");
  }
})();
