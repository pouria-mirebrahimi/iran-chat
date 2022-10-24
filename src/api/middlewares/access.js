const morgan = require("morgan");
const uuid = require("node-uuid");
const moment = require("moment-timezone");
const config = require("config");
const jwt = require("jsonwebtoken");

// logger
const logger = require("../utils/logger");

// UserModel
const User = require("../models/users/user");

morgan.token("date", function getDate(req) {
  return moment().tz("Asia/Tehran").format("YYYY-MM-DD HH:mm:ss");
});


morgan.token("id", function getId(req) {
  return req.id;
});

// function assignId(req, res, next) {
//   req.id = uuid.v4();
//   next();
// }

const assignId = async (req, res, next) => {
  try {
    if ("authorization" in req.headers) {
      const token = req.header("Authorization").replace("Bearer ", "");
      const decoded = jwt.verify(token, config.get("JsonWebToken.jwt-secret"));
      const user = await User.findOne({
        _id: decoded._id,
        "tokens.token": token,
      });

      if (!user) {
        req.id = `${uuid.v4()} ( )`;
      } else {
        req.id = `${uuid.v4()} (${user.id})`;
      }
    } else {
      req.id = `${uuid.v4()} ( )`;
    }

    next();
  } catch (err) {
    logger.error(`${err.message}  ${err.stack}`);
  }
};

module.exports = {
  morgan,
  assignId,
};
