const fs = require('fs');

const width = 164;
const height = 314;

// 24-bit BMP requires padding each row to a multiple of 4 bytes.
const rowSize = Math.floor((width * 3 + 3) / 4) * 4;
const imageSize = rowSize * height;
const fileSize = 54 + imageSize;

const buf = Buffer.alloc(fileSize);

// BITMAPFILEHEADER (14 bytes)
buf.write('BM', 0); // Signature
buf.writeUInt32LE(fileSize, 2); // FileSize
buf.writeUInt32LE(0, 6); // Reserved
buf.writeUInt32LE(54, 10); // DataOffset

// BITMAPINFOHEADER (40 bytes)
buf.writeUInt32LE(40, 14); // HeaderSize
buf.writeInt32LE(width, 18); // Width
buf.writeInt32LE(height, 22); // Height (positive means bottom-up, which is standard)
buf.writeUInt16LE(1, 26); // Planes
buf.writeUInt16LE(24, 28); // BPP
buf.writeUInt32LE(0, 30); // Compression (BI_RGB)
buf.writeUInt32LE(imageSize, 34); // ImageSize
buf.writeInt32LE(2835, 38); // XpixelsPerM
buf.writeInt32LE(2835, 42); // YpixelsPerM
buf.writeUInt32LE(0, 46); // ColorsUsed
buf.writeUInt32LE(0, 50); // ColorsImportant

// Pixel data
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const offset = 54 + (y * rowSize) + (x * 3);
    // Let's make it a nice dark color matching the app, like dark grey
    buf[offset] = 30;     // B
    buf[offset+1] = 30; // G
    buf[offset+2] = 30; // R
  }
}

fs.writeFileSync('build/installerSidebar.bmp', buf);
console.log('24-bit BMP created perfectly.');
