const sharp = require('sharp');

const inputPath = 'C:\\Users\\RITESH\\.gemini\\antigravity-ide\\brain\\21bf38d2-7185-4a1a-a2a3-e5b6ffd0fa7f\\full_cigar_character_1788351131293.jpg';
const outputPath = 'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\images\\cigar_character_full.png';

async function processImage() {
  try {
    const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
    
    // Convert to RGBA
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
        // Make very dark pixels transparent
        if (r < 20 && g < 20 && b < 20) {
          outData[i * 4 + 3] = 0;
        } else {
          // Feather edges by checking slightly higher thresholds to add partial transparency
          if (r < 40 && g < 40 && b < 40) {
            outData[i * 4 + 3] = 120; // Semi-transparent edge
          } else {
            outData[i * 4 + 3] = 255;
          }
        }
      }
    } else {
      outData = data;
    }

    await sharp(outData, {
      raw: { width: info.width, height: info.height, channels: 4 }
    }).png().toFile(outputPath);
    console.log('Successfully created transparent PNG for full character');
  } catch (err) {
    console.error(err);
  }
}
processImage();
