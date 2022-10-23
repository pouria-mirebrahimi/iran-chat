const mongoose = require('mongoose')
const config = require('config')

const db_uri = config.get("MongoDB.default-uri");
const db_main = config.get("MongoDB.database-name");

// Connect MongoDB at default port 27017.
const connectDB = mongoose.connect(
  `${db_uri}/${db_main}`,
  {
    useNewUrlParser: true,
  },
  (err) => {
    if (!err) {
      console.log("MongoDB Connection Succeeded.");
    } else {
      console.log("Error in DB connection: " + err);
    }
  }
);

module.exports = {
  connectDB,
};