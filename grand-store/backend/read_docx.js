const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');

const docs = [
  '../../docs/GS Check out flow.docx',
  '../../docs/Payment flow.docx',
  '../../docs/Courier Service setup..docx'
];

async function readDocs() {
  let fullText = '';
  for (const doc of docs) {
    try {
      const fullPath = path.join(__dirname, doc);
      fullText += '\n\n--- ' + doc + ' ---\n\n';
      const result = await mammoth.extractRawText({path: fullPath});
      fullText += result.value;
    } catch (e) {
      console.error('Error reading', doc, e.message);
    }
  }
  fs.writeFileSync('docs_extracted.txt', fullText);
}

readDocs();
