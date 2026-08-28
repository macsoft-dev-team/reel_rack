const InventoryHistory = require("../service/inventoryhistory");

// GET inventory history with optional query filters
exports.getInventoryHistory = async (req, res) => {
  try {
    const { search, moduleName, actionType, from, to } = req.query;
    const filter = {};

    if (moduleName) filter.moduleName = moduleName;
    if (actionType) filter.actionType = actionType;

    if (search) {
      // search against several string fields
      filter.OR = [
        { itemName: { contains: search, mode: "insensitive" } },
        { moduleName: { contains: search, mode: "insensitive" } },
        { actionType: { contains: search, mode: "insensitive" } },
        {
          performedByUser: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.gte = new Date(from);
      if (to) filter.timestamp.lte = new Date(to);
    }

    const data = await InventoryHistory.getInventoryHistory(filter);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST new history entry (used internally by other services)
exports.createInventoryHistory = async (req, res) => {
  try {
    const entry = await InventoryHistory.createHistory(req.body);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE history entry by id
exports.deleteInventoryHistory = async (req, res) => {
  try {
    const { id } = req.params;
    await InventoryHistory.deleteHistory(id);
    res.json({ message: "History record deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
