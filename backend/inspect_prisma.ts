import { PrismaClient } from '@prisma/client';
const basePrisma = new PrismaClient();
const p = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations(params) {
        console.log("Keys in params:", Object.keys(params));
        return params.query(params.args);
      }
    }
  }
});

async function run() {
  await p.$transaction(async (tx) => {
    await tx.business.findFirst();
  });
}
run().catch(console.error).finally(() => process.exit(0));
