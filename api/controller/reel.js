const reelService = require("../service/reel");

/* CREATE */
const createReel = async (req, res) => {
  try {
    const reel = await reelService.createReel(req.body);
    res.status(201).json(reel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET ALL */
const getReels = async (req, res) => {
  try {
    const reels = await reelService.getAllReels();
    res.json(reels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET BY ID */
const getReelById = async (req, res) => {
  try {
    const reel = await reelService.getReelById(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found" });
    res.json(reel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* UPDATE */
const updateReel = async (req, res) => {
  try {
    const reel = await reelService.updateReel(req.params.id, req.body);
    res.json(reel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* DELETE */
const deleteReel = async (req, res) => {
  try {
    const { performedByUserId } = req.query;
    await reelService.deleteReel(req.params.id, { performedByUserId });
    res.json({ message: "Reel deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReel,
  deleteReel,
  getReels,
  getReelById,
  updateReel,
};
