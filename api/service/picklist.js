const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const historyService = require("./inventoryhistory");

/* 
   CREATE PICK LIST (ADMIN)
 */
const createPickList = async (data) => {
  if (data.name) {
    const existingName = await prisma.pickList.findFirst({
      where: {
        name: { equals: data.name.trim() }
      }
    });
    if (existingName) {
      const err = new Error(`Picklist with name '${data.name}' already exists`);
      err.statusCode = 400;
      throw err;
    }
  }

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
          requiredQty: Number(item.requiredQty) || 0,
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

  const allReels = await prisma.reel.findMany({
    where: { qtyremaining: { gt: 0 } },
    select: { id: true, componentid: true, lotnumber: true, qtyremaining: true, reelstatus: true, isopen: true }
  });

  const racks = await prisma.rack.findMany({
    include: { cells: true }
  }).catch(() => []);

  const reelLocationMap = {};
  racks.forEach(r => {
    (r.cells || []).forEach(c => {
      if (c.reelCode) {
        const loc = `Rack ${r.rackCode} · Row ${c.rowNo} · Col C${c.colNo} (Slot R${c.rowNo}-C${c.colNo})`;
        reelLocationMap[c.reelCode.toString().toLowerCase()] = loc;
      }
    });
  });

  const components = await prisma.component.findMany().catch(() => []);
  const inventory = await prisma.inventory.findMany().catch(() => []);

  const matchReelsForItem = (item) => {
    const code = (item.componentCode || "").toString().toLowerCase();
    const name = (item.componentName || "").toString().toLowerCase();
    const idStr = String(item.componentId || "").toLowerCase();

    const comp = components.find(c => c.id === item.componentId || (c.macsoftPartNo || "").toLowerCase() === code) ||
                 inventory.find(i => i.id === item.componentId || (i.code || "").toLowerCase() === code);

    const matchKeys = new Set([code, name, idStr]);
    if (comp) {
      if (comp.macsoftPartNo) matchKeys.add(comp.macsoftPartNo.toLowerCase());
      if (comp.code) matchKeys.add(comp.code.toLowerCase());
      if (comp.name) matchKeys.add(comp.name.toLowerCase());
    }

    const itemReels = allReels.filter(r => matchKeys.has((r.componentid || "").toString().toLowerCase()));
    const openReels = itemReels.filter(r => r.isopen || r.reelstatus === "OPEN");
    const unopenedReels = itemReels.filter(r => !r.isopen && r.reelstatus !== "OPEN");

    const suggested = [];
    let needed = item.requiredQty || 1;

    for (const r of openReels) {
      if (needed <= 0) break;
      const take = Math.min(r.qtyremaining, needed);
      const loc = reelLocationMap[(r.lotnumber || "").toString().toLowerCase()] || reelLocationMap[(r.componentid || "").toString().toLowerCase()] || null;
      suggested.push({ ...r, suggestedTake: take, isOpen: true, rackLocation: loc });
      needed -= take;
    }

    for (const r of unopenedReels) {
      if (needed <= 0) break;
      const take = Math.min(r.qtyremaining, needed);
      const loc = reelLocationMap[(r.lotnumber || "").toString().toLowerCase()] || reelLocationMap[(r.componentid || "").toString().toLowerCase()] || null;
      suggested.push({ ...r, suggestedTake: take, isOpen: false, rackLocation: loc });
      needed -= take;
    }

    const primaryReel = openReels.length > 0 ? openReels[0] : (itemReels.length > 0 ? itemReels[0] : null);
    if (primaryReel) {
      primaryReel.rackLocation = reelLocationMap[(primaryReel.lotnumber || "").toString().toLowerCase()] || reelLocationMap[(primaryReel.componentid || "").toString().toLowerCase()] || null;
    }

    return {
      openReelSuggestion: primaryReel,
      suggestedReels: suggested,
    };
  };

  return picklists.map(pl => ({
    ...pl,
    items: pl.items.map(item => {
      const reelMatch = matchReelsForItem(item);
      return {
        ...item,
        openReelSuggestion: reelMatch.openReelSuggestion,
        suggestedReels: reelMatch.suggestedReels,
      };
    })
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

  const allReels = await prisma.reel.findMany({
    where: { qtyremaining: { gt: 0 } },
    select: { id: true, componentid: true, lotnumber: true, qtyremaining: true, reelstatus: true, isopen: true }
  });

  const racks = await prisma.rack.findMany({
    include: { cells: true }
  }).catch(() => []);

  const reelLocationMap = {};
  racks.forEach(r => {
    (r.cells || []).forEach(c => {
      if (c.reelCode) {
        const loc = `Rack ${r.rackCode} · Row ${c.rowNo} · Col C${c.colNo} (Slot R${c.rowNo}-C${c.colNo})`;
        reelLocationMap[c.reelCode.toString().toLowerCase()] = loc;
      }
    });
  });

  const components = await prisma.component.findMany().catch(() => []);
  const inventory = await prisma.inventory.findMany().catch(() => []);

  const matchReelsForItem = (item) => {
    const code = (item.componentCode || "").toString().toLowerCase();
    const name = (item.componentName || "").toString().toLowerCase();
    const idStr = String(item.componentId || "").toLowerCase();

    const comp = components.find(c => c.id === item.componentId || (c.macsoftPartNo || "").toLowerCase() === code) ||
                 inventory.find(i => i.id === item.componentId || (i.code || "").toLowerCase() === code);

    const matchKeys = new Set([code, name, idStr]);
    if (comp) {
      if (comp.macsoftPartNo) matchKeys.add(comp.macsoftPartNo.toLowerCase());
      if (comp.code) matchKeys.add(comp.code.toLowerCase());
      if (comp.name) matchKeys.add(comp.name.toLowerCase());
    }

    const itemReels = allReels.filter(r => matchKeys.has((r.componentid || "").toString().toLowerCase()));
    const openReels = itemReels.filter(r => r.isopen || r.reelstatus === "OPEN");
    const unopenedReels = itemReels.filter(r => !r.isopen && r.reelstatus !== "OPEN");

    const suggested = [];
    let needed = item.requiredQty || 1;

    for (const r of openReels) {
      if (needed <= 0) break;
      const take = Math.min(r.qtyremaining, needed);
      const loc = reelLocationMap[(r.lotnumber || "").toString().toLowerCase()] || reelLocationMap[(r.componentid || "").toString().toLowerCase()] || null;
      suggested.push({ ...r, suggestedTake: take, isOpen: true, rackLocation: loc });
      needed -= take;
    }

    for (const r of unopenedReels) {
      if (needed <= 0) break;
      const take = Math.min(r.qtyremaining, needed);
      const loc = reelLocationMap[(r.lotnumber || "").toString().toLowerCase()] || reelLocationMap[(r.componentid || "").toString().toLowerCase()] || null;
      suggested.push({ ...r, suggestedTake: take, isOpen: false, rackLocation: loc });
      needed -= take;
    }

    const primaryReel = openReels.length > 0 ? openReels[0] : (itemReels.length > 0 ? itemReels[0] : null);
    if (primaryReel) {
      primaryReel.rackLocation = reelLocationMap[(primaryReel.lotnumber || "").toString().toLowerCase()] || reelLocationMap[(primaryReel.componentid || "").toString().toLowerCase()] || null;
    }

    return {
      openReelSuggestion: primaryReel,
      suggestedReels: suggested,
    };
  };

  return {
    ...picklist,
    items: picklist.items.map(item => {
      const reelMatch = matchReelsForItem(item);
      return {
        ...item,
        openReelSuggestion: reelMatch.openReelSuggestion,
        suggestedReels: reelMatch.suggestedReels,
      };
    })
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

    const isCompleted = pickList.items.every((i) => {
      const targetQty = i.requiredQty > 0 ? i.requiredQty : i.availableQty;
      return i.usedQty >= targetQty;
    });

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

/* 
   OPERATOR WORKFLOW: PICK REEL ITEM
 */
const pickItem = async (picklistId, itemId, options = {}) => {
  const picklist = await prisma.pickList.findUnique({
    where: { id: Number(picklistId) },
    include: { items: true },
  });

  if (!picklist) {
    const err = new Error("Pick list not found");
    err.statusCode = 404;
    throw err;
  }

  if (options.operator && picklist.operator.toString().toLowerCase() !== options.operator.toString().toLowerCase()) {
    const err = new Error(`Picklist is assigned to ${picklist.operator}, not operator ${options.operator}`);
    err.statusCode = 403;
    throw err;
  }

  const item = picklist.items.find((i) => i.id === Number(itemId));
  if (!item) {
    const err = new Error("Pick list item not found");
    err.statusCode = 404;
    throw err;
  }

  if (item.status !== "PENDING") {
    const err = new Error(`Item is already in status '${item.status}'. Cannot perform PICK.`);
    err.statusCode = 400;
    throw err;
  }

  // Find Rack, Row, Column from DB
  const racks = await prisma.rack.findMany({ include: { cells: true } }).catch(() => []);
  let foundRack = null, foundRow = null, foundCol = null, foundLoc = null, matchedReelCode = null;

  const code = (item.componentCode || "").toLowerCase();
  const name = (item.componentName || "").toLowerCase();
  const idStr = String(item.componentId || "").toLowerCase();

  for (const r of racks) {
    for (const c of r.cells || []) {
      if (c.reelCode) {
        const rc = c.reelCode.toString().toLowerCase();
        if (rc === code || rc === name || rc === idStr || rc.includes(code) || code.includes(rc)) {
          foundRack = r.rackCode;
          foundRow = c.rowNo;
          foundCol = c.colNo;
          foundLoc = `Rack ${r.rackCode} · Row ${c.rowNo} · Col C${c.colNo}`;
          matchedReelCode = c.reelCode;
          break;
        }
      }
    }
    if (foundLoc) break;
  }

  if (!foundLoc) {
    const err = new Error("Rack location not found for this Reel. Cannot perform PICK.");
    err.statusCode = 400;
    throw err;
  }

  // TODO: Integrate MQTT PICK command here
  // TODO: Wait for hardware PICK ACK

  const updatedItem = await prisma.pickListItem.update({
    where: { id: Number(itemId) },
    data: {
      status: "PICKED",
      reelId: matchedReelCode,
      pickedRack: foundRack,
      pickedRow: foundRow,
      pickedCol: foundCol,
      pickedLocation: foundLoc,
      pickedAt: new Date(),
    },
  });

  if (picklist.status === "CREATED") {
    await prisma.pickList.update({
      where: { id: Number(picklistId) },
      data: { status: "IN_PROGRESS" },
    });
  }

  return updatedItem;
};

/* 
   OPERATOR WORKFLOW: UPDATE USED QUANTITY
 */
const updateItemQuantity = async (picklistId, itemId, data = {}) => {
  const picklist = await prisma.pickList.findUnique({
    where: { id: Number(picklistId) },
    include: { items: true },
  });

  if (!picklist) {
    const err = new Error("Pick list not found");
    err.statusCode = 404;
    throw err;
  }

  if (data.operator && picklist.operator.toString().toLowerCase() !== data.operator.toString().toLowerCase()) {
    const err = new Error(`Picklist is assigned to ${picklist.operator}`);
    err.statusCode = 403;
    throw err;
  }

  const item = picklist.items.find((i) => i.id === Number(itemId));
  if (!item) {
    const err = new Error("Pick list item not found");
    err.statusCode = 404;
    throw err;
  }

  if (item.status !== "PICKED" && item.status !== "IN_USE" && item.status !== "READY_FOR_RETURN") {
    const err = new Error(`Item status is '${item.status}'. Must be PICKED or IN_USE to save used quantity.`);
    err.statusCode = 400;
    throw err;
  }

  const usedQtyNum = Number(data.usedQty);
  if (isNaN(usedQtyNum) || usedQtyNum < 0) {
    const err = new Error("Used quantity must be a non-negative number");
    err.statusCode = 400;
    throw err;
  }

  const updatedItem = await prisma.pickListItem.update({
    where: { id: Number(itemId) },
    data: {
      usedQty: usedQtyNum,
      status: "READY_FOR_RETURN",
    },
  });

  return updatedItem;
};

/* 
   OPERATOR WORKFLOW: RETURN REEL
 */
const returnItem = async (picklistId, itemId, options = {}) => {
  const picklist = await prisma.pickList.findUnique({
    where: { id: Number(picklistId) },
    include: { items: true },
  });

  if (!picklist) {
    const err = new Error("Pick list not found");
    err.statusCode = 404;
    throw err;
  }

  if (options.operator && picklist.operator.toString().toLowerCase() !== options.operator.toString().toLowerCase()) {
    const err = new Error(`Picklist is assigned to ${picklist.operator}`);
    err.statusCode = 403;
    throw err;
  }

  const item = picklist.items.find((i) => i.id === Number(itemId));
  if (!item) {
    const err = new Error("Pick list item not found");
    err.statusCode = 404;
    throw err;
  }

  if (item.status !== "READY_FOR_RETURN") {
    const err = new Error(`Item status is '${item.status}'. Save used quantity before clicking return.`);
    err.statusCode = 400;
    throw err;
  }

  if (!item.pickedLocation) {
    const err = new Error("Original pick location not found for this Reel.");
    err.statusCode = 400;
    throw err;
  }

  // TODO: Integrate MQTT RETURN command here
  // TODO: Wait for hardware RETURN ACK

  const updatedItem = await prisma.pickListItem.update({
    where: { id: Number(itemId) },
    data: {
      status: "RETURN_PENDING",
    },
  });

  return updatedItem;
};

/* 
   OPERATOR WORKFLOW: CONFIRM RETURN (DEV ACK SIMULATION)
 */
const confirmReturnItem = async (picklistId, itemId, options = {}) => {
  const picklist = await prisma.pickList.findUnique({
    where: { id: Number(picklistId) },
    include: { items: true },
  });

  if (!picklist) {
    const err = new Error("Pick list not found");
    err.statusCode = 404;
    throw err;
  }

  if (options.operator && picklist.operator.toString().toLowerCase() !== options.operator.toString().toLowerCase()) {
    const err = new Error(`Picklist is assigned to ${picklist.operator}`);
    err.statusCode = 403;
    throw err;
  }

  const item = picklist.items.find((i) => i.id === Number(itemId));
  if (!item) {
    const err = new Error("Pick list item not found");
    err.statusCode = 404;
    throw err;
  }

  if (item.status !== "RETURN_PENDING") {
    const err = new Error(`Item status is '${item.status}'. Must be RETURN_PENDING to confirm return.`);
    err.statusCode = 400;
    throw err;
  }

  const updatedItem = await prisma.pickListItem.update({
    where: { id: Number(itemId) },
    data: {
      status: "COMPLETED",
      returnedAt: new Date(),
      completedAt: new Date(),
    },
  });

  // Deduct usedQty from Reel stock if matching reel exists
  try {
    if (item.reelId) {
      const reel = await prisma.reel.findFirst({
        where: {
          OR: [
            { lotnumber: item.reelId },
            { componentid: item.reelId }
          ]
        }
      });
      if (reel) {
        await prisma.reel.update({
          where: { id: reel.id },
          data: { qtyremaining: Math.max(0, reel.qtyremaining - item.usedQty) }
        });
      }
    }
  } catch (err) {
    console.error("Failed to update reel stock on completion:", err.message);
  }

  // Check if ALL items in picklist are COMPLETED
  const updatedPicklist = await prisma.pickList.findUnique({
    where: { id: Number(picklistId) },
    include: { items: true },
  });

  const allCompleted = updatedPicklist.items.every((i) => i.status === "COMPLETED");
  if (allCompleted) {
    await prisma.pickList.update({
      where: { id: Number(picklistId) },
      data: { status: "COMPLETED" },
    });
  } else {
    await prisma.pickList.update({
      where: { id: Number(picklistId) },
      data: { status: "IN_PROGRESS" },
    });
  }

  return updatedItem;
};

module.exports = {
  createPickList,
  getPickLists,
  getPickListById,
  updatePickList,
  executePickList,
  deletePickList,
  pickItem,
  updateItemQuantity,
  returnItem,
  confirmReturnItem,
};
