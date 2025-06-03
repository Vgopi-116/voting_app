const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization)
    return res.status(401).json({ error: "Token not Founf BOB" });

  //Extract the jwt tpken from the request headers
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    //Verify the Jwt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Attact the user info to the request body
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    res.status(err).json({ error: "invalid token" });
  }
};
//function to generate JWT Token
const generateToken = (userData) => {
  //Generate a new Jwt token using user data
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 30000 });
};
module.exports = { jwtAuthMiddleware, generateToken };
