const prisma = require("../prisma/client");

/* GET ALL RACKS */
const getAllRacks = async () => {
  return prisma.rack.findMany({
    include: {
      cells: {
        orderBy: [
          { rowNo: "asc" },
          { colNo: "asc" },
        ],
      },
    },
    orderBy: { id: "asc" },
  });
};

/* GET RACK BY ID */
const getRackById = async (id) => {
  return prisma.rack.findUnique({
    where: { id },
    include: {
      cells: {
        orderBy: [
          { rowNo: "asc" },
          { colNo: "asc" },
        ],
      },
    },
  });
};

/* CREATE RACK WITH ROWS & COLUMNS */
const createRack = async ({ rackCode, rows = 5, cols = 10 }) => {
  const numRows = Math.max(1, parseInt(rows) || 1);
  const numCols = Math.max(1, parseInt(cols) || 1);

  const cellsData = [];
  for (let r = 1; r <= numRows; r++) {
    for (let c = 1; c <= numCols; c++) {
      cellsData.push({
        rowNo: r,
        colNo: c,
      });
    }
  }

  const rack = await prisma.rack.create({
    data: {
      rackCode: rackCode.trim(),
      cells: {
        create: cellsData,
      },
    },
    include: {
      cells: {
        orderBy: [{ rowNo: "asc" }, { colNo: "asc" }],
      },
    },
  });

  return rack;
};

/* UPDATE RACK (CODE AND/OR ROWS & COLUMNS - INCREASING & DECREASING) */
const updateRack = async (id, { rackCode, rows, cols }) => {
  const rackId = parseInt(id);
  const existingRack = await prisma.rack.findUnique({
    where: { id: rackId },
    include: { cells: true },
  });

  if (!existingRack) {
    throw new Error("Rack not found");
  }

  // Update rackCode if provided
  await prisma.rack.update({
    where: { id: rackId },
    data: {
      rackCode: rackCode ? rackCode.trim() : existingRack.rackCode,
    },
  });

  // If rows and cols provided, adjust cells (handles both increase & decrease)
  if (rows !== undefined && cols !== undefined) {
    const targetRows = Math.max(1, parseInt(rows));
    const targetCols = Math.max(1, parseInt(cols));

    const existingMap = new Map();
    const cellsToDelete = [];

    existingRack.cells.forEach((cell) => {
      if (cell.rowNo > targetRows || cell.colNo > targetCols) {
        cellsToDelete.push(cell.id);
      } else {
        existingMap.set(`${cell.rowNo}-${cell.colNo}`, cell);
      }
    });

    // Delete cells outside target bounds (and their history logs)
    if (cellsToDelete.length > 0) {
      await prisma.history.deleteMany({
        where: { cellId: { in: cellsToDelete } },
      });
      await prisma.cell.deleteMany({
        where: { id: { in: cellsToDelete } },
      });
    }

    // Create missing cells within target bounds
    const cellsToCreate = [];
    for (let r = 1; r <= targetRows; r++) {
      for (let c = 1; c <= targetCols; c++) {
        const key = `${r}-${c}`;
        if (!existingMap.has(key)) {
          cellsToCreate.push({
            rowNo: r,
            colNo: c,
            rackId: rackId,
          });
        }
      }
    }

    if (cellsToCreate.length > 0) {
      await prisma.cell.createMany({
        data: cellsToCreate,
      });
    }
  }

  return prisma.rack.findUnique({
    where: { id: rackId },
    include: {
      cells: {
        orderBy: [{ rowNo: "asc" }, { colNo: "asc" }],
      },
    },
  });
};

/* DELETE RACK */
const deleteRack = async (id) => {
  const rackId = parseInt(id);

  // Delete history records associated with cells of this rack first
  await prisma.history.deleteMany({
    where: { rackId: rackId },
  });

  // Delete all cells belonging to this rack
  await prisma.cell.deleteMany({
    where: { rackId: rackId },
  });

  // Delete the rack
  return prisma.rack.delete({
    where: { id: rackId },
  });
};

module.exports = {
  getAllRacks,
  getRackById,
  createRack,
  updateRack,
  deleteRack,
};
