// src/controllers/user.controller.js
const UserService = require("../service/user");

/* 
   CREATE USER
 */
exports.createUser = async (req, res) => {
  try {
    const { name, employeeId, password, role, status } = req.body;

    if (!name || !employeeId || !password) {
      return res.status(400).json({
        message: "name, employeeId and password are required",
      });
    }

    const user = await UserService.createUser({
      name,
      employeeId,
      password,
      role,
      status,
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      employeeId: user.employeeId,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Employee ID already exists",
      });
    }

    res.status(400).json({ message: err.message });
  }
};

/* 
   GET ALL USERS
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await UserService.getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 
   GET USER BY ID
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 
   UPDATE USER
 */
exports.updateUser = async (req, res) => {
  try {
    const { name, role, status, password } = req.body;

    if (!name && !role && !status && !password) {
      return res.status(400).json({
        message: "Nothing to update",
      });
    }

    const user = await UserService.updateUser(req.params.id, {
      name,
      role,
      status,
      password,
    });

    res.json({
      id: user.id,
      name: user.name,
      employeeId: user.employeeId,
      role: user.role,
      status: user.status,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* 
   DELETE USER
 */
exports.deleteUser = async (req, res) => {
  try {
    await UserService.deleteUser(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
