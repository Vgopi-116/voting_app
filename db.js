const mongoose = require("mongoose");
require("dotenv").config();

//define mongodb connection URL

const mongoUrl = process.env.DB_URL_LOCAL;

//const mongoUrl = process.env.DB_URL;

mongoose.connect(mongoUrl, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("connected", () => {
  console.log("YOOOOO BOBB Connected to MongoDB Server");
});

db.on("error", (err) => {
  console.log("Error on connecting MongoDB Server");
});

db.on("disconnected", () => {
  console.log("Disconnected to MongoDb Server");
});

module.exports = db;
