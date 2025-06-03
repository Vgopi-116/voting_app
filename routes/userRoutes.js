const express = require("express");
const router = express.Router();

const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

//POST route to add a new user
router.post("/signup", async (req, res) => {
  try {
    const data = req.body; // assuming the req body contains the person data

    const adminUser = await User.findOne({ role: "admin" });
    if (data.role === "admin" && adminUser) {
      return res.status(403).json({ error: "Admin already exists" });
    }
    //const newPerson = new Person(data);
    //save newPerson to database

    // const response = await Person.insertMany(data);
    //----
    /// same code as below for response, const newPerson = new Person(data); // Create a new instance
    // await newPerson.save(); // Save the instance
    // Validate Aadhar Card Number must have exactly 12 digit
    if (!/^\d{12}$/.test(data.aadhaarCardNumber)) {
      return res
        .status(400)
        .json({ error: "Aadhar Card Number must be exactly 12 digits" });
    }

    // Check if a user with the same Aadhar Card Number already exists
    const existingUser = await User.findOne({
      aadhaarCardNumber: data.aadhaarCardNumber,
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with the same Aadhar Card Number already exists",
      });
    }
    const response = await User(req.body).save(); // This triggers the pre-save hook

    console.log("data saved");
    const payload = {
      id: response.id,
    };
    console.log(JSON.stringify(payload));
    const token = generateToken(payload); // Generate JWT token using the payload
    console.log("Token is :", token);

    res.status(200).json({ response: response, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal sever error" });
  }
});

//login route
router.post("/login", async (req, res) => {
  try {
    //Extract the aadhaarCardNumber and passowrd from the request body
    const { aadhaarCardNumber, password } = req.body; // Destructuring to get aadhaarCardNumber and password
    console.log("aadhaarCardNumber:", aadhaarCardNumber);
    console.log("Password:", password);
    //find the user by the username
    const user = await User.findOne({ aadhaarCardNumber: aadhaarCardNumber });
    console.log("User found:", user);

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        error: "Invalid Username or Password, Please check and try again BOB",
      });
    }

    //Generate JWT Token
    const payload = {
      //username: user.username,
      id: user.id,
    };
    const token = generateToken(payload);

    //return token as response
    res.json({ token });
  } catch (err) {
    console.log("Error in login:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// getting the profile of user
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    //console.log("User Data:", userData);
    const userId = userData.id;
    const user = await User.findById(userId);
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // extarct id from the token
    const { currentPassword, newPassword } = req.body;

    //find the user by id
    const user = await User.findById(userId);
    //if password does not match return error
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        error: "Invalid Username or Password, Please check and try again BOB",
      });
    }

    //update the user's password
    user.password = newPassword;
    await user.save();
    console.log("Password Updated");
    res.status(200).json({ Message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: "Internal server error" });
  }
});

module.exports = router;
