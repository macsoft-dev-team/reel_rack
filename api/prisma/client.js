const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  errorFormat: "pretty",
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;
