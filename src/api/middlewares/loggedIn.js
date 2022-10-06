const config = require("config");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const loggedin = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  const decoded = jwt.verify(token, config.get("JsonWebToken.jwt-secret"));
  const user = await User.findOne({
    _id: decoded._id,
    "tokens.token": token,
  });

  req.token = token;
  req.user = user;
  next();
};

module.exports = auth;
