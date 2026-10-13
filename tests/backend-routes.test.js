/**
 * Pruebas de integracion ligeras sobre las rutas HTTP del backend.
 * No requieren Oracle: validan health check, manejo de errores,
 * autenticacion y validacion de entradas.
 * Ejecutar con: node --test tests/backend-routes.test.js
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const app = require(path.join("..", "backend", "src", "app"));

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("GET /api/health responde ok y reporta el estado de Oracle", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.status, "ok");
  assert.equal(typeof body.oracleConfigurado, "boolean");
});

test("GET /api/ruta-inexistente devuelve 404", async () => {
  const res = await fetch(`${baseUrl}/api/ruta-inexistente`);
  assert.equal(res.status, 404);
});

test("GET /api/reservas sin token devuelve 401", async () => {
  const res = await fetch(`${baseUrl}/api/reservas`);
  assert.equal(res.status, 401);
});

test("POST /api/auth/registro sin datos devuelve 400 con mensaje claro", async () => {
  const res = await fetch(`${baseUrl}/api/auth/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.ok(body.message.length > 0);
});

test("POST /api/auth/login sin datos devuelve 400", async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "" }),
  });
  assert.equal(res.status, 400);
});

test("GET /api/materias sin Oracle configurado devuelve 503 (no 500)", async () => {
  const res = await fetch(`${baseUrl}/api/materias`);
  assert.ok([200, 503].includes(res.status), "debe ser 200 si Oracle esta configurado o 503 si no");
});
