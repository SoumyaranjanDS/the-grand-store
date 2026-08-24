const fs = require('fs');

async function checkRedPixels(filePath) {
  try {
    const { default: Jimp } = await import('jimp');
    const image = await Jimp.read(filePath);
    let redCount = 0;
    let total = 0;
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      const a = this.bitmap.data[idx + 3];
      
      if (a > 100) {
        total++;
        if (r > 150 && g < 80 && b < 80) { // bright red
          redCount++;
        }
      }
    });
    console.log(`${filePath}: ${redCount} red pixels out of ${total} (${((redCount/total)*100).toFixed(2)}%)`);
  } catch (e) {
    console.log(`Failed to process ${filePath}: ${e.message}`);
  }
}

async function run() {
  await checkRedPixels('c:/office/store-new/grand-store/frontend/public/logo.png');
  await checkRedPixels('c:/office/store-new/grand-store/frontend/public/grand-store-logo.png');
  await checkRedPixels('c:/office/store-new/grand-store/frontend/public/assets/logo.webp');
  await checkRedPixels('c:/office/store-new/grand-store/frontend/public/assets/images/logo1.webp');
}
run();
