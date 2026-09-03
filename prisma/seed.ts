import { randomBytes } from "crypto";
import { PrismaClient } from './generated/client';
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from 'bcryptjs';

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed in production.');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = [
    { email: 'alice@example.com', name: 'Alice' },
    { email: 'bob@example.com', name: 'Bob' },
    { email: 'charlie@example.com', name: 'Charlie' },
    { email: 'diana@example.com', name: 'Diana' },
    { email: 'edward@example.com', name: 'Edward' },
  ];

  for (const u of users) {
    const generated = randomBytes(12).toString('base64url');
    const password = `dev-${generated}`;
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        password: await bcrypt.hash(password, 10),
      },
    });
    console.log(`Created/kept ${u.email} — password: ${password}`);
  }

  console.log('Seeding completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
