const prisma = require("../prisma/client");
const historyService = require("./inventoryhistory");
 
/* CREATE */
 const createReel = async (data) => {
  const reel = await prisma.reel.create({
    data: {
      componentid: data.componentid,
      lotnumber: data.lotnumber,
      qtyinitial: data.qtyinitial,
      qtyremaining: data.qtyremaining,
      reelstatus: data.reelstatus || "OPEN",
      isopen: data.isopen !== undefined ? data.isopen : true,
    },
  });

  // Transaction log (existing behaviour)
  try {
    await prisma.inventorytransaction.create({
      data: {
        reelId: reel.id,
        transactionType: "REEL_CREATED",
        qtyBefore: 0,
        qtyAfter: reel.qtyremaining,
        qtyDelta: reel.qtyremaining,
        performedByUserId: data.performedByUserId || 1, // Default to admin if not provided
        transactionReason: "Reel created",
      },
    });
  } catch (txErr) {
    console.error("Failed to create transaction log:", txErr.message);
  }

  // History entry
  try {
    await historyService.createHistory({
      moduleName: "Reel",
      actionType: "CREATE",
      itemName: reel.id,
      itemId: reel.id,
      quantityChange: reel.qtyremaining,
      performedByUserId: data.performedByUserId || 1,
    });
  } catch (histErr) {
    console.error("Failed to log history entry:", histErr.message);
  }

  return reel;
};

/* GET ALL */
 const getAllReels = async () => {
  return await prisma.reel.findMany({
    orderBy: { createdAt: "desc" },
  });
};

/* GET BY ID */
 const getReelById = async (id) => {
  return await prisma.reel.findUnique({
    where: { id },
  });
};

/* UPDATE */
 const updateReel = async (id, data) => {
  const existingReel = await prisma.reel.findUnique({ where: { id } });

  const reel = await prisma.reel.update({
    where: { id },
    data,
  });

  // Create transaction log for component placement or qty update
  let shouldCreateTransaction = false;
  let transactionType = "REEL_UPDATED";
  let reason = "Reel updated";

  if (data.componentid && (!existingReel.componentid || existingReel.componentid !== data.componentid)) {
    transactionType = "COMPONENT_PLACED";
    reason = `Component ${data.componentid} placed on reel`;
    shouldCreateTransaction = true;
  } else if (data.qtyremaining !== undefined && data.qtyremaining !== existingReel.qtyremaining) {
    transactionType = "REEL_QTY_UPDATE";
    reason = `Reel quantity changed from ${existingReel.qtyremaining} to ${data.qtyremaining}`;
    shouldCreateTransaction = true;
  }

  if (shouldCreateTransaction) {
    try {
      await prisma.inventorytransaction.create({
        data: {
          reelId: reel.id,
          transactionType,
          qtyBefore: existingReel.qtyremaining || 0,
          qtyAfter: reel.qtyremaining || 0,
          qtyDelta: (reel.qtyremaining || 0) - (existingReel.qtyremaining || 0),
          performedByUserId: data.performedByUserId || 1,
          transactionReason: reason,
        },
      });
    } catch (txErr) {
      // Log error but don't fail reel update
      console.error("Failed to create transaction log:", txErr.message);
    }
  }

  // Build updatedFields object
  const updatedFields = {};
  Object.keys(data).forEach((key) => {
    if (
      existingReel[key] !== undefined &&
      data[key] !== undefined &&
      existingReel[key] !== data[key]
    ) {
      updatedFields[key] = {
        before: existingReel[key],
        after: data[key],
      };
    }
  });

  // Determine actionType
  let historyAction = "UPDATE";
  if (
    data.reelstatus &&
    existingReel.reelstatus &&
    data.reelstatus !== existingReel.reelstatus
  ) {
    historyAction = "STATUS_CHANGE";
  }

  // History entry
  try {
    await historyService.createHistory({
      moduleName: "Reel",
      actionType: historyAction,
      itemName: reel.id,
      itemId: reel.id,
      updatedFields: Object.keys(updatedFields).length
        ? updatedFields
        : undefined,
      quantityChange:
        data.qtyremaining !== undefined
          ? data.qtyremaining - (existingReel.qtyremaining || 0)
          : undefined,
      performedByUserId: data.performedByUserId || 1,
    });
  } catch (histErr) {
    console.error("Failed to log history entry:", histErr.message);
  }

  return reel;
};

/* DELETE */
 const deleteReel = async (id, data = {}) => {
  const existingReel = await prisma.reel.findUnique({ where: { id } });
  
  await prisma.reel.delete({
    where: { id },
  });

  // Create transaction log
  try {
    await prisma.inventorytransaction.create({
      data: {
        reelId: id,
        transactionType: "REEL_DELETED",
        qtyBefore: existingReel.qtyremaining || 0,
        performedByUserId: data.performedByUserId || 1,
        transactionReason: "Reel deleted",
      },
    });
  } catch (txErr) {
    console.error("Failed to create transaction log:", txErr.message);
  }

  // History entry
  try {
    await historyService.createHistory({
      moduleName: "Reel",
      actionType: "DELETE",
      itemName: existingReel ? existingReel.id : null,
      itemId: id,
      quantityChange: existingReel ? existingReel.qtyremaining : undefined,
      performedByUserId: data.performedByUserId || 1,
    });
  } catch (histErr) {
    console.error("Failed to log history entry:", histErr.message);
  }
};
module.exports  ={ 
  getAllReels,createReel,deleteReel,updateReel,getReelById
}