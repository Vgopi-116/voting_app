const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
  },
  mobile: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  aadhaarCardNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["voter", "admin"],
    default: "voter",
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  const person = this;
  console.log("Pre-save hook triggered for:", this.name);
  //we need to hash the password only if it is modified (or is New)
  if (!person.isModified("password")) return next();

  console.log("Is password modified?", person.isModified("password"));
  console.log("Current password before hashing:", person.password); // Debug log

  try {
    //hash password generation
    const salt = await bcrypt.genSalt(10);
    //hash password
    const hashPassword = await bcrypt.hash(person.password, salt);
    //overrided the normal password with the hash password

    console.log("Generated Salt:", salt); // Debug log
    //console.log("Hashed Password:", hashPassword); // Debug log
    person.password = hashPassword;
    console.log("Hashed Password:", person.password);

    next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    throw err;
  }
};
const User = mongoose.model("User", userSchema);

module.exports = User;
