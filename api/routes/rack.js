const express = require("express");
const router = express.Router();
const rackController = require("../controller/rack");

/* READ */
router.get("/", rackController.getAllRacks);
router.get("/:id", rackController.getRackById);

module.exports = router;
