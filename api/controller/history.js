const historyService = require("../service/history");

const moveReel = async (req, res) => {
  try {
    const result = await historyService.moveReel(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error("Move reel error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getAllHistory = async (_req, res) => {
  try {
    const history = await historyService.getAllHistory();
    res.status(200).json(history);
  } catch (err) {
    console.error("Get history error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

module.exports = {
  moveReel,
  getAllHistory,
};
