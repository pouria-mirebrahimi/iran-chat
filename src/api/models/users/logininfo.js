const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const config = require("config")
const jwt = require("jsonwebtoken")
const validator = require("validator")

const LoginInfoSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'User'
  },
  userMobile: {
    type: String,
  },
  userEmail: {
    type: String,
  },
  userPassword: {
    type: String,
  },
  isMobile: {
    type: Boolean,
  },
  isTablet: {
    type: Boolean,
  },
  isDesktop: {
    type: Boolean,
  },
  isSmartTV: {
    type: Boolean,
  },
  isWearable: {
    type: Boolean,
  },
  isConsole: {
    type: Boolean,
  },
  isEmbedded: {
    type: Boolean,
  },
  isAndroid: {
    type: Boolean,
  },
  isWinPhone: {
    type: Boolean,
  },
  isIOS: {
    type: Boolean,
  },
  isChrome: {
    type: Boolean,
  },
  isFirefox: {
    type: Boolean,
  },
  isSafari: {
    type: Boolean,
  },
  isOpera: {
    type: Boolean,
  },
  isIE: {
    type: Boolean,
  },
  isEdge: {
    type: Boolean,
  },
  isYandex: {
    type: Boolean,
  },
  isChromium: {
    type: Boolean,
  },
  isMobileSafari: {
    type: Boolean,
  },
  isSamsungBrowser: {
    type: Boolean,
  },
  osVersion: {
    type: String,
  },
  osName: {
    type: String,
  },
  fullBrowserVersion: {
    type: String,
  },
  browserVersion: {
    type: String,
  },
  browserName: {
    type: String,
  },
  mobileVendor: {
    type: String,
  },
  mobileModel: {
    type: String,
  },
  engineName: {
    type: String,
  },
  engineVersion: {
    type: String,
  },
  isWindows: {
    type: Boolean,
  },
  isMacOs: {
    type: Boolean,
  },
  auth_token: {
    type: String,
  },
  status: {
    type: String,
  },
  ip: {
    type: String,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  countryCode: {
    type: String,
  },
  countryName: {
    type: String,
  },
  city: {
    type: String,
  },
  district: {
    type: String,
  },
  postCode: {
    type: String,
  },
  county: {
    type: String,
  },
  state: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now
  },
})

const LoginInfoModel = mongoose.model("LoginInfo", LoginInfoSchema)

module.exports = LoginInfoModel