const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processFullImage(filename, outname) {
  const scratchDir = 'C:/Users/RITESH/.gemini/antigravity-ide/brain/2fd3aea6-4d21-4add-9cfa-9744892e6eb8/scratch';
  const inputPath = path.join(scratchDir, filename);
  const outputPath = path.join(scratchDir, outname);
  
  console.log(`Processing ${inputPath}...`);
  try {
    const imageBuffer = fs.readFileSync(inputPath);
    
    // Convert to PNG first as sometimes the AI struggles with jpeg directly
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();
    
    console.log('Running AI background removal...');
    const blob = await removeBackground(pngBuffer, {
       model: "isnet_fp16",
       output: { format: "image/png" }
    });
    
    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    console.log(`Saved to ${outputPath}`);
  } catch (error) {
    console.error(`Error processing ${filename}:`, error);
  }
}

async function run() {
  await processFullImage('delmaguey.jpg', 'delmaguey_full_bg.png');
  await processFullImage('ardbeg.jpg', 'ardbeg_full_bg.png');
  await processFullImage('aberlour.jpg', 'aberlour_full_bg.png');
  process.exit(0);
}

run();
