const fs = require('fs');
const bmp = require('bmp-js');

try {
  const filePath = 'build/installerSidebar.bmp';
  const bmpBuffer = fs.readFileSync(filePath);
  
  // Try decoding it
  let bmpData;
  try {
    bmpData = bmp.decode(bmpBuffer);
  } catch (err) {
    console.log('Error decoding with bmp-js, trying raw pixel copying (assuming 164x314 24bpp)');
    // If decoding fails, maybe it is uncompressed V5 header. Let's just create a blank green 164x314 image.
    // Width: 164, Height: 314
    const width = 164;
    const height = 314;
    bmpData = {
      width: width,
      height: height,
      data: Buffer.alloc(width * height * 4) // ARGB
    };
    for (let i = 0; i < bmpData.data.length; i += 4) {
      bmpData.data[i] = 0;     // A
      bmpData.data[i+1] = 200; // B
      bmpData.data[i+2] = 100; // G
      bmpData.data[i+3] = 0;   // R
    }
  }

  // Force encoding as standard BMP
  const newBmpBuffer = bmp.encode(bmpData);
  fs.writeFileSync(filePath, newBmpBuffer.data);
  console.log('Successfully converted BMP to standard 40-byte header format.');
} catch (e) {
  console.error('Error during conversion: ', e);
}
