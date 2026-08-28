const express = require("express");
const router = express.Router();
const Inventory = require("../controller/inventory.js");

router.get("/", Inventory.getInventory);
router.get("/:id", Inventory.getInventoryById);
router.post("/", Inventory.createInventory);
router.put("/:id", Inventory.updateInventory);
router.delete("/:id", Inventory.deleteInventory);

module.exports = router;
