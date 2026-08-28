const prisma = require("../prisma/client");

// GET all - with open reel information
exports.getAllInventory = async () => {
  const inventory = await prisma.inventory.findMany();
  
  // Get all open reels
  const openReels = await prisma.reel.findMany({
    where: {
      isopen: true  // Only get reels that are open
    },
    select: {
      id: true,
      componentid: true,
      lotnumber: true,
      qtyremaining: true,
      isopen: true,
      reelstatus: true
    }
  });
  
  // Map component IDs to array of open reels
  const openReelMap = {};
  openReels.forEach(reel => {
    // Match by componentid
    if (!openReelMap[reel.componentid]) {
      openReelMap[reel.componentid] = [];
    }
    openReelMap[reel.componentid].push({
      id: reel.id,
      lotnumber: reel.lotnumber,
      qtyremaining: reel.qtyremaining,
      reelstatus: reel.reelstatus
    });
  });
  
  // Attach open reel info to inventory items
  return inventory.map(item => ({
    ...item,
    openReels: openReelMap[item.code] || [],
    hasOpenReel: (openReelMap[item.code] && openReelMap[item.code].length > 0) || false
  }));
};

// GET by id
exports.getInventoryById = (id) => {
  return prisma.inventory.findUnique({
    where: { id: Number(id) },
  });
};

// CREATE
exports.createInventory = async (data) => {
  const inventory = await prisma.inventory.create({ data });
  
  // Create transaction log
  try {
    await prisma.inventorytransaction.create({
      data: {
        transactionType: "COMPONENT_CREATED",
        performedByUserId: data.performedByUserId || 1,
        transactionReason: `Inventory item created: ${inventory.code}`,
      },
    });
  } catch (txErr) {
    console.error("Failed to create transaction log:", txErr.message);
  }
  
  return inventory;
};

// UPDATE
exports.updateInventory = async (id, data) => {
  const inventory = await prisma.inventory.update({
    where: { id: Number(id) },
    data,
  });
  
  // Create transaction log
  try {
    await prisma.inventorytransaction.create({
      data: {
        transactionType: "COMPONENT_UPDATED",
        performedByUserId: data.performedByUserId || 1,
        transactionReason: `Inventory item updated: ${inventory.code}`,
      },
    });
  } catch (txErr) {
    console.error("Failed to create transaction log:", txErr.message);
  }
  
  return inventory;
};

// DELETE
exports.deleteInventory = async (id) => {
  const existing = await prisma.inventory.findUnique({ where: { id: Number(id) } });
  
  await prisma.inventory.delete({
    where: { id: Number(id) },
  });
  
  // Create transaction log
  try {
    await prisma.inventorytransaction.create({
      data: {
        transactionType: "COMPONENT_DELETED",
        performedByUserId: 1,
        transactionReason: `Inventory item deleted: ${existing.code}`,
      },
    });
  } catch (txErr) {
    console.error("Failed to create transaction log:", txErr.message);
  }
};
