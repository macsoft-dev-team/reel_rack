// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/* DEFAULT RACK LAYOUT */
const DEFAULT_LAYOUT = {
  1: 18,
  2: 15,
  3: 20,
};

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash("123456", 10);

  /* =========================
     CLEANUP (DEV SAFE ORDER)
     ========================= */
  await prisma.inventorytransaction.deleteMany();
  await prisma.inventoryHistory.deleteMany();
  await prisma.pickListItem.deleteMany();
  await prisma.pickList.deleteMany();
  await prisma.history.deleteMany();
  await prisma.Cell.deleteMany();
  await prisma.rack.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.reel.deleteMany();
  await prisma.component.deleteMany();
  await prisma.manufacturer.deleteMany();
  await prisma.user.deleteMany();

  /* =========================
     COMPONENT MASTER
     ========================= */
  await prisma.component.createMany({
    data: [
      {
        componentType: "Resistor",
        package: "0805",
        manufacturer: "Vishay",
        manufacturerPartNo: "RES-0805-10K",
        macsoftPartNo: "MS-RES-001",
        reelSize: 7,
        reelSizeUnit: "inch",
        minimumStockQty: 5,
        reelQty: 10000,
      },
      {
        componentType: "Capacitor",
        package: "0603",
        manufacturer: "Murata",
        manufacturerPartNo: "GRM188R71C104",
        macsoftPartNo: "MS-CAP-002",
        reelSize: 7,
        reelSizeUnit: "inch",
        minimumStockQty: 10,
        reelQty: 15000,
      },
      {
        componentType: "Inductor",
        package: "0805",
        manufacturer: "TDK",
        manufacturerPartNo: "LQP03TN1N5",
        macsoftPartNo: "MS-IND-003",
        reelSize: 7,
        reelSizeUnit: "inch",
        minimumStockQty: 5,
        reelQty: 8000,
      },
    ],
  });

  const components = await prisma.component.findMany();

  /* =========================
     RACKS + CELLS
     ========================= */
  const racks = [];

  for (let r = 1; r <= 3; r++) {
    const rack = await prisma.rack.create({
      data: {
        rackCode: `R${r}`,
        cells: {
          create: Object.entries(DEFAULT_LAYOUT).flatMap(
            ([rowNo, colCount]) =>
              Array.from({ length: colCount }, (_, i) => ({
                rowNo: Number(rowNo),
                colNo: i + 1,
                reelCode:
                  r === 1 && rowNo == 1 && i < 2
                    ? `REEL-000${i + 1}`
                    : null,
              }))
          ),
        },
      },
    });

    racks.push(rack);
  }

  /* =========================
     INVENTORY
     ========================= */
  await prisma.inventory.createMany({
    data: [
      {
        code: "ITM001",
        name: "Cap",
        quantity: 25,
        minStock: 10,
        location: "Rack R1 · Row2 · C3",
      },
      {
        code: "ITM002",
        name: "Res",
        quantity: 5,
        minStock: 10,
        location: "Rack R2 · Row1 · C1",
      },
    ],
  });

  /* =========================
     USERS
     ========================= */
  await prisma.user.createMany({
    data: [
      {
        employeeId: "SA-001",
        name: "Gopal",
        password: passwordHash,
        role: "SUPERADMIN",
        status: "ACTIVE",
      },
      {
        employeeId: "AD-001",
        name: "Arun",
        password: passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
      {
        employeeId: "OP-001",
        name: "Kumar",
        password: passwordHash,
        role: "OPERATOR",
        status: "ACTIVE",
      },
    ],
  });

  /* =========================     PICK LISTS
     ========================= */
  await prisma.pickList.create({
    data: {
      code: "PL-001",
      name: "Morning Shift Pick",
      operator: "OPERATOR_1",
      status: "CREATED",
      items: {
        create: [
          {
            componentId: components[0].id,
            componentCode: components[0].macsoftPartNo,
            componentName: components[0].componentType,
            availableQty: 50,
            usedQty: 0,
            location: "R1 · Row2 · C3",
          },
          {
            componentId: components[1].id,
            componentCode: components[1].macsoftPartNo,
            componentName: components[1].componentType,
            availableQty: 30,
            usedQty: 0,
            location: "R2 · Row1 · C1",
          },
        ],
      },
    },
  });

  await prisma.pickList.create({
    data: {
      code: "PL-002",
      name: "Evening Shift Pick",
      operator: "OPERATOR_2",
      status: "IN_PROGRESS",
      items: {
        create: [
          {
            componentId: components[2].id,
            componentCode: components[2].macsoftPartNo,
            componentName: components[2].componentType,
            availableQty: 20,
            usedQty: 10,
            location: "R3 · Row4 · C2",
          },
        ],
      },
    },
  });

   await prisma.manufacturer.createMany({
    data: [
      {
        name: "FlexiPack Industries",
        country: "India",
        phone: "+91 9876543210",
        email: "contact@flexipack.in",
      },
      {
        name: "Global Plastics Ltd",
        country: "Germany",
        phone: "+49 1765432109",
        email: "info@globalplastics.de",
      },
      {
        name: "Sunrise Packaging",
        country: "USA",
        phone: "+1 4156789023",
        email: "sales@sunrisepack.com",
      },
      {
        name: "Prime Polytech",
        country: "China",
        phone: "+86 13876543210",
        email: "support@primepoly.cn",
      },
      {
        name: "EcoWrap Solutions",
        country: "UAE",
        phone: "+971 501234567",
        email: "hello@ecowrap.ae",
      },
    ],
    skipDuplicates: true,
  });

  // reel

  await prisma.reel.createMany({
    data: [
      {
        componentid: "CMP001",
        lotnumber: "LOT1001",
        qtyinitial: 1000,
        qtyremaining: 1000,
        reelstatus: "OPEN",
        isopen: true,
      },
      {
        componentid: "CMP002",
        lotnumber: "LOT1002",
        qtyinitial: 500,
        qtyremaining: 200,
        reelstatus: "OPEN",
        isopen: true,
      },
      {
        componentid: "CMP003",
        lotnumber: "LOT1003",
        qtyinitial: 800,
        qtyremaining: 0,
        reelstatus: "CLOSED",
        isopen: false,
      },
    ],
  });

  const reels = await prisma.reel.findMany();
  const users = await prisma.user.findMany();
  const pickLists = await prisma.pickList.findMany();

  /* =========================
     INVENTORY TRANSACTIONS
     ========================= */
  await prisma.inventorytransaction.create({
    data: {
      reel: { connect: { id: reels[0].id } },
      pickTask: { connect: { id: pickLists[0].id } },
      transactionType: "COMPONENT_PLACED",
      qtyBefore: 0,
      qtyAfter: 1000,
      qtyDelta: 1000,
      performedByUser: { connect: { id: users[0].id } },
      transactionReason: "Initial component placement",
    },
  });

  await prisma.inventorytransaction.create({
    data: {
      reel: { connect: { id: reels[1].id } },
      pickTask: { connect: { id: pickLists[0].id } },
      transactionType: "COMPONENT_PLACED",
      qtyBefore: 0,
      qtyAfter: 500,
      qtyDelta: 500,
      performedByUser: { connect: { id: users[1].id } },
      transactionReason: "Component placed for picklist",
    },
  });

  await prisma.inventorytransaction.create({
    data: {
      reel: { connect: { id: reels[1].id } },
      pickTask: { connect: { id: pickLists[0].id } },
      transactionType: "PICKLIST_QTY_UPDATE",
      qtyBefore: 500,
      qtyAfter: 200,
      qtyDelta: -300,
      performedByUser: { connect: { id: users[2].id } },
      transactionReason: "Quantity updated after picklist usage",
    },
  });

  await prisma.inventorytransaction.create({
    data: {
      reel: { connect: { id: reels[2].id } },
      transactionType: "COMPONENT_PLACED",
      qtyBefore: 0,
      qtyAfter: 800,
      qtyDelta: 800,
      performedByUser: { connect: { id: users[0].id } },
      transactionReason: "Component placed on reel",
    },
  });

  await prisma.inventorytransaction.create({
    data: {
      reel: { connect: { id: reels[2].id } },
      transactionType: "PICKLIST_QTY_UPDATE",
      qtyBefore: 800,
      qtyAfter: 0,
      qtyDelta: -800,
      performedByUser: { connect: { id: users[1].id } },
      transactionReason: "All quantity used",
    },
  });

  // Creation transactions
  /*
  await prisma.inventorytransaction.create({
    data: {
      transactionType: "COMPONENT_CREATED",
      qtyBefore: 0,
      qtyAfter: 0,
      qtyDelta: 0,
      performedByUser: { connect: { id: users[0].id } },
      transactionReason: "Component created",
    },
  });

  await prisma.inventorytransaction.create({
    data: {
      transactionType: "MANUFACTURER_CREATED",
      qtyBefore: 0,
      qtyAfter: 0,
      qtyDelta: 0,
      performedByUser: { connect: { id: users[0].id } },
      transactionReason: "Manufacturer created",
    },
  });

  await prisma.inventorytransaction.create({
    data: {
      transactionType: "RACK_CREATED",
      qtyBefore: 0,
      qtyAfter: 0,
      qtyDelta: 0,
      performedByUser: { connect: { id: users[0].id } },
      transactionReason: "Rack created",
    },
  });

  await prisma.inventorytransaction.create({
    data: {
      transactionType: "PICKLIST_CREATED",
      qtyBefore: 0,
      qtyAfter: 0,
      qtyDelta: 0,
      performedByUser: { connect: { id: users[0].id } },
      transactionReason: "Picklist created",
    },
  });
  */

  console.log("✅ Seeding completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
