const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const config = require("config")
const jwt = require("jsonwebtoken")
const validator = require("validator")

const MessageSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'User'
  },
  to_user: {
    type: mongoose.Schema.Types.ObjectId,
    default: 'User',
  },
  message: {
    type: String,
    trim: true,
    maxLength: 2000
  },
  attachments: [
    {
      type: String
    }
  ],
  uid: {
    type: String
  },
  status: {
    type: String,
    enum: ['SENDING', 'FAILED', 'SENT', 'RECV', 'READ'],
    default: 'SENDING',
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
  created: {
    type: Date,
    default: Date.now
  },
})

const MessageModel = mongoose.model("Message", MessageSchema)

module.exports = MessageModel