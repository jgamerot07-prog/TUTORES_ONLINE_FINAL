const express = require("express");
const calificacionesController = require("../controllers/calificacionesController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, calificacionesController.crear);

module.exports = router;
