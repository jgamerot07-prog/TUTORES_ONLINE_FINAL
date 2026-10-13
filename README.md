# Tutores On-Line

Plataforma web que conecta estudiantes con tutores calificados para recibir clases virtuales o presenciales. Proyecto academico — Ingenieria Electrica, Corporacion Universitaria de la Costa (CUC).

## Objetivo general

Permitir que un estudiante encuentre tutores por materia, consulte su perfil y disponibilidad, y reserve sesiones de tutoria; y que un tutor administre su perfil, su disponibilidad y las solicitudes que recibe.

## Tecnologias utilizadas

| Capa | Tecnologia |
|---|---|
| Frontend | HTML5, CSS3 (sin frameworks), JavaScript vanilla (ES6+) |
| Backend | Node.js + Express (API REST) |
| Autenticacion | JWT + bcrypt (hash de contraseñas) |
| Base de datos | Oracle Database / Oracle APEX (Oracle SQL) |
| Despliegue previsto | GitHub Pages (frontend) + Render.com (backend) |

## Estructura del repositorio

```
TUTORES_ONLINE_FINAL/
├── frontend/              # Interfaz de usuario (HTML/CSS/JS), 100% navegable en modo demo
│   ├── index.html
│   ├── pages/              # Resto de las pantallas
│   └── assets/
│       ├── css/             # Sistema de diseño (variables, componentes, formularios, dashboard)
│       └── js/
│           ├── config.js       # Interruptor modo local (demo) / modo API real
│           ├── data/           # Capa de datos: local-provider, api-provider, index
│           ├── ui.js            # Header, footer, toasts, utilidades compartidas
│           └── pages/           # Logica especifica de cada pantalla
├── backend/                # API REST (Node.js + Express + Oracle)
│   └── src/
│       ├── config/           # Entorno y conexion a Oracle (modo "thin", sin cliente nativo)
│       ├── controllers/      # Logica de cada recurso
│       ├── models/           # Consultas SQL parametrizadas (sin concatenar strings)
│       ├── routes/           # Definicion de endpoints
│       └── middleware/       # Autenticacion JWT y manejo de errores
├── database/
│   ├── oracle/              # Scripts SQL (DDL, indices, datos de prueba, consultas de validacion)
│   └── diagrams/             # Diagrama entidad-relacion (.mmd y .png)
├── docs/                    # Documentacion y entregables del corte academico
└── tests/                   # Pruebas automatizadas (backend)
```

## Como funciona el modo demostracion (muy importante)

El frontend puede operar en dos modos, controlados en `frontend/assets/js/config.js`:

- **`MODO_DATOS: "local"` (por defecto):** toda la aplicacion funciona usando `localStorage` del navegador como base de datos de demostracion. Esto permite que el sitio sea **100% navegable publicado en GitHub Pages**, sin necesitar que el backend ni Oracle esten desplegados — ideal para que el docente evalue el flujo completo (registro, login, busqueda, reservas, calificaciones).
- **`MODO_DATOS: "api"`:** el frontend consume la API REST real (`backend/`), conectada a Oracle Database.

Ambos modos implementan exactamente la misma interfaz (`DataService`), por lo que cambiar de uno a otro no requiere tocar el resto del codigo.

## Ejecucion local

### 1. Frontend (modo demostracion, sin backend)

```bash
npx http-server frontend -p 8080
# abre http://localhost:8080
```

Usuarios de prueba (contraseña para todos: `Tutores2025*`):
- Tutor: `laura.martinez@tutoresonline.com`
- Estudiante: `juan.perez@estudiante.com`

### 2. Backend (API REST)

```bash
cd backend
cp .env.example .env   # completa tus credenciales de Oracle
npm install
npm run dev             # http://localhost:3000
```

El backend arranca correctamente **incluso sin Oracle configurado**: el endpoint `GET /api/health` indica si la conexion esta lista, y los endpoints que requieren datos responden `503` con un mensaje claro en vez de fallar de forma confusa.

### 3. Base de datos Oracle

Ver [`database/oracle/README.md`](database/oracle/README.md) para el orden de ejecucion de los scripts en Oracle APEX SQL Workshop.

### 4. Pruebas automatizadas

```bash
npm test   # ejecuta tests/*.test.js (utilidades de auth + rutas HTTP), no requiere Oracle
```

## Despliegue

Ver [`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md) para el detalle de que esta automatizado (workflow de GitHub Pages) y que pasos manuales faltan (activar Pages, crear cuenta de hosting del backend, proveer una instancia Oracle).

## Documentacion de base de datos

Ver [`database/oracle/README.md`](database/oracle/README.md) (orden de scripts y explicacion del modelo) y el diagrama en [`database/diagrams/modelo_entidad_relacion.png`](database/diagrams/modelo_entidad_relacion.png).

## Estado del proyecto

| Area | Estado |
|---|---|
| Frontend navegable (modo demo) | ✅ Implementado y probado en navegador (Chromium headless) |
| Backend API REST | ✅ Implementado y probado (arranque, validaciones, auth, manejo de errores) |
| Diseño de base de datos Oracle | ✅ Modelo, scripts SQL, datos de prueba y diagrama completos |
| Conexion real a Oracle | ⏳ Pendiente de una instancia Oracle APEX real |
| Despliegue publico | ⏳ Pendiente de activar GitHub Pages / crear cuenta de hosting del backend |

## Licencia

Proyecto academico sin fines comerciales.
