const express = require("express");
const router = express.Router();
const controller = require("../controller/picklist");

router.post("/", controller.createPickList); // ADMIN
router.get("/", controller.getPickLists); // ADMIN / OPERATOR
router.get("/:id", controller.getPickListById); // ADMIN / OPERATOR
router.put("/:id", controller.updatePickList); // ADMIN
router.put("/:id/execute", controller.executePickList); // OPERATOR
router.delete("/:id", controller.deletePickList); // ADMIN

module.exports = router;
