const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const historyService = require("./inventoryhistory");

/* 
   CREATE PICK LIST (ADMIN)
 */
const createPickList = async (data) => {
  const picklist = await prisma.pickList.create({
    data: {
      code: data.code,
      name: data.name,
      operator: data.operator,
      status: "CREATED",
      items: {
        create: data.items.map((item) => ({
          componentId: item.componentId,
          componentCode: item.componentCode,
          componentName: item.componentName,
          availableQty: item.availableQty,
          usedQty: 0,
          location: item.location,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  // Create transaction log
  try {
    await prisma.inventorytransaction.create({
      data: {
        pickTaskId: picklist.id,
        transactionType: "PICKLIST_CREATED",
        performedByUserId: data.performedByUserId || 1,
        transactionReason: "Picklist created",
      },
    });
  } catch (txErr) {
    console.error("Failed to create transaction log:", txErr.message);
  }

  // history entry
  try {
    await historyService.createHistory({
      moduleName: "PickList",
      actionType: "CREATE",
      itemName: picklist.code || `${picklist.id}`,
      itemId: `${picklist.id}`,
      performedByUserId: data.performedByUserId || 1,
    });
  } catch (histErr) {
    console.error("Failed to log picklist create history:", histErr.message);
  }

  return picklist;
};

/* 
   GET ALL PICK LISTS
 */
const getPickLists = async (operatorFilter) => {
  const where = {};
  if (operatorFilter) {
    where.operator = operatorFilter;
  }

  const picklists = await prisma.pickList.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  const openReels = await prisma.reel.findMany({
    where: { isopen: true },
    select: { id: true, componentid: true, lotnumber: true, qtyremaining: true, reelstatus: true }
  });

  const openReelMap = {};
  openReels.forEach(r => {
    if (!openReelMap[r.componentid]) openReelMap[r.componentid] = [];
    openReelMap[r.componentid].push(r);
  });

  return picklists.map(pl => ({
    ...pl,
    items: pl.items.map(item => ({
      ...item,
      openReelSuggestion: openReelMap[item.componentCode] && openReelMap[item.componentCode].length > 0
        ? openReelMap[item.componentCode][0]
        : null
    }))
  }));
};

/* 
   GET PICK LIST BY ID
 */
const getPickListById = async (id) => {
  const picklist = await prisma.pickList.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });

  if (!picklist) return null;

  const openReels = await prisma.reel.findMany({
    where: { isopen: true },
    select: { id: true, componentid: true, lotnumber: true, qtyremaining: true, reelstatus: true }
  });

  const openReelMap = {};
  openReels.forEach(r => {
    if (!openReelMap[r.componentid]) openReelMap[r.componentid] = [];
    openReelMap[r.componentid].push(r);
  });

  return {
    ...picklist,
    items: picklist.items.map(item => ({
      ...item,
      openReelSuggestion: openReelMap[item.componentCode] && openReelMap[item.componentCode].length > 0
        ? openReelMap[item.componentCode][0]
        : null
    }))
  };
};

/* 
   UPDATE PICK LIST (ADMIN)
 */
const updatePickList = async (id, data) => {
  // Build update object with provided fields
  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.operator) updateData.operator = data.operator;
  if (data.status) updateData.status = data.status;

  const existing = await prisma.pickList.findUnique({ where: { id: Number(id) } });
  const picklist = await prisma.pickList.update({
    where: { id: Number(id) },
    data: updateData,
  });

  // Create transaction log with appropriate type based on what was updated
  try {
    let transactionType = "PICKLIST_UPDATED";
    let transactionReason = "Picklist updated";
    
    if (data.status) {
      if (data.status === "IN_PROGRESS") {
        transactionType = "PICKLIST_IN_PROGRESS";
        transactionReason = "Picklist started - moved to IN_PROGRESS";
      } else if (data.status === "COMPLETED") {
        transactionType = "PICKLIST_COMPLETED";
        transactionReason = "Picklist completed - all quantities used";
      }
    }

    await prisma.inventorytransaction.create({
      data: {
        pickTaskId: picklist.id,
        transactionType: transactionType,
        performedByUserId: data.performedByUserId || 1,
        transactionReason: transactionReason,
      },
    });
  } catch (txErr) {
    // Log error but don't fail the picklist update
    console.error("Failed to create transaction log:", txErr.message);
  }

  // derive updatedFields for history
  const updatedFields = {};
  Object.keys(updateData).forEach((key) => {
    if (
      existing[key] !== undefined &&
      updateData[key] !== undefined &&
      existing[key] !== updateData[key]
    ) {
      updatedFields[key] = { before: existing[key], after: updateData[key] };
    }
  });

  try {
    await historyService.createHistory({
      moduleName: "PickList",
      actionType: "UPDATE",
      itemName: picklist.code || `${picklist.id}`,
      itemId: `${picklist.id}`,
      updatedFields: Object.keys(updatedFields).length ? updatedFields : undefined,
      performedByUserId: data.performedByUserId || 1,
    });
  } catch (histErr) {
    console.error("Failed to log picklist update history:", histErr.message);
  }

  return picklist;
};

/* 
   EXECUTE PICK LIST (OPERATOR)
 */
const executePickList = async (id, items) => {
  // Run in transaction: update each pickListItem usedQty and adjust inventory quantity
  return await prisma.$transaction(async (tx) => {
    // load existing items to compute deltas
    const existingItems = await tx.pickListItem.findMany({
      where: { pickListId: Number(id) },
    });

    // map by id for quick lookup
    const existingMap = existingItems.reduce((acc, it) => {
      acc[it.id] = it;
      return acc;
    }, {});

    // apply updates
    for (const item of items) {
      const prev = existingMap[item.id];
      const prevUsed = prev ? prev.usedQty || 0 : 0;
      const newUsed = Number(item.usedQty) || 0;
      const delta = newUsed - prevUsed; // positive => consume more, negative => return

      // update pickListItem
      await tx.pickListItem.update({
        where: { id: item.id },
        data: { usedQty: newUsed },
      });

      // Create transaction log for picklist qty update
      // Only create if user exists to avoid FK constraint errors
      try {
        await tx.inventorytransaction.create({
          data: {
            pickTaskId: Number(id),
            transactionType: "PICKLIST_QTY_UPDATE",
            qtyBefore: prevUsed,
            qtyAfter: newUsed,
            qtyDelta: delta,
            performedByUserId: 1, // Default to admin, should be passed from req.user
            transactionReason: `Picklist item ${item.id} quantity updated`,
          },
        });
      } catch (txErr) {
        // Log error but don't fail the entire operation
        console.error("Failed to create transaction log:", txErr.message);
      }

      // if this pickListItem references an inventory record (componentId), adjust inventory
      if (prev && prev.componentId) {
        // attempt to find inventory record by id == componentId
        const inv = await tx.inventory.findUnique({ where: { id: Number(prev.componentId) } });
        if (inv) {
          const updatedQty = (inv.quantity || 0) - delta;
          await tx.inventory.update({
            where: { id: Number(prev.componentId) },
            data: { quantity: Math.max(0, updatedQty) },
          });
        }
      }
    }

    // reload picklist to evaluate completion
    const pickList = await tx.pickList.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    const isCompleted = pickList.items.every((i) => i.usedQty === i.availableQty);

    return tx.pickList.update({
      where: { id: Number(id) },
      data: { status: isCompleted ? "COMPLETED" : "IN_PROGRESS" },
    });
  });
};

/* 
   DELETE PICK LIST (ADMIN)
 */
const deletePickList = async (id, data = {}) => {
  const existingPicklist = await prisma.pickList.findUnique({ where: { id: Number(id) } });
  
  try {
    await prisma.inventorytransaction.create({
      data: {
        pickTaskId: Number(id),
        transactionType: "PICKLIST_DELETED",
        performedByUserId: data.performedByUserId || 1,
        transactionReason: "Picklist deleted",
      },
    });
  } catch (txErr) {
    console.error("Failed to create transaction log:", txErr.message);
  }

  await prisma.pickList.delete({
    where: { id: Number(id) },
  });

  try {
    await historyService.createHistory({
      moduleName: "PickList",
      actionType: "DELETE",
      itemName: existingPicklist ? existingPicklist.code || `${existingPicklist.id}` : null,
      itemId: `${id}`,
      performedByUserId: data.performedByUserId || 1,
    });
  } catch (histErr) {
    console.error("Failed to log picklist delete history:", histErr.message);
  }

  return existingPicklist;
};

module.exports = {
  createPickList,
  getPickLists,
  getPickListById,
  updatePickList,
  executePickList,
  deletePickList,
};
