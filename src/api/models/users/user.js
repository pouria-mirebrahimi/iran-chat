const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const validator = require("validator");


const UserSchema = mongoose.Schema({
  firstname: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 40,
  },
  lastname: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 80,
  },
  alias: {
    type: String,
    trim: false,
    unique: false,
    sparse: true,
    minlength: 4,
    maxlength: 80,
  },
  username: {
    type: String,
    trim: true,
    unique: false,
    minlength: 10,
    maxlength: 80,
    validate(value) {
      if (value.length < 10) {
        throw new Error("Your password must be at least 10 character.")
      }
      if (
        !value.match(
          /^[A-Za-z][A-Za-z0-9_]{10,80}$/
        )
      ) {
        throw new Error(
          "Your password must be as same as pattern"
        )
      }
    },
  },
  avatar: {
    type: Buffer,
    // const fs = require('fs')
    // avatar: fs.readFileSync(`passport.jpeg`)
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    sparse: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Your email is not correct.")
      }
    },
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    trim: true,
    validate(value) {
      if (value.length < 8) {
        throw new Error("Your password must be at least 8 character.")
      }
      if (
        !value.match(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#^()%*?&])[A-Za-z\d@$!%*?&]/
        )
      ) {
        throw new Error(
          "Your password must contains lowercase, uppercase and special charcters."
        )
      }
    },
  },
  mobile: {
    type: String,
    trim: true,
    required: false,
    unique: true,
    sparse: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  uniqueId: {
    type: String,
  },
  account_verified: {
    type: Boolean,
    default: false,
  },
  threads: [
    {
      thread: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'Thread',
      }
    }
  ],
  tokens: [
    {
      token: {
        type: String,
      }
    }
  ],
  created: {
    type: Date,
    default: Date.now,
  },
})

UserSchema.pre("save", async function (next) {
  const user = this

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

UserSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign(
    { _id: user._id.toString() },
    config.get("JsonWebToken.jwt-secret"),
    { expiresIn: config.get("JsonWebToken.expiration") }
  )

  user.tokens = user.tokens.concat({ token })

  return token
}

UserSchema.statics.findByCredentials = async (username, password) => {

  let theUser = null

  theUser = await UserModel.findOne({
    username,
  })

  if (!theUser) {
    return null
  }

  const isMatch = await bcrypt.compare(password, theUser.password)

  if (!isMatch) {
    return null
  }

  return theUser
}

const UserModel = mongoose.model("User", UserSchema)

module.exports = UserModel
