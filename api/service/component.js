const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const historyService = require("./inventoryhistory");

const getComponents = async () => {
  try {
    const components = await prisma.component.findMany({});
    return components;
  } catch (error) {
    console.log(error);
  }
};
const createComponent = async (data) => {
  try {
    const comp = await prisma.component.create({
      data: {
        componentType: data.componentType,
        package: data.package,
        manufacturer: data.manufacturer,
        manufacturerPartNo: data.manufacturerPartNo,
        macsoftPartNo: data.macsoftPartNo,
        minimumStockQty: data.minimumStockQty,
        reelSize: data.reelSize,
        reelQty: data.reelQty,
      },
    });

    // history log
    try {
      await historyService.createHistory({
        moduleName: "Component",
        actionType: "CREATE",
        itemName: comp.macsoftPartNo || `${comp.id}`,
        itemId: `${comp.id}`,
        performedByUserId: data.performedByUserId || 1,
      });
    } catch (histErr) {
      console.error("Failed to log component create history:", histErr.message);
    }

    return comp;
  } catch (error) {
    throw error;
  }
};

const updateComponent = async (id, data) => {
  try {
    const existing = await prisma.component.findUnique({ where: { id: parseInt(id) } });
    const updated = await prisma.component.update({
      where: { id: parseInt(id) },
      data: {
        componentType: data.componentType,
        package: data.package,
        manufacturer: data.manufacturer,
        manufacturerPartNo: data.manufacturerPartNo,
        macsoftPartNo: data.macsoftPartNo,
        minimumStockQty: data.minimumStockQty,
        reelSize: data.reelSize,
        reelQty: data.reelQty,
      },
    });

    // build diff
    const updatedFields = {};
    Object.keys(data).forEach((key) => {
      if (
        existing[key] !== undefined &&
        data[key] !== undefined &&
        existing[key] !== data[key]
      ) {
        updatedFields[key] = { before: existing[key], after: data[key] };
      }
    });

    let quantityChange;
    if (
      data.reelQty !== undefined &&
      existing.reelQty !== undefined &&
      data.reelQty !== existing.reelQty
    ) {
      quantityChange = data.reelQty - existing.reelQty;
    }

    // log history
    try {
      await historyService.createHistory({
        moduleName: "Component",
        actionType: "UPDATE",
        itemName: updated.macsoftPartNo || `${updated.id}`,
        itemId: `${updated.id}`,
        updatedFields: Object.keys(updatedFields).length
          ? updatedFields
          : undefined,
        quantityChange,
        performedByUserId: data.performedByUserId || 1,
      });
    } catch (histErr) {
      console.error("Failed to log component update history:", histErr.message);
    }

    return updated;
  } catch (error) {
    throw error;
  }
};

const deleteComponent = async (id, data = {}) => {
  try {
    const existing = await prisma.component.findUnique({ where: { id: parseInt(id) } });
    const deleted = await prisma.component.delete({
      where: { id: parseInt(id) },
    });

    // log history
    try {
      await historyService.createHistory({
        moduleName: "Component",
        actionType: "DELETE",
        itemName: existing ? existing.macsoftPartNo || `${existing.id}` : null,
        itemId: `${id}`,
        performedByUserId: data.performedByUserId || 1,
      });
    } catch (histErr) {
      console.error("Failed to log component delete history:", histErr.message);
    }

    return deleted;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getComponents,
  createComponent,
  updateComponent,
  deleteComponent,
};
