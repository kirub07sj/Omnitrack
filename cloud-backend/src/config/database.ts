import { PrismaClient } from '@prisma/client';

let dbUrl = process.env.DATABASE_URL || '';

// If connecting to Neon Postgres, ensure we use pgbouncer and have a longer timeout for cold starts
if (dbUrl && dbUrl.includes('neon.tech')) {
  try {
    const urlObj = new URL(dbUrl);
    
    if (!urlObj.searchParams.has('pgbouncer')) {
      urlObj.searchParams.set('pgbouncer', 'true');
    }
    if (!urlObj.searchParams.has('connect_timeout')) {
      urlObj.searchParams.set('connect_timeout', '30'); // Allow time for Neon to wake up
    }
    if (!urlObj.searchParams.has('pool_timeout')) {
      urlObj.searchParams.set('pool_timeout', '30');
    }
    
    dbUrl = urlObj.toString();
  } catch (err) {
    console.error("Failed to parse DATABASE_URL", err);
  }
}

export const prisma = dbUrl ? new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
}) : new PrismaClient();

export default prisma;
