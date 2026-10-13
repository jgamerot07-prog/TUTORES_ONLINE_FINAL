/**
 * Pruebas unitarias de las utilidades del backend que NO requieren conexion
 * a Oracle (hash de contraseñas y JWT). Se ejecutan con el test runner
 * nativo de Node.js: `node --test tests/backend-utils.test.js`
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { hashPassword, compararPassword } = require(path.join("..", "backend", "src", "utils", "password"));
const { firmarToken, verificarToken } = require(path.join("..", "backend", "src", "utils", "jwt"));

test("hashPassword genera un hash distinto al texto plano", async () => {
  const hash = await hashPassword("Tutores2025*");
  assert.notEqual(hash, "Tutores2025*");
  assert.ok(hash.startsWith("$2"));
});

test("compararPassword valida correctamente la contraseña correcta e incorrecta", async () => {
  const hash = await hashPassword("Tutores2025*");
  assert.equal(await compararPassword("Tutores2025*", hash), true);
  assert.equal(await compararPassword("otraClave", hash), false);
});

test("firmarToken / verificarToken hace round-trip del payload", () => {
  const token = firmarToken({ id: 1, rol: "ESTUDIANTE", email: "test@demo.com" });
  const payload = verificarToken(token);
  assert.equal(payload.id, 1);
  assert.equal(payload.rol, "ESTUDIANTE");
});

test("verificarToken rechaza un token invalido", () => {
  assert.throws(() => verificarToken("token.invalido.falso"));
});
