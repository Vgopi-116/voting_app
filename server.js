const express = require("express");
const app = express();
const db = require("./db");
require("dotenv").config();
//require("dotenv").config();

//const bodyParser = require("body-parser");

//app.use(bodyParser.json()); //req.body

app.use(express.json());

const PORT = process.env.PORT || 3000;

//const { jwtAuthMiddleware } = require("./jwt");
app.get("/", function (req, res) {
  res.send("Hello BOB Welcome to the Voting System API");
});
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

//use the routers
app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);
app.listen(3000, () => {
  console.log("Listining on Port 3000");
});
