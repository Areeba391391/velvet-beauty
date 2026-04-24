const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://Areeba:Areeba11%40@cluster0.2qzb5ii.mongodb.net/velvet_beauty?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("velvet_beauty");

    const collection = db.collection("users");

    await collection.insertOne({
      name: "Wajahat",
      email: "test@test.com"
    });

    console.log("✅ Data inserted");

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();