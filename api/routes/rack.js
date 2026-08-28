const express = require("express");
const router = express.Router();
const rackController = require("../controller/rack");

/* READ */
router.get("/", rackController.getAllRacks);
router.get("/:id", rackController.getRackById);

/* CREATE, UPDATE, DELETE */
router.post("/", rackController.createRack);
router.put("/:id", rackController.updateRack);
router.delete("/:id", rackController.deleteRack);

module.exports = router;
