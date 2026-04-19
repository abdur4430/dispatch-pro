import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateOrderNumber } from "@/lib/utils";
import { GraphQLScalarType, Kind } from "graphql";

const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  serialize: (value: unknown) => (value instanceof Date ? value.toISOString() : value),
  parseValue: (value: unknown) => (typeof value === "string" ? new Date(value) : null),
  parseLiteral: (ast) => (ast.kind === Kind.STRING ? new Date(ast.value) : null),
});

type Context = {
  session: any;
  companyId?: string;
  userId?: string;
};

function requireAuth(ctx: Context) {
  if (!ctx.userId) throw new Error("Authentication required");
  return ctx.userId;
}

function requireCompany(ctx: Context) {
  requireAuth(ctx);
  if (!ctx.companyId) throw new Error("Company setup required");
  return ctx.companyId;
}

function paginate(page = 1, pageSize = 20) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

export const resolvers = {
  DateTime: DateTimeScalar,

  Driver: {
    fullName: (d: any) => `${d.firstName} ${d.lastName}`,
  },

  Query: {
    me: async (_: any, __: any, ctx: Context) => {
      if (!ctx.userId) return null;
      return prisma.user.findUnique({ where: { id: ctx.userId } });
    },

    company: async (_: any, __: any, ctx: Context) => {
      if (!ctx.companyId) return null;
      return prisma.company.findUnique({ where: { id: ctx.companyId } });
    },

    dashboardStats: async (_: any, __: any, ctx: Context) => {
      const companyId = requireCompany(ctx);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalTrucks, availableTrucks, trucksOnRoute, totalDrivers, availableDrivers, activeDispatches, completedThisMonth, pendingOrders, revenueAgg] =
        await Promise.all([
          prisma.truck.count({ where: { companyId } }),
          prisma.truck.count({ where: { companyId, status: "AVAILABLE" } }),
          prisma.truck.count({ where: { companyId, status: "ON_ROUTE" } }),
          prisma.driver.count({ where: { companyId } }),
          prisma.driver.count({ where: { companyId, status: "AVAILABLE" } }),
          prisma.dispatchOrder.count({ where: { companyId, status: { in: ["CONFIRMED", "IN_TRANSIT", "AT_PICKUP", "LOADED", "AT_DELIVERY"] } } }),
          prisma.dispatchOrder.count({ where: { companyId, status: "COMPLETED", updatedAt: { gte: startOfMonth } } }),
          prisma.dispatchOrder.count({ where: { companyId, status: "PENDING" } }),
          prisma.dispatchOrder.aggregate({ where: { companyId, status: "COMPLETED", updatedAt: { gte: startOfMonth } }, _sum: { totalCharge: true } }),
        ]);

      return {
        totalTrucks,
        availableTrucks,
        trucksOnRoute,
        totalDrivers,
        availableDrivers,
        activeDispatches,
        completedThisMonth,
        revenueThisMonth: revenueAgg._sum.totalCharge ?? 0,
        pendingOrders,
      };
    },

    trucks: async (_: any, { filters, page = 1, pageSize = 20 }: any, ctx: Context) => {
      const companyId = requireCompany(ctx);
      const where: any = { companyId };
      if (filters?.size) where.size = filters.size;
      if (filters?.usageType) where.usageType = filters.usageType;
      if (filters?.segment) where.segment = filters.segment;
      if (filters?.status) where.status = filters.status;
      if (filters?.distanceRange) where.distanceRange = filters.distanceRange;
      if (filters?.search) where.OR = [{ unitNumber: { contains: filters.search } }, { make: { contains: filters.search } }, { model: { contains: filters.search } }];

      const { skip, take } = paginate(page, pageSize);
      const [nodes, total] = await Promise.all([
        prisma.truck.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { licenses: true } }),
        prisma.truck.count({ where }),
      ]);
      return { nodes, pageInfo: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    },

    truck: async (_: any, { id }: any, ctx: Context) => {
      requireCompany(ctx);
      return prisma.truck.findUnique({ where: { id }, include: { licenses: true, drivers: true } });
    },

    truckLicenses: async (_: any, { truckId }: any, ctx: Context) => {
      requireCompany(ctx);
      return prisma.truckLicense.findMany({ where: { truckId }, orderBy: { expiresAt: "asc" } });
    },

    drivers: async (_: any, { status, search, page = 1, pageSize = 20 }: any, ctx: Context) => {
      const companyId = requireCompany(ctx);
      const where: any = { companyId };
      if (status) where.status = status;
      if (search) where.OR = [{ firstName: { contains: search } }, { lastName: { contains: search } }, { email: { contains: search } }];

      const { skip, take } = paginate(page, pageSize);
      const [nodes, total] = await Promise.all([
        prisma.driver.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
        prisma.driver.count({ where }),
      ]);
      return { nodes, pageInfo: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    },

    driver: async (_: any, { id }: any, ctx: Context) => {
      requireCompany(ctx);
      return prisma.driver.findUnique({ where: { id }, include: { assignedTruck: true } });
    },

    clients: async (_: any, { search, isActive, page = 1, pageSize = 20 }: any, ctx: Context) => {
      const companyId = requireCompany(ctx);
      const where: any = { companyId };
      if (isActive !== undefined) where.isActive = isActive;
      if (search) where.OR = [{ name: { contains: search } }, { contactName: { contains: search } }, { email: { contains: search } }];

      const { skip, take } = paginate(page, pageSize);
      const [nodes, total] = await Promise.all([
        prisma.client.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
        prisma.client.count({ where }),
      ]);
      return { nodes, pageInfo: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    },

    client: async (_: any, { id }: any, ctx: Context) => {
      requireCompany(ctx);
      return prisma.client.findUnique({ where: { id } });
    },

    dispatchOrders: async (_: any, { filters, page = 1, pageSize = 20 }: any, ctx: Context) => {
      const companyId = requireCompany(ctx);
      const where: any = { companyId };
      if (filters?.status) where.status = filters.status;
      if (filters?.truckId) where.truckId = filters.truckId;
      if (filters?.driverId) where.driverId = filters.driverId;
      if (filters?.clientId) where.clientId = filters.clientId;
      if (filters?.search) where.OR = [{ orderNumber: { contains: filters.search } }, { originCity: { contains: filters.search } }, { destCity: { contains: filters.search } }];

      const { skip, take } = paginate(page, pageSize);
      const [nodes, total] = await Promise.all([
        prisma.dispatchOrder.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { truck: true, driver: true, client: true, statusHistory: { orderBy: { occurredAt: "asc" } } } }),
        prisma.dispatchOrder.count({ where }),
      ]);
      return { nodes, pageInfo: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    },

    dispatchOrder: async (_: any, { id }: any, ctx: Context) => {
      requireCompany(ctx);
      return prisma.dispatchOrder.findUnique({ where: { id }, include: { truck: true, driver: true, client: true, statusHistory: { orderBy: { occurredAt: "asc" } } } });
    },

    recentDispatchOrders: async (_: any, { limit = 10 }: any, ctx: Context) => {
      const companyId = requireCompany(ctx);
      return prisma.dispatchOrder.findMany({ where: { companyId }, take: limit, orderBy: { createdAt: "desc" }, include: { truck: true, driver: true, client: true } });
    },
  },

  Mutation: {
    signUp: async (_: any, { input }: any) => {
      const existing = await prisma.user.findUnique({ where: { email: input.email } });
      if (existing) throw new Error("Email already registered");
      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = await prisma.user.create({ data: { email: input.email, passwordHash, name: input.name, role: "OWNER" } });
      return { user };
    },

    upsertCompany: async (_: any, { input }: any, ctx: Context) => {
      const userId = requireAuth(ctx);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.companyId) {
        const company = await prisma.company.update({ where: { id: user.companyId }, data: input });
        return company;
      }
      const company = await prisma.company.create({ data: { ...input, users: { connect: { id: userId } } } });
      await prisma.user.update({ where: { id: userId }, data: { companyId: company.id } });
      return company;
    },

    createTruck: async (_: any, { input }: any, ctx: Context) => {
      const companyId = requireCompany(ctx);
      return prisma.truck.create({ data: { ...input, companyId }, include: { licenses: true } });
    },

    updateTruck: async (_: any, { id, input }: any, ctx: Context) => {
      requireCompany(ctx);
      return prisma.truck.update({ where: { id }, data: input, include: { licenses: true } });
    },

    deleteTruck: async (_: any, { id }: any, ctx: Context) => {
      requireCompany(ctx);
      await prisma.truck.delete({ where: { id } });
      return true;
    },

    updateTruckStatus: async (_: any, { id, status }: any, ctx: Context) => {
      requireCompany(ctx);
      return prisma.truck.update({ where: { id }, data: { status }, include: { licenses: true } });
    },

    addTruckLicense: async (_: any, { truckId, input }: any, ctx: Context) => {
      requireCompany(ctx);
      return prisma.truckLicense.create({ data: { ...input, truckId } });
    },

    deleteTruckLicense: async (_: any, { id }: any, ctx: Context) => {
      requireCompany(ctx);
      await prisma.truckLicense.delete({ where: { id } });
      return true;
    },

    createDriver: async (_: any, { input }: any, ctx: Context) => {
      const companyId = requireCompany(ctx);
      return prisma.driver.create({ data: { ...input, companyId } });
    },

    updateDriver: async (_: any, { id, input }: any, ctx: Context) => {
      requireCompany(ctx);
      return prisma.driver.update({ where: { id }, data: input });
    },

    deleteDriver: async (_: any, { id }: any, ctx: Context) => {
      requireCompany(ctx);
      await prisma.driver.delete({ where: { id } });
      return true;
    },

    assignDriverToTruck: async (_: any, { driverId, truckId }: any, ctx: Context) => {
      requireCompany(ctx);
      return prisma.driver.update({ where: { id: driverId }, data: { assignedTruckId: truckId ?? null } });
    },

    createClient: async (_: any, { input }: any, ctx: Context) => {
      const companyId = requireCompany(ctx);
      return prisma.client.create({ data: { ...input, companyId } });
    },

    updateClient: async (_: any, { id, input }: any, ctx: Context) => {
      requireCompany(ctx);
      return prisma.client.update({ where: { id }, data: input });
    },

    deleteClient: async (_: any, { id }: any, ctx: Context) => {
      requireCompany(ctx);
      await prisma.client.delete({ where: { id } });
      return true;
    },

    createDispatchOrder: async (_: any, { input }: any, ctx: Context) => {
      const companyId = requireCompany(ctx);
      const count = await prisma.dispatchOrder.count({ where: { companyId } });
      const orderNumber = generateOrderNumber(count);
      const order = await prisma.dispatchOrder.create({
        data: { ...input, companyId, orderNumber, hazmat: input.hazmat ?? false, rateType: input.rateType ?? "FLAT" },
        include: { truck: true, driver: true, client: true, statusHistory: true },
      });
      await prisma.dispatchStatusEvent.create({ data: { dispatchOrderId: order.id, status: "PENDING" } });
      return order;
    },

    updateDispatchOrder: async (_: any, { id, input }: any, ctx: Context) => {
      requireCompany(ctx);
      return prisma.dispatchOrder.update({ where: { id }, data: input, include: { truck: true, driver: true, client: true, statusHistory: { orderBy: { occurredAt: "asc" } } } });
    },

    deleteDispatchOrder: async (_: any, { id }: any, ctx: Context) => {
      requireCompany(ctx);
      await prisma.dispatchOrder.delete({ where: { id } });
      return true;
    },

    updateDispatchStatus: async (_: any, { id, status, note }: any, ctx: Context) => {
      requireCompany(ctx);
      await prisma.dispatchStatusEvent.create({ data: { dispatchOrderId: id, status, note } });
      return prisma.dispatchOrder.update({ where: { id }, data: { status }, include: { truck: true, driver: true, client: true, statusHistory: { orderBy: { occurredAt: "asc" } } } });
    },
  },
};
