const express = require("express");
const router = express.Router();
const InventoryHistory = require("../controller/inventoryhistory.js");

router.get("/", InventoryHistory.getInventoryHistory);
router.post("/", InventoryHistory.createInventoryHistory);
router.delete("/:id", InventoryHistory.deleteInventoryHistory);

module.exports = router;
