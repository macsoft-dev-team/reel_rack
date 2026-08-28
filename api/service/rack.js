const prisma = require("../prisma/client");

/* 
   GET ALL RACKS
    */
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
  });
};

/* 
   GET RACK BY ID
    */
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

module.exports = {
  getAllRacks,
  getRackById,
};
