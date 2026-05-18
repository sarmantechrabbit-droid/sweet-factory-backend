const { prisma } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createAuditLog } = require("../utils/auditLogger.js");

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!_])[A-Za-z\d@#$%&*!_]{8,}$/;

const createStaff = async (data) => {
  let { name, email, password, role } = data;

  name = name?.trim();
  email = email?.trim().toLowerCase();
  role = role?.trim().toUpperCase();

  if (!name) throw new Error("Name is required");

  if (name.length > 30) {
    throw new Error("Full Name cannot be more than 30 characters");
  }

  if (!email) throw new Error("Email is required");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) throw new Error("Invalid email format");

  if (!password) throw new Error("Password is required");

  //   if (password.length < 6)
  //     throw new Error("Password must be at least 6 characters");

  if (!PASSWORD_REGEX.test(password)) {
    throw new Error(
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
    );
  }

  const ROLES = ["CHEF", "REVIEWER", "MANAGER", "CRA"];

  if (!role || !ROLES.includes(role)) throw new Error("Invalid role");

  const exist = await prisma.staff.findUnique({
    where: { email },
  });

  if (exist) {
    if (exist.deletedAt === null) {
      throw new Error("Email already registered");
    }

    // Reactivate soft-deleted user
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.staff.update({
      where: { id: exist.id },
      data: {
        name,
        password: hash,
        role,
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    await createAuditLog(prisma, {
      action: "CREATED",
      entity: "Staff",
      entityId: user.id,
      entityLabel: user.name,
      description: `Staff member ${user.name} reactivated with role ${user.role}`,
      userId: null,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.staff.create({
    data: {
      name,
      email,
      password: hash,
      role,
    },
  });

  await createAuditLog(prisma, {
    action: "CREATED",
    entity: "Staff",
    entityId: user.id,
    entityLabel: user.name,
    description: `New staff member ${user.name} added with role ${user.role}`,
    userId: null,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
};

const loginUser = async (email, password, role) => {
  email = email?.trim().toLowerCase();
  role = role?.trim();

  const normalizedRole = role?.trim().toUpperCase();

  const userByEmail = await prisma.staff.findUnique({
    where: { email },
  });

  if (!userByEmail || userByEmail.deletedAt !== null) {
    const err = new Error("Staff not found");
    err.statusCode = 404;
    throw err;
  }

  if (userByEmail.role !== normalizedRole) {
    const err = new Error(`Incorrect role selected for this account`);
    err.statusCode = 401;
    throw err;
  }

  const user = userByEmail;

  if (user.status !== "ACTIVE") {
    const err = new Error("Account is inactive. Please contact your manager.");
    err.statusCode = 403;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    const err = new Error("Incorrect password");
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  //   const token = jwt.sign(
  //     {
  //       id: user.id,
  //     },
  //     process.env.JWT_SECRET,
  //     { expiresIn: "7d" },
  //   );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const updateStaff = async (id, data) => {
  let { name, email, password, role, status } = data;

  if (name) name = name.trim();
  if (email) email = email.trim().toLowerCase();
  if (role) role = role.trim().toUpperCase();
  if (status) status = status.trim().toUpperCase();

  const updateData = {};

  if (name) {
    updateData.name = name;
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error("Invalid email format");

    const exist = await prisma.staff.findFirst({
      where: {
        email,
        NOT: { id },
        deletedAt: null,
      },
    });

    if (exist)
      throw new Error("Email already registered with another staff member");

    updateData.email = email;
  }

  const ROLES = ["CHEF", "REVIEWER", "MANAGER", "CRA"];
  if (role) {
    if (!ROLES.includes(role)) throw new Error("Invalid role");
    updateData.role = role;
  }

  const STATUS = ["ACTIVE", "INACTIVE"];
  if (status) {
    if (!STATUS.includes(status)) throw new Error("Invalid status");
    updateData.status = status;
  }

  if (password && password.trim() !== "") {
    // if (password.length < 6)
    //   throw new Error("Password must be at least 6 characters");

    if (!PASSWORD_REGEX.test(password)) {
      throw new Error(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      );
    }

    updateData.password = await bcrypt.hash(password, 10);
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  const user = await prisma.staff.update({
    where: { id, deletedAt: null },
    data: updateData,
  });

  await createAuditLog(prisma, {
    action: "UPDATED",
    entity: "Staff",
    entityId: user.id,
    entityLabel: user.name,
    description: `Staff member ${user.name} updated (${Object.keys(updateData)
      .filter((k) => k !== "password")
      .join(", ")})`,
    userId: null,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
};

const deleteStaff = async (id) => {
  const user = await prisma.staff.update({
    where: { id },
    data: { deletedAt: new Date(), status: "INACTIVE" },
  });

  await createAuditLog(prisma, {
    action: "DELETED",
    entity: "Staff",
    entityId: id,
    entityLabel: user.name,
    description: `Staff member ${user.name} (${user.role}) removed from the system (Soft Deleted)`,
    userId: null,
  });

  return { id: user.id, message: "Staff member deleted successfully" };
};

const getAllStaff = async () => {
  const users = await prisma.staff.findMany({
    where: { deletedAt: null },
    include: {
      _count: {
        select: {
          experiments: true,
          reviewAnswers: true,
          sensoryEvaluations: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    experimentCount: user._count.experiments,
    reviewCount: user._count.reviewAnswers + user._count.sensoryEvaluations,
  }));
};

const getStaffStats = async () => {
  const whereActive = { deletedAt: null };
  const total = await prisma.staff.count({ where: whereActive });
  const activeCount = await prisma.staff.count({
    where: { ...whereActive, status: "ACTIVE" },
  });
  const chefs = await prisma.staff.count({
    where: { ...whereActive, role: "CHEF" },
  });
  const reviewers = await prisma.staff.count({
    where: { ...whereActive, role: "REVIEWER" },
  });
  const cras = await prisma.staff.count({
    where: { ...whereActive, role: "CRA" },
  });
  const managers = await prisma.staff.count({
    where: { ...whereActive, role: "MANAGER" },
  });

  return {
    total,
    activeCount,
    chefs,
    reviewers,
    cras,
    managers,
  };
};

const changePassword = async (staffId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error("Current password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters");
  }

  if (currentPassword === newPassword) {
    throw new Error("New password cannot be the same as the current password");
  }

  const user = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!user) throw new Error("Staff not found");

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new Error("Current password is incorrect");

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.staff.update({
    where: { id: staffId },
    data: { password: hashed },
  });

  return { message: "Password updated successfully" };
};

module.exports = {
  createStaff,
  loginUser,
  updateStaff,
  deleteStaff,
  getAllStaff,
  getStaffStats,
  changePassword,
};
