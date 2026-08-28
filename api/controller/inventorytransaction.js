const InventoryTransaction = require("../service/inventorytransaction");

// GET all inventory transactions
exports.getInventoryTransactions = async (req, res) => {
  try {
    const data = await InventoryTransaction.getAllInventoryTransaction();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET inventory transaction by ID
exports.getInventoryTransactionById = async (req, res) => {
  try {
    const data = await InventoryTransaction.getInventoryTransactionById(
      req.params.id,
    );
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: "Inventory transaction not found" });
  }
};

// CREATE inventory transaction
exports.createInventoryTransaction = async (req, res) => {
  try {
    const data = await InventoryTransaction.createInventoryTransaction(
      req.body,
    );
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE inventory transaction
exports.updateInventoryTransaction = async (req, res) => {
  try {
    const data = await InventoryTransaction.updateInventoryTransaction(
      req.params.id,
      req.body,
    );
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE inventory transaction
exports.deleteInventoryTransaction = async (req, res) => {
  try {
    await InventoryTransaction.deleteInventoryTransaction(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET by transaction type
exports.getInventoryTransactionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const data =
      await InventoryTransaction.getInventoryTransactionsByType(type);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
