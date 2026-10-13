const express = require("express");
const notificacionesController = require("../controllers/notificacionesController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.get("/", notificacionesController.listar);
router.patch("/:id/leer", notificacionesController.marcarLeida);

module.exports = router;
