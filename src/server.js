const express = require('express')
const config = require('config')
require('dotenv').config()
var path = require("path")
var rfs = require("rotating-file-stream")


// middleware imports
const requestIp = require("request-ip")
const checkip = require("./api/middlewares/checkip")
const { morgan, assignId } = require("./api/middlewares/access.js")
const access_control = require('./api/middlewares/access_control')

// logger import
const logger = require("./api/utils/logger")

// Database
const connectDB = require('./api/database/db')

// Routes import
// todo: add routes here
const user_router = require('./api/routes/users/user')

const app = express()

// Init Middleware
app.use(express.json({ extended: false }))

// Access Control
app.use(access_control)

// Using routes
// todo: using routes here
app.use('/api/users/user', user_router)

// PORT for api
let CONFIG_PORT = null
if (config.has("ServerConfiguration.default-port")) {
  CONFIG_PORT = config.get("ServerConfiguration.default-port")
}
const PORT = process.env.PORT || CONFIG_PORT || 5000

// check IP
app.use(requestIp.mw())
app.use(checkip)

// Log into file including req.id
app.use(assignId)
var accessLogStream = rfs.createStream("access.log", {
  interval: "1h", // rotate daily
  path: path.join(__dirname, "../logs/access"),
})

app.use(
  morgan(
    "[:date] :id :method :url \
    :remote-addr - :remote-user :status \
    :user-agent :referrer :res[content-length]\
     :response-time",
    { stream: accessLogStream }
  )
)

// serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // set static folder
  app.use(express.static('client/build'))
  app.use(express.static(__dirname))
  app.use(express.static(path.join(__dirname, 'client', 'build')))

  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html')))
}

// Start the server on localhost
app.listen(
  PORT,
  () => {
    console.log(`The server is started on port ${PORT}`)
  }
)