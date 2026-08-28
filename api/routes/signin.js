const express = require("express");
const router = express.Router();
const signinservice = require("../controller/signin");

router.post("/",signinservice.signin);

module.exports = router;
