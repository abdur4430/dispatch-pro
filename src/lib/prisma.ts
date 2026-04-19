import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

let _prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (_prisma) return _prisma;
  const url = process.env.DATABASE_URL ?? "file:/Users/muhammadabdurrehman/dev/dispatch-pro/dev.db";
  // PrismaLibSql takes a config object {url}, not a pre-created client
  const adapter = new PrismaLibSql({ url } as any);
  _prisma = new PrismaClient({ adapter } as any);
  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: string) {
    return (getPrismaClient() as any)[prop];
  },
});
