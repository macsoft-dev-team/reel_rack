const express = require("express");
const router = express.Router();

const componentRoutes = require("./component");
const rackRoutes = require("./rack");
const historyRoutes = require("./history");
const inventoryRoutes = require("./inventory");
const userRoutes = require("./user");
const signinRoutes = require("./signin")
const picklistRoutes = require("./picklist")
const manufecturerRoutes = require("./manufecturer");
const reels = require("./reel")
const inventorytransactionRoutes = require("./inventorytransaction");
const inventoryhistoryRoutes = require("./inventoryhistory");
 
router.use("/component", componentRoutes);
router.use("/rack", rackRoutes);
router.use("/history", historyRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/user", userRoutes);
router.use("/signin",signinRoutes);
router.use("/picklist",picklistRoutes);
router.use("/manufacturer", manufecturerRoutes);
router.use("/reel", reels);
router.use("/inventorytransaction", inventorytransactionRoutes);
// expose both hyphenated and old endpoint for backward compatibility
router.use("/inventory-history", inventoryhistoryRoutes);
router.use("/inventoryhistory", inventoryhistoryRoutes);

module.exports = router;
