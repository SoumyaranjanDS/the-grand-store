const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImage(filename, outname) {
  const scratchDir = 'C:/Users/RITESH/.gemini/antigravity-ide/brain/2fd3aea6-4d21-4add-9cfa-9744892e6eb8/scratch';
  const inputPath = path.join(scratchDir, filename);
  const outputPath = path.join(scratchDir, outname);
  
  try {
    console.log(`Processing ${inputPath}...`);
    const { data, info } = await sharp(inputPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Loop through pixels and set alpha to 0 for white pixels
    const threshold = 240;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      
      // Check if pixel is white-ish
      if (r > threshold && g > threshold && b > threshold) {
        data[i+3] = 0; // Set alpha to 0 (transparent)
      }
    }

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: info.channels
      }
    })
    .png()
    .toFile(outputPath);
    
    // Copy the file to the frontend uploads directory
    const finalDest = path.join(__dirname, 'uploads', outname);
    fs.copyFileSync(outputPath, finalDest);
    console.log(`Saved transparent image to ${finalDest}`);
  } catch (err) {
    console.error(`Error processing ${filename}:`, err);
  }
}

async function run() {
  await processImage('delmaguey.jpg', 'delmaguey_transparent_full.png');
  await processImage('ardbeg.jpg', 'ardbeg_transparent_full.png');
  await processImage('aberlour.jpg', 'aberlour_transparent_full.png');
}

run();
