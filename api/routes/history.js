const express = require("express");
const router = express.Router();
const historyController = require("../controller/history");

router.post("/", historyController.moveReel);
router.get("/", historyController.getAllHistory);

module.exports = router;
