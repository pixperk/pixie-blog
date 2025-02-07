import { PrismaClient } from '@prisma/client';


let prisma: PrismaClient;

const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

type PrismaClientInstance = ReturnType<typeof createPrismaClient>;


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientInstance | undefined;
};

if (process.env.NODE_ENV === 'production') {
  prisma = globalForPrisma.prisma ?? createPrismaClient();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;