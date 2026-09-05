import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@skinlab.local' },
    include: { role: true },
  });
  console.log("Admin user:", user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
