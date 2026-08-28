const express = require("express");
const router = express.Router();
const reelController = require("../controller/reel");
 
 router.get("/", reelController.getReels);
 router.get("/:id", reelController.getReelById);
  router.post("/", reelController.createReel);
  router.delete("/:id", reelController.deleteReel);
  router.put("/:id", reelController.updateReel);
 
module.exports = router;
