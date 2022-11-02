const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const config = require("config")
const jwt = require("jsonwebtoken")
const validator = require("validator")

const ThreadSchema = mongoose.Schema({
  uid: {
    type: String
  },
  name: {
    type: String,
  },
  username: {
    type: String,
  },
  head: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'Message'
  },
  num_of_messages: {
    type: Number,
    default: 0,
  },
  fatime: {
    type: String,
  },
  fadate: {
    type: String,
  },
  fadatetime: {
    type: String,
  },
  modified: {
    type: Date,
    default: Date.now
  },
  created: {
    type: Date,
    default: Date.now
  },
})

const ThreadModel = mongoose.model("Thread", ThreadSchema)

module.exports = ThreadModel