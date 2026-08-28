const express = require("express");
const router = express.Router();
const InventoryTransaction = require("../controller/inventorytransaction.js");

router.get("/", InventoryTransaction.getInventoryTransactions);
router.get("/:id", InventoryTransaction.getInventoryTransactionById);
router.post("/", InventoryTransaction.createInventoryTransaction);
router.put("/:id", InventoryTransaction.updateInventoryTransaction);
router.delete("/:id", InventoryTransaction.deleteInventoryTransaction);
router.get("/type/:type", InventoryTransaction.getInventoryTransactionsByType);

module.exports = router;