const prisma = require("../prisma/client");

// GET all - with open reel information
exports.getAllInventory = async () => {
  const inventory = await prisma.inventory.findMany();

  // Get all reels
  const allReels = await prisma.reel.findMany({
    select: {
      id: true,
      componentid: true,
      lotnumber: true,
      qtyinitial: true,
      qtyremaining: true,
      isopen: true,
      reelstatus: true
    }
  });

  return inventory.map(item => {
    const code = (item.code || "").toString().toLowerCase();
    const name = (item.name || "").toString().toLowerCase();
    const idStr = String(item.id || "").toLowerCase();

    const matchKeys = new Set([code, name, idStr]);

    const itemReels = allReels.filter(r => matchKeys.has((r.componentid || "").toString().toLowerCase()));
    const itemOpenReels = itemReels.filter(r => (r.isopen || r.reelstatus === "OPEN") && r.qtyremaining > 0);
    const suggestedReel = itemOpenReels.length > 0 ? itemOpenReels[0] : (itemReels.length > 0 ? itemReels[0] : null);

    return {
      ...item,
      reels: itemReels,
      totalReelsCount: itemReels.length,
      openReels: itemOpenReels,
      hasOpenReel: itemOpenReels.length > 0,
      suggestedReel
    };
  });
};

// GET by id
exports.getInventoryById = (id) => {
  return prisma.inventory.findUnique({
    where: { id: Number(id) },
  });
};

// CREATE
exports.createInventory = async (data) => {
  const { performedByUserId, openReels, hasOpenReel, createdAt, updatedAt, id, ...rest } = data;

  const payload = {
    code: String(rest.code || "").trim(),
    name: String(rest.name || "").trim(),
    quantity: Number(rest.quantity) || 0,
    minStock: Number(rest.minStock) || 0,
    location: String(rest.location || "").trim(),
  };

  const inventory = await prisma.inventory.create({ data: payload });

  // Create transaction log
  try {
    await prisma.inventorytransaction.create({
      data: {
        transactionType: "COMPONENT_CREATED",
        performedByUserId: Number(performedByUserId) || 1,
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
  const { performedByUserId, openReels, hasOpenReel, createdAt, updatedAt, id: bodyId, ...rest } = data;

  const payload = {};
  if (rest.code !== undefined) payload.code = String(rest.code).trim();
  if (rest.name !== undefined) payload.name = String(rest.name).trim();
  if (rest.quantity !== undefined) payload.quantity = Number(rest.quantity) || 0;
  if (rest.minStock !== undefined) payload.minStock = Number(rest.minStock) || 0;
  if (rest.location !== undefined) payload.location = String(rest.location).trim();

  const inventory = await prisma.inventory.update({
    where: { id: Number(id) },
    data: payload,
  });

  // Create transaction log
  try {
    await prisma.inventorytransaction.create({
      data: {
        transactionType: "COMPONENT_UPDATED",
        performedByUserId: Number(performedByUserId) || 1,
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
        transactionReason: `Inventory item deleted: ${existing ? existing.code : id}`,
      },
    });
  } catch (txErr) {
    console.error("Failed to create transaction log:", txErr.message);
  }
};
