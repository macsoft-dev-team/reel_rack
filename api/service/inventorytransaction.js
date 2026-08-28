const prisma = require("../prisma/client");

// GET all
exports.getAllInventoryTransaction = () => {
  return prisma.inventorytransaction.findMany({
    include: {
      reel: true,
      pickTask: true,
      performedByUser: true,
    },
  });
};

// GET by id
exports.getInventoryTransactionById = (id) => {
  return prisma.inventorytransaction.findUnique({
    where: { id: Number(id) },
    include: {
      reel: true,
      pickTask: true,
      performedByUser: true,
    },
  });
};

// CREATE
exports.createInventoryTransaction = (data) => {
  return prisma.inventorytransaction.create({ data });
};

// UPDATE
exports.updateInventoryTransaction = (id, data) => {
  return prisma.inventorytransaction.update({
    where: { id: Number(id) },
    data,
  });
};

// DELETE
exports.deleteInventoryTransaction = (id) => {
  return prisma.inventorytransaction.delete({
    where: { id: Number(id) },
  });
};

// GET by transaction type
exports.getInventoryTransactionsByType = (type) => {
  return prisma.inventorytransaction.findMany({
    where: { transactionType: type },
    include: {
      reel: true,
      pickTask: true,
      performedByUser: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};