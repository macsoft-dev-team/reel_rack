const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const signin = async (employeeId, password) => {
  // Find user by employeeId
  const user = await prisma.user.findUnique({
    where: { employeeId },
  });

  if (!user) {
    throw new Error("Invalid employeeId or password");
  }

  // Check if user is ACTIVE
  if (user.status !== "ACTIVE") {
    throw new Error("User account is inactive");
  }

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid employeeId or password");
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      role: user.role,
      status: user.status,
    },
  };
};

module.exports = {
  signin,
};