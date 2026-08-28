const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const historyService = require("./inventoryhistory");

/* Create */
const createManufacturer = async (data) => {
  const result = await prisma.manufacturer.create({
    data: {
      name: data.name,
      country: data.country,
      phone: data.phone,
      email: data.email,
    },
  });

  // log history
  try {
    await historyService.createHistory({
      moduleName: "Manufacturer",
      actionType: "CREATE",
      itemName: result.name,
      itemId: `${result.id}`,
      performedByUserId: data.performedByUserId || 1,
    });
  } catch (err) {
    console.error("Failed to log manufacturer create history:", err.message);
  }

  return result;
};

/* Get All */
const getAllManufacturers = async () => {
  return await prisma.manufacturer.findMany({
    orderBy: { id: "desc" },
  });
};

/* Get By ID */
const getManufacturerById = async (id) => {
  return await prisma.manufacturer.findUnique({
    where: { id: Number(id) },
  });
};

/* Update */
const updateManufacturer = async (id, data) => {
  const existing = await prisma.manufacturer.findUnique({
    where: { id: Number(id) },
  });
  const updated = await prisma.manufacturer.update({
    where: { id: Number(id) },
    data: {
      name: data.name,
      country: data.country,
      phone: data.phone,
      email: data.email,
    },
  });

  const updatedFields = {};
  ["name", "country", "phone", "email"].forEach((key) => {
    if (existing && data[key] !== undefined && existing[key] !== data[key]) {
      updatedFields[key] = { before: existing[key], after: data[key] };
    }
  });

  try {
    await historyService.createHistory({
      moduleName: "Manufacturer",
      actionType: "UPDATE",
      itemName: updated.name,
      itemId: `${updated.id}`,
      updatedFields: Object.keys(updatedFields).length
        ? updatedFields
        : undefined,
      performedByUserId: data.performedByUserId || 1,
    });
  } catch (err) {
    console.error("Failed to log manufacturer update history:", err.message);
  }

  return updated;
};

/* Delete */
const deleteManufacturer = async (id, data = {}) => {
  const existing = await prisma.manufacturer.findUnique({
    where: { id: Number(id) },
  });
  const deleted = await prisma.manufacturer.delete({
    where: { id: Number(id) },
  });

  try {
    await historyService.createHistory({
      moduleName: "Manufacturer",
      actionType: "DELETE",
      itemName: existing ? existing.name : null,
      itemId: `${id}`,
      performedByUserId: data.performedByUserId || 1,
    });
  } catch (err) {
    console.error("Failed to log manufacturer delete history:", err.message);
  }

  return deleted;
};

module.exports = {
  createManufacturer,
  getAllManufacturers,
  getManufacturerById,
  updateManufacturer,
  deleteManufacturer,
};
