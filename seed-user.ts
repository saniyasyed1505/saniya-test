import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'saniya.syed1505@gmail.com';
  const passwordHash = await bcrypt.hash('$@niyasyed123', 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Saniya Syed',
      passwordHash,
      role: Role.USER,
    },
  });
  console.log(`Seeded user: ${user.email}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
