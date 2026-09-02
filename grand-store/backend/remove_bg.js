const sharp = require('sharp');
const path = require('path');

const inputPath = 'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\images\\cigar_character.jpg';
const outputPath = 'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\images\\cigar_character.png';

async function processImage() {
  try {
    const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
    
    // Convert to RGBA if it's RGB
    let outData;
    if (info.channels === 3) {
      outData = Buffer.alloc(info.width * info.height * 4);
      for (let i = 0; i < info.width * info.height; i++) {
        const r = data[i * 3];
        const g = data[i * 3 + 1];
        const b = data[i * 3 + 2];
        outData[i * 4] = r;
        outData[i * 4 + 1] = g;
        outData[i * 4 + 2] = b;
        // If it's mostly black, make it transparent
        if (r < 30 && g < 30 && b < 30) {
          outData[i * 4 + 3] = 0;
        } else {
          outData[i * 4 + 3] = 255;
        }
      }
    } else {
      outData = data;
    }

    await sharp(outData, {
      raw: { width: info.width, height: info.height, channels: 4 }
    }).png().toFile(outputPath);
    console.log('Successfully created transparent PNG');
  } catch (err) {
    console.error(err);
  }
}
processImage();
