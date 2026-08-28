const rackService = require("../service/rack");

/* GET ALL RACKS */
const getAllRacks = async (_req, res) => {
  try {
    const racks = await rackService.getAllRacks();
    res.status(200).json(racks);
  } catch (err) {
    console.error("Get racks error:", err);
    res.status(500).json({ error: "Failed to fetch racks" });
  }
};

/* GET RACK BY ID */
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

/* CREATE RACK */
const createRack = async (req, res) => {
  try {
    const { rackCode, rows, cols } = req.body;
    if (!rackCode) {
      return res.status(400).json({ error: "Rack code is required" });
    }
    const rack = await rackService.createRack({ rackCode, rows, cols });
    res.status(201).json(rack);
  } catch (err) {
    console.error("Create rack error:", err);
    res.status(500).json({ error: err.message || "Failed to create rack" });
  }
};

/* UPDATE RACK */
const updateRack = async (req, res) => {
  try {
    const rackId = Number(req.params.id);
    const { rackCode, rows, cols } = req.body;
    const rack = await rackService.updateRack(rackId, { rackCode, rows, cols });
    res.status(200).json(rack);
  } catch (err) {
    console.error("Update rack error:", err);
    res.status(500).json({ error: err.message || "Failed to update rack" });
  }
};

/* DELETE RACK */
const deleteRack = async (req, res) => {
  try {
    const rackId = Number(req.params.id);
    await rackService.deleteRack(rackId);
    res.status(200).json({ message: "Rack deleted successfully" });
  } catch (err) {
    console.error("Delete rack error:", err);
    res.status(500).json({ error: err.message || "Failed to delete rack" });
  }
};

module.exports = {
  getAllRacks,
  getRackById,
  createRack,
  updateRack,
  deleteRack,
};
