const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {

  // Check existing manager
  const existingManager = await prisma.staff.findFirst({
    where: {
      role: "MANAGER",
      deletedAt: null,
    },
  });

  if (existingManager) {
    console.log("Manager already exists");
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    "123456",
    10
  );

  // Create manager
  const manager = await prisma.staff.create({
    data: {
      name: "System Manager",
      email: "manager@pbn.com",
      password: hashedPassword,
      role: "MANAGER",
      status: "ACTIVE",
    },
  });

  console.log("Manager created successfully");
  console.log({
    email: manager.email,
    password: "Admin@123",
  });

}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });