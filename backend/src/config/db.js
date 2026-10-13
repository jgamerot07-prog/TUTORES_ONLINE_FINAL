const oracledb = require("oracledb");
const { ORACLE } = require("./env");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let pool = null;
let poolInitError = null;

/**
 * node-oracledb corre en modo "thin" (JS puro) por defecto desde la v6,
 * por lo que NO requiere instalar Oracle Instant Client para conectarse
 * a una instancia Oracle Database / Oracle APEX.
 */
async function initPool() {
  if (pool) return pool;
  if (!ORACLE.user || !ORACLE.password || !ORACLE.connectString) {
    poolInitError = new Error(
      "Conexion a Oracle no configurada. Define ORACLE_USER, ORACLE_PASSWORD y ORACLE_CONNECT_STRING en tu archivo .env."
    );
    throw poolInitError;
  }
  pool = await oracledb.createPool({
    user: ORACLE.user,
    password: ORACLE.password,
    connectString: ORACLE.connectString,
    poolMin: 1,
    poolMax: 5,
    poolIncrement: 1,
  });
  return pool;
}

async function getConnection() {
  const activePool = await initPool();
  return activePool.getConnection();
}

/**
 * Ejecuta una consulta parametrizada (bind variables) y libera la conexion
 * siempre, incluso si la consulta falla. Usar SIEMPRE binds (nunca
 * concatenar strings) para evitar inyeccion SQL.
 */
async function query(sql, binds = {}, options = {}) {
  const connection = await getConnection();
  try {
    return await connection.execute(sql, binds, options);
  } finally {
    await connection.close();
  }
}

async function isConfigured() {
  try {
    await initPool();
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = { query, getConnection, isConfigured };
