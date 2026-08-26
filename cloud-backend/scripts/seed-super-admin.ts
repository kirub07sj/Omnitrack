import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'admin123';

  // Check if it already exists
  const existing = await prisma.account.findUnique({
    where: { email },
  });

  if (existing) {
    if (!existing.is_super_admin) {
      console.log(`User ${email} exists but is not super_admin. Upgrading...`);
      await prisma.account.update({
        where: { email },
        data: { is_super_admin: true },
      });
      console.log('Upgraded successfully.');
    } else {
      console.log(`Super admin ${email} already exists.`);
    }
  } else {
    console.log(`Creating super admin: ${email}`);
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await prisma.account.create({
      data: {
        email,
        password_hash,
        first_name: 'Super',
        last_name: 'Admin',
        is_super_admin: true,
      },
    });
    console.log('Super admin created successfully.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
