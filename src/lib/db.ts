import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient(/* лог запросов выключен: лидерборд шумит в dev.log */)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db