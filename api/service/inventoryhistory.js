const prisma = require("../prisma/client");

/**
 * Retrieve inventory history entries. An optional filter object may be
 * provided which will be passed directly into the prisma `where` clause.
 *
 * @param {Object} [filter={}] prisma compatible where filter
 * @returns {Promise<Array>} history entries sorted desc by timestamp
 */
exports.getInventoryHistory = (filter = {}) => {
  return prisma.inventoryHistory.findMany({
    where: filter,
    orderBy: { timestamp: "desc" },
    include: {
      performedByUser: {
        select: { id: true, name: true, employeeId: true, role: true },
      },
    },
  });
};

/**
 * Create a new history record. The `data` object should include at least
 * moduleName, actionType and performedByUserId fields; other properties are
 * optional.
 */
exports.createHistory = async (data) => {
  return prisma.inventoryHistory.create({ data });
};

/**
 * Delete a history record by id.
 */
exports.deleteHistory = async (id) => {
  return prisma.inventoryHistory.delete({ where: { id: Number(id) } });
};
