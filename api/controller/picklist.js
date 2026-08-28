const PickListService = require("../service/picklist");

/* CREATE */
exports.createPickList = async (req, res) => {
  try {
    const picklist = await PickListService.createPickList(req.body);
    res.status(201).json(picklist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* GET ALL */
exports.getPickLists = async (req, res) => {
  try {
    const { operator } = req.query;
    const picklists = await PickListService.getPickLists(operator);
    res.json(picklists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET ONE */
exports.getPickListById = async (req, res) => {
  try {
    const picklist = await PickListService.getPickListById(req.params.id);
    if (!picklist) {
      return res.status(404).json({ message: "Pick list not found" });
    }
    res.json(picklist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE (ADMIN) */
exports.updatePickList = async (req, res) => {
  try {
    const picklist = await PickListService.updatePickList(
      req.params.id,
      req.body
    );
    res.json(picklist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* EXECUTE (OPERATOR) */
exports.executePickList = async (req, res) => {
  try {
    const result = await PickListService.executePickList(
      req.params.id,
      req.body.items
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePickList = async (req, res) => {
  try {
    const { performedByUserId } = req.query;
    await PickListService.deletePickList(req.params.id, { performedByUserId });
    res.json({ message: "Pick list deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
