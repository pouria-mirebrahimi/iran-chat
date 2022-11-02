const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const config = require("config")
const jwt = require("jsonwebtoken")
const validator = require("validator")

const MessageSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'User',
  },
  sent_by_server: {
    type: Boolean,
    default: false,
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
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'Thread'
  },
  uid: {
    type: String
  },
  seen: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'User',
      }
    }
  ],
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