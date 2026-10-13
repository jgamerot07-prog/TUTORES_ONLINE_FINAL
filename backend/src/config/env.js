require("dotenv").config();

function required(name, fallback) {
  return process.env[name] || fallback;
}

module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  CORS_ORIGIN: required("CORS_ORIGIN", "*"),
  JWT_SECRET: required("JWT_SECRET", "dev_secret_cambia_en_produccion"),
  JWT_EXPIRES_IN: required("JWT_EXPIRES_IN", "7d"),
  ORACLE: {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
  },
};
