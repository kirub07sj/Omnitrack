const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("const prisma = new PrismaClient();") && !fullPath.includes('database/index.ts')) {
        // Find depth from src/
        const srcIndex = fullPath.indexOf('src/');
        const subPath = fullPath.substring(srcIndex + 4);
        const depth = subPath.split('/').length - 1;
        const relativePath = depth === 0 ? './database' : '../'.repeat(depth) + 'database';
        
        content = content.replace(/import \{ PrismaClient \} from '@prisma\/client';\n/g, `import { prisma } from '${relativePath}';\n`);
        content = content.replace(/const prisma = new PrismaClient\(\);\n/g, "");
        
        fs.writeFileSync(fullPath, content);
        console.log('Fixed', fullPath);
      }
    }
  }
}
processDir('./src');
