# Guia de despliegue — Tutores On-Line

Este documento explica como publicar el proyecto. Se divide en lo que **ya esta listo** (archivos de configuracion) y lo que **requiere una accion tuya** (crear cuentas, hacer clic en botones, pegar credenciales) porque esta sesion no tiene acceso a tus cuentas de hosting ni a tu instancia de Oracle.

## 1. Frontend — GitHub Pages (automatico)

Ya existe el workflow `.github/workflows/deploy-pages.yml`, que publica la carpeta `frontend/` cada vez que hay un push a la rama `main`.

**Lo que debes hacer tu (una sola vez):**
1. Fusiona (merge) esta rama de trabajo a `main` (o pide que se abra un Pull Request y acéptalo).
2. Entra a tu repositorio en GitHub → **Settings** → **Pages**.
3. En "Build and deployment" → "Source", selecciona **GitHub Actions**.
4. Haz un push a `main` (o ejecuta el workflow manualmente desde la pestaña **Actions** → "Publicar frontend en GitHub Pages" → "Run workflow").
5. En unos minutos, GitHub te dara la URL publica (formato `https://<tu-usuario>.github.io/<tu-repo>/`).

**Estado:** diseñado e implementado. La publicacion real esta pendiente de que actives Pages y hagas el push a `main`, porque esta sesion no tiene permisos para cambiar la configuracion de tu repositorio en GitHub ni para fusionar ramas sin tu autorizacion.

Recuerda: el frontend corre en **modo demostracion** (`MODO_DATOS: "local"` en `frontend/assets/js/config.js`), por lo que la URL de GitHub Pages sera completamente navegable (registro, login, busqueda, reservas) sin necesitar el backend desplegado.

## 2. Backend — Render.com (o similar)

Ya existe `backend/render.yaml` con la configuracion lista para desplegar en Render (plan gratuito).

**Lo que debes hacer tu:**
1. Crea una cuenta gratuita en [render.com](https://render.com) y conecta tu GitHub.
2. "New" → "Blueprint" → selecciona este repositorio. Render detectara `backend/render.yaml`.
3. Completa las variables de entorno que pide (`CORS_ORIGIN` con la URL de tu GitHub Pages, y `ORACLE_USER`/`ORACLE_PASSWORD`/`ORACLE_CONNECT_STRING` con los datos de tu instancia Oracle).
4. Despliega. Render te dara una URL publica para la API (ej: `https://tutores-online-api.onrender.com`).
5. Cambia `MODO_DATOS: "api"` y `API_BASE_URL` en `frontend/assets/js/config.js` para que el frontend use el backend real, y vuelve a publicar el frontend.

**Estado:** diseñado e implementado. El despliegue real esta pendiente de que crees la cuenta en Render y proporciones las credenciales de tu base de datos Oracle, que esta sesion no tiene ni debe solicitar directamente.

## 3. Base de datos — Oracle APEX

Ver `database/oracle/README.md` para el orden de ejecucion de los scripts SQL. Necesitas un workspace de Oracle APEX (puedes crear uno gratis en [apex.oracle.com](https://apex.oracle.com)) y ejecutar los 4 scripts en orden desde **SQL Workshop → SQL Scripts**.

**Estado:** scripts completos y listos para ejecutar. La ejecucion real y la obtencion de los datos de conexion (`ORACLE_CONNECT_STRING`, etc.) quedan pendientes porque requieren que crees tu propio workspace de Oracle APEX.

## Resumen de honestidad tecnica

| Componente | Estado |
|---|---|
| Frontend (modo demostracion) | ✅ Implementado y probado localmente |
| Workflow de GitHub Pages | ✅ Implementado, pendiente de que actives Pages y hagas push a `main` |
| Backend (API REST + Oracle) | ✅ Implementado y probado (arranque, rutas, validaciones, errores) sin Oracle conectado |
| Conexion real a Oracle | ⏳ Pendiente — requiere que proporciones un workspace/instancia Oracle |
| Despliegue real del backend | ⏳ Pendiente — requiere que crees una cuenta de hosting (Render u otro) |
