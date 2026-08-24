const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const DESKTOP_DIR = path.join(ROOT_DIR, 'desktop');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

const RESOURCES_DIR = path.join(DESKTOP_DIR, 'resources');
const BACKEND_RESOURCES = path.join(RESOURCES_DIR, 'backend');
const FRONTEND_RESOURCES = path.join(RESOURCES_DIR, 'frontend');

// Helper to copy a directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('--- Copying Resources for Desktop Build ---');

// 1. Clean resources folder
console.log('Cleaning existing resources...');
if (fs.existsSync(RESOURCES_DIR)) {
  fs.rmSync(RESOURCES_DIR, { recursive: true, force: true });
}
fs.mkdirSync(RESOURCES_DIR, { recursive: true });
fs.mkdirSync(BACKEND_RESOURCES, { recursive: true });

// 2. Copy Backend resources
console.log('Copying backend files...');
copyDirSync(path.join(BACKEND_DIR, 'dist'), path.join(BACKEND_RESOURCES, 'dist'));
copyDirSync(path.join(BACKEND_DIR, 'prisma'), path.join(BACKEND_RESOURCES, 'prisma'));

const backendFilesToCopy = ['package.json', 'package-lock.json', '.env'];
backendFilesToCopy.forEach(file => {
  const src = path.join(BACKEND_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(BACKEND_RESOURCES, file));
  }
});

// 3. Copy Frontend resources
console.log('Copying frontend files...');
copyDirSync(path.join(FRONTEND_DIR, 'dist'), FRONTEND_RESOURCES);

// 4. Generate Prisma Client for Desktop
console.log('Generating Prisma client for desktop...');
const { execSync } = require('child_process');
try {
  execSync('npx prisma generate --schema=./resources/backend/prisma/schema.prisma', { stdio: 'inherit', cwd: DESKTOP_DIR });
} catch (error) {
  console.error('Failed to generate Prisma client:', error.message);
  process.exit(1);
}

console.log('✅ Resources copied successfully!');
