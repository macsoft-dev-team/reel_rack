const prisma = require("../prisma/client");

/* MOVE REEL */
const moveReel = async (data) => {
  const { reelCode, action, rackId, cellId, message } = data;

  return prisma.$transaction(async (tx) => {
    // Update cell
    await tx.cell.update({
      where: { id: Number(cellId) },
      data: {
        reelCode: action === "INSERT" ? reelCode : null,
      },
    });

    // Create history
    return tx.history.create({
      data: {
        reelCode,
        action,
        rackId: Number(rackId),
        cellId: Number(cellId),
        message,
      },
    });
  });
};

/* GET HISTORY */
const getAllHistory = async () => {
  return prisma.history.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      rack: { select: { rackCode: true } },
      cell: { select: { rowNo: true, colNo: true } },
    },
  });
};

module.exports = {
  moveReel,
  getAllHistory,
};
