// src/services/user.service.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

/* 
   CREATE USER
 */
const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      name: data.name,
      employeeId: data.employeeId, 
      password: hashedPassword,    
      role: data.role || "OPERATOR",
      status: data.status || "ACTIVE",
    },
  });
};

/* 
   GET ALL USERS
 */
const getUsers = async () => {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      employeeId: true, // ✅ fixed
      role: true,
      status: true,
      createdAt: true,
    },
  });
};

/* 
   GET USER BY ID
 */
const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      employeeId: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
};

/* 
   UPDATE USER
 */
const updateUser = async (id, data) => {
  const updateData = {
    name: data.name,
    role: data.role,
    status: data.status,
  };

  // update password only if provided
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  return prisma.user.update({
    where: { id: Number(id) },
    data: updateData,
  });
};

/* 
   DELETE USER (HARD DELETE)
 */
const deleteUser = async (id) => {
  return prisma.user.delete({
    where: { id: Number(id) },
  });
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
