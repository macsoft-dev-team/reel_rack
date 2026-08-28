// src/routes/user.routes.js
const express = require("express");
const router = express.Router();
const UserController = require("../controller/user");

/* ADMIN ONLY (later add middleware) */
router.get("/", UserController.getUsers);
router.get("/:id", UserController.getUserById);
router.post("/", UserController.createUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

module.exports = router;