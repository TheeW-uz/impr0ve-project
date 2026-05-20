import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { email: true, username: true, createdAt: true }
  });
  console.log(`Total Users: ${count}`);
  console.log('Recent Users:', JSON.stringify(recentUsers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
