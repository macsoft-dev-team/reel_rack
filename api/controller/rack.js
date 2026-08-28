const rackService = require("../service/rack");

/* 
   GET ALL RACKS
    */
const getAllRacks = async (_req, res) => {
  try {
    const racks = await rackService.getAllRacks();
    res.status(200).json(racks);
  } catch (err) {
    console.error("Get racks error:", err);
    res.status(500).json({ error: "Failed to fetch racks" });
  }
};

/* 
   GET RACK BY ID
    */
const getRackById = async (req, res) => {
  try {
    const rackId = Number(req.params.id);

    if (isNaN(rackId)) {
      return res.status(400).json({ error: "Invalid rack id" });
    }

    const rack = await rackService.getRackById(rackId);

    if (!rack) {
      return res.status(404).json({ message: "Rack not found" });
    }

    res.status(200).json(rack);
  } catch (err) {
    console.error("Get rack by id error:", err);
    res.status(500).json({ error: "Failed to fetch rack" });
  }
};

module.exports = {
  getAllRacks,
  getRackById,
};
