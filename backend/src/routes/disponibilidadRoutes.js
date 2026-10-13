const express = require("express");
const tutoresController = require("../controllers/tutoresController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.delete("/:id", requireAuth, tutoresController.eliminarDisponibilidad);

module.exports = router;
