const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');
require('dotenv').config();
const Glossary = require('./models/Glossary');

const logFilePath = 'c:\\Users\\soumy\\.gemini\\antigravity-ide\\brain\\556a2cee-dc54-4290-9f06-9b4a3b6ad2ef\\.system_generated\\logs\\transcript_full.jsonl';

const parseAndSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const fileStream = fs.createReadStream(logFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let targetContent = null;
    for await (const line of rl) {
      if (line.trim().length === 0) continue;
      const parsed = JSON.parse(line);
      if (parsed.type === 'USER_INPUT' && parsed.content && parsed.content.includes('okay so in footer  in that glossary it is redirecting')) {
        targetContent = parsed.content;
        break;
      }
    }

    if (!targetContent) {
      console.log('Target message not found in logs.');
      process.exit(1);
    }

    // Extract the part after the colon
    const splitContent = targetContent.split('check, update and delete :');
    if (splitContent.length < 2) {
      console.log('Could not split content correctly.');
      process.exit(1);
    }

    let rawText = splitContent[1].trim();
    
    // Strip out <USER_REQUEST> or <ADDITIONAL_METADATA> or any xml tags at the end
    const cleanupRegex = /<[^>]+>[\s\S]*$/;
    rawText = rawText.replace(cleanupRegex, '').trim();

    // Split by newlines, filter empty lines
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    const termsToInsert = [];
    for (let i = 0; i < lines.length; i += 2) {
      const term = lines[i];
      const definition = lines[i+1];
      // Only insert if term doesn't look like a file path or weird metadata
      if (term && definition && !term.includes('c:\\') && !term.includes('npm run')) {
        termsToInsert.push({ term, definition, letter: term.charAt(0).toUpperCase() });
      }
    }

    console.log(`Found ${termsToInsert.length} terms to insert.`);

    // Clear existing
    await Glossary.deleteMany({});
    console.log('Cleared existing glossary terms.');

    // Insert new
    await Glossary.insertMany(termsToInsert);
    console.log('Successfully seeded glossary terms.');

    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

parseAndSeed();
