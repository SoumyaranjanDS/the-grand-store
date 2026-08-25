const { MongoClient } = require('mongodb');

// const oldUri = 'mongodb+srv://soumyaranjansahoo97292_db_user:MhyaihjRhis8NgOU@cluster0.neotr0o.mongodb.net/';
// const newUri = 'mongodb+srv://crmisa1000_db_user:Ug5sH8m4vxCjmZHN@cluster0.8snrppp.mongodb.net/';

async function migrate() {
  const oldClient = new MongoClient(oldUri);
  const newClient = new MongoClient(newUri);

  try {
    console.log('Connecting to old database...');
    await oldClient.connect();
    
    console.log('Connecting to new database...');
    await newClient.connect();

    const oldDb = oldClient.db(); 
    const newDb = newClient.db(); 

    const collections = await oldDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections.`);

    for (const collInfo of collections) {
      const collName = collInfo.name;
      // Skip system collections if any
      if (collName.startsWith('system.')) continue;
      
      console.log(`Migrating collection: ${collName}`);
      const oldColl = oldDb.collection(collName);
      const newColl = newDb.collection(collName);

      const docs = await oldColl.find({}).toArray();
      console.log(` - Found ${docs.length} documents.`);

      if (docs.length > 0) {
        // Attempt to drop target collection to avoid duplicate key errors
        try {
          await newColl.drop();
        } catch (e) {
          // Ignore if it doesn't exist
        }

        // Insert documents
        await newColl.insertMany(docs);
        console.log(` - Successfully inserted ${docs.length} documents into ${collName}.`);
      } else {
        console.log(` - Skipped ${collName} (empty).`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await oldClient.close();
    await newClient.close();
  }
}

migrate();
