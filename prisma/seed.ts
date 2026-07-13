import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const userEmail = 'user@example.com';

  // Seed default admin
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'System Admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Seeded admin user: ${admin.email}`);

  // Seed default standard user
  const userPasswordHash = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      name: 'Regular User',
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });
  console.log(`Seeded standard user: ${user.email}`);

  // Seed dummy generations
  const generation1 = await prisma.generation.create({
    data: {
      userId: user.id,
      type: 'IMAGE',
      prompt: 'A futuristic cybernetic city at dusk',
      status: 'COMPLETED',
      model: 'dall-e-3',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1024&q=80',
      jobs: {
        create: {
          provider: 'openai',
          providerJobId: 'mock-job-1',
          status: 'COMPLETED',
        }
      }
    },
  });
  console.log(`Seeded Image Generation: ${generation1.prompt}`);

  const generation2 = await prisma.generation.create({
    data: {
      userId: user.id,
      type: 'VIDEO',
      prompt: 'Cinematic flythrough of a neon city',
      status: 'PROCESSING',
      model: 'mock-video-model',
      jobs: {
        create: {
          provider: 'mock-provider',
          providerJobId: 'mock-job-2',
          status: 'PROCESSING',
        }
      }
    },
  });
  console.log(`Seeded Video Generation: ${generation2.prompt}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
