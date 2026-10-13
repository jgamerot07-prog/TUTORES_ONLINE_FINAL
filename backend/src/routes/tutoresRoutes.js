const express = require("express");
const tutoresController = require("../controllers/tutoresController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", tutoresController.listar);
router.get("/:id", tutoresController.obtenerPorId);
router.patch("/:id", requireAuth, tutoresController.actualizar);
router.get("/:id/disponibilidad", tutoresController.listarDisponibilidad);
router.post("/:id/disponibilidad", requireAuth, tutoresController.agregarDisponibilidad);

module.exports = router;
