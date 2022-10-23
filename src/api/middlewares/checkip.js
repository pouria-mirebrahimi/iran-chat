// middleware for checking request ip
const requestIp = require("request-ip")

module.exports = function (req, res, next) {
  const ip = req.clientIp
  req.ip = ip // saves in req

  next()
}
