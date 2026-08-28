const express = require("express");
const router = express.Router();
const componentController = require("../controller/component");

router.get("/", componentController.getComponents);
router.post("/", componentController.createComponent);
router.put("/:id", componentController.updateComponent);
router.delete("/:id", componentController.deleteComponent);

module.exports = router;
