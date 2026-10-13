/**
 * Utilidades de interfaz compartidas por todas las paginas: header, footer,
 * menu movil, toasts, formateo y proteccion de rutas por rol.
 */
(function () {
  const NAV_LINKS = [
    { href: "../index.html", rootHref: "index.html", label: "Inicio", key: "inicio" },
    { href: "tutores.html", rootHref: "pages/tutores.html", label: "Buscar tutores", key: "tutores" },
    { href: "como-funciona.html", rootHref: "pages/como-funciona.html", label: "Como funciona", key: "como-funciona" },
  ];

  function isRootPage() {
    return !location.pathname.includes("/pages/");
  }

  function linkHref(link) {
    return isRootPage() ? link.rootHref : link.href;
  }

  function pagesPath(file) {
    return isRootPage() ? "pages/" + file : file;
  }
  function rootPath(file) {
    return isRootPage() ? file : "../" + file;
  }
  function assetPath(file) {
    return isRootPage() ? "assets/" + file : "../assets/" + file;
  }

  function initials(nombre) {
    if (!nombre) return "?";
    return nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
  }

  async function renderHeader(activeKey) {
    const mount = document.getElementById("site-header");
    if (!mount) return;
    const session = typeof DataService !== "undefined" ? await DataService.me() : null;

    const navHtml = NAV_LINKS.map(
      (l) => `<a href="${linkHref(l)}" class="${l.key === activeKey ? "active" : ""}">${l.label}</a>`
    ).join("");

    let actionsHtml;
    if (session) {
      const dashboardHref = session.rol === "TUTOR" ? pagesPath("dashboard-tutor.html") : pagesPath("dashboard-estudiante.html");
      actionsHtml = `
        <a href="${dashboardHref}" class="user-chip">
          <span class="avatar-circle">${initials(session.nombre + " " + session.apellido)}</span>
          <span>${session.nombre}</span>
        </a>
        <button class="btn btn-ghost btn-sm" id="btn-logout" type="button">Salir</button>
      `;
    } else {
      actionsHtml = `
        <a href="${pagesPath("login.html")}" class="btn btn-ghost btn-sm">Iniciar sesion</a>
        <a href="${pagesPath("registro.html")}" class="btn btn-primary btn-sm">Registrarme</a>
      `;
    }

    mount.innerHTML = `
      <div class="container">
        <a href="${rootPath("index.html")}" class="brand">
          <span class="brand-mark">TO</span>
          <span>Tutores On-Line</span>
        </a>
        <nav class="main-nav" id="main-nav" aria-label="Navegacion principal">
          ${navHtml}
        </nav>
        <div class="nav-actions" id="nav-actions-desktop">${actionsHtml}</div>
        <button class="nav-toggle" id="nav-toggle" aria-label="Abrir menu" aria-expanded="false">&#9776;</button>
      </div>
    `;

    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("main-nav");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        DataService.logout();
        window.location.href = rootPath("index.html");
      });
    }
  }

  function renderFooter() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;
    mount.innerHTML = `
      <div class="container footer-grid">
        <div>
          <h4>Tutores On-Line</h4>
          <p class="text-muted" style="color:#94a3b8;">Conectamos estudiantes con tutores calificados para clases virtuales y presenciales. Proyecto academico — Ingenieria, CUC.</p>
        </div>
        <div>
          <h4>Plataforma</h4>
          <ul>
            <li><a href="${pagesPath("tutores.html")}">Buscar tutores</a></li>
            <li><a href="${pagesPath("registro.html")}">Registrarme</a></li>
            <li><a href="${pagesPath("como-funciona.html")}">Como funciona</a></li>
          </ul>
        </div>
        <div>
          <h4>Soporte</h4>
          <ul>
            <li><a href="${pagesPath("ayuda.html")}">Centro de ayuda</a></li>
            <li><a href="mailto:soporte@tutoresonline.com">soporte@tutoresonline.com</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">© ${new Date().getFullYear()} Tutores On-Line — Proyecto academico. Todos los derechos reservados.</div>
    `;
  }

  function toast(message, type) {
    let region = document.getElementById("toast-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "toast-region";
      document.body.appendChild(region);
    }
    const el = document.createElement("div");
    el.className = "toast toast-" + (type || "info");
    el.textContent = message;
    region.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  function formatCurrency(value) {
    return "$" + Number(value || 0).toLocaleString("es-CO") + " COP";
  }

  function formatDate(isoDate) {
    if (!isoDate) return "";
    const d = new Date(isoDate + (isoDate.length <= 10 ? "T00:00:00" : ""));
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
  }

  function diaSemanaLabel(key) {
    const map = { LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Miercoles", JUEVES: "Jueves", VIERNES: "Viernes", SABADO: "Sabado", DOMINGO: "Domingo" };
    return map[key] || key;
  }

  async function requireAuth(options) {
    options = options || {};
    const user = await DataService.me();
    if (!user) {
      toast("Debes iniciar sesion para continuar.", "info");
      setTimeout(() => (window.location.href = "login.html"), 600);
      return null;
    }
    if (options.rol && user.rol !== options.rol) {
      toast("No tienes permiso para ver esta pagina.", "danger");
      setTimeout(() => (window.location.href = user.rol === "TUTOR" ? "dashboard-tutor.html" : "dashboard-estudiante.html"), 600);
      return null;
    }
    return user;
  }

  function setLoading(container, visible, label) {
    if (!container) return;
    if (visible) {
      container.innerHTML = `<div class="loading-state"><span class="spinner" aria-hidden="true"></span><span>${label || "Cargando..."}</span></div>`;
    }
  }

  window.UI = { renderHeader, renderFooter, toast, formatCurrency, formatDate, diaSemanaLabel, requireAuth, setLoading, initials, assetPath };
})();
