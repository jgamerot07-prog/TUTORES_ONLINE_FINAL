const express = require("express");
const reservasController = require("../controllers/reservasController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.post("/", reservasController.crear);
router.get("/", reservasController.listar);
router.patch("/:id/estado", reservasController.actualizarEstado);

module.exports = router;
