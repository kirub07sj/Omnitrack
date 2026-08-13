#!/bin/bash
set -e

echo "======================================"
echo "    Omnitrack Desktop Build Script    "
echo "======================================"

ROOT_DIR=$(pwd)
DESKTOP_DIR="$ROOT_DIR/desktop"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
RESOURCES_DIR="$DESKTOP_DIR/resources"
BACKEND_RESOURCES="$RESOURCES_DIR/backend"

# 1. Build the Frontend
echo "[1/4] Building React Frontend..."
cd "$FRONTEND_DIR"
npm run build

# 2. Build the Backend
echo "[2/4] Building Node Backend..."
cd "$BACKEND_DIR"
# Ensure dependencies are installed
npm install
npx tsc

# 3. Prepare Desktop Resources
echo "[3/4] Preparing Desktop Resources..."
# Clean previous resources
rm -rf "$BACKEND_RESOURCES"
mkdir -p "$BACKEND_RESOURCES"

# Copy backend compiled code and configuration
cp -r "$BACKEND_DIR/dist" "$BACKEND_RESOURCES/"
cp -r "$BACKEND_DIR/prisma" "$BACKEND_RESOURCES/"
cp "$BACKEND_DIR/package.json" "$BACKEND_RESOURCES/"
cp "$BACKEND_DIR/package-lock.json" "$BACKEND_RESOURCES/"
if [ -f "$BACKEND_DIR/.env" ]; then
  cp "$BACKEND_DIR/.env" "$BACKEND_RESOURCES/"
fi

# Skip nested npm install since backend dependencies are now in desktop/package.json

# 4. Build the Electron App
echo "[4/4] Packaging Electron App..."
cd "$DESKTOP_DIR"

# Generate Prisma Client in the desktop's node_modules
npx prisma generate --schema=./resources/backend/prisma/schema.prisma

# Ensure the frontend build is accessible to Electron (copy to desktop out/renderer)
# electron-builder/vite handles renderer if we place it properly, but since frontend 
# is external, we'll copy the frontend dist to the resources folder so Electron can load it.
rm -rf "$RESOURCES_DIR/frontend"
cp -r "$FRONTEND_DIR/dist" "$RESOURCES_DIR/frontend"

# Run electron builder to package the final executables
npm run build:linux
npm run build:win

echo "======================================"
echo "    Build Complete! Check desktop/dist"
echo "======================================"
