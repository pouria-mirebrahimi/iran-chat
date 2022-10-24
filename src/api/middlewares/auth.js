const config = require("config");
const jwt = require("jsonwebtoken");
const User = require("../models/users/user");

const auth = async (req, res, next) => {
  try {
    // TODO check incoming requests more
    const token = req.header("Authorization").replace("Bearer ", "")
    const decoded = jwt.verify(token, config.get("JsonWebToken.jwt-secret"))
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    })

    if (!user) {
      throw new Error("Token is not valid");
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json(
      {
        err: "Please sign in"
      }
    );
  }
}

module.exports = auth;
