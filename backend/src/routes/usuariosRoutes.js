const express = require("express");
const usuariosController = require("../controllers/usuariosController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/:id", requireAuth, usuariosController.perfilCompleto);

module.exports = router;
