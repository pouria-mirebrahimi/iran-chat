const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const config = require("config")
const jwt = require("jsonwebtoken")
const validator = require("validator")

const MessageSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'User',
    unique_with: ['to_user'],
  },
  to_user: {
    type: mongoose.Schema.Types.ObjectId,
    default: 'User',
    unique_with: ['owner'],
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
  sender: {
    type: Boolean,
    default: false,
  },
  head: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['SENDING', 'FAILED', 'SENT', 'RECV', 'SEEN'],
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