const Inventory = require("../service/inventory");

// GET all inventory
exports.getInventory = async (req, res) => {
  try {
    const data = await Inventory.getAllInventory();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET inventory by ID
exports.getInventoryById = async (req, res) => {
  try {
    const data = await Inventory.getInventoryById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: "Inventory not found" });
  }
};

// CREATE inventory
exports.createInventory = async (req, res) => {
  try {
    const data = await Inventory.createInventory(req.body);
    res.status(201).json(data);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: `An inventory item with code '${req.body.code}' already exists` });
    }
    res.status(400).json({ message: error.message });
  }
};

// UPDATE inventory
exports.updateInventory = async (req, res) => {
  try {
    const data = await Inventory.updateInventory(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: `An inventory item with code '${req.body.code}' already exists` });
    }
    res.status(400).json({ message: error.message });
  }
};

// DELETE inventory
exports.deleteInventory = async (req, res) => {
  try {
    await Inventory.deleteInventory(req.params.id);
    res.json({ message: "Inventory deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
