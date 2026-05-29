import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const plainPassword = process.env.ADMIN_PASSWORD;
  const username = process.env.NEXT_PUBLIC_USERNAME;
  const name = process.env.ADMIN_NAME ?? "Admin";
  const bio = process.env.ADMIN_BIO ?? "Welcome to my link page!";

  if (!email)
    throw new Error("ADMIN_EMAIL is not set in environment variables");
  if (!plainPassword)
    throw new Error("ADMIN_PASSWORD is not set in environment variables");
  if (!username)
    throw new Error("NEXT_PUBLIC_USERNAME is not set in environment variables");

  const password = await bcrypt.hash(plainPassword, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password,
      name,
      username,
      bio,
    },
  });

  console.log(`✓ Admin account seeded: ${email} (@${username})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
