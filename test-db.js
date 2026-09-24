require("dotenv").config();
const { Client } = require("pg");

const client = new Client({ connectionString: process.env.DATABASE_URL });

console.log("Connecting...");
client
  .connect()
  .then(() => {
    console.log("Connected!");
    return client.query("SELECT 1 as ok");
  })
  .then((res) => {
    console.log("Query result:", res.rows);
    return client.end();
  })
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
  