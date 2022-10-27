const express = require("express")
const config = require("config")
const moment = require("moment-timezone")
const jwt = require("jsonwebtoken")
const Config = require("config")
const fs = require('fs')
const path = require('path')
const uuid = require('uuid')
const multer = require('multer')
const _ = require("lodash")
const jDate = require('jalali-date')
const date = require('date-and-time')
const persian_tools = require('@persian-tools/persian-tools')

// logger
const logger = require('../../utils/logger')

// const upload = require("../../utils/img_upload")
const upload = multer()

// middlewars
const auth = require("../../middlewares/auth")

// models
const UserModel = require("../../models/users/user")
const LoginInfoModel = require("../../models/users/logininfo")
const MessageModel = require("../../models/messaging/message")

// routers
const router = new express.Router()

// create a user
router.get("/:filt", auth, async (req, res) => {
  try {
    const filt = req.params.filt
    if (filt == 'all') {
      // todo: return the messages list
      let based_modified = {
        modified: -1
      }

      let messages = []

      messages = await MessageModel.find(
        {
          owner: req.user
        }
      ).sort(based_modified)


      if (messages.length == 0) {
        // todo: create the user saved message
        messages = MessageModel(
          {
            owner: req.user,
            to_user: req.user,
            message: 'خوش آمدید!',
            head: true,
          }
        )

        await messages.save()

      } else {
        messages = await MessageModel.find(
          {
            owner: req.user,
            head: true
          }
        )
          .populate(
            {
              path: 'to_user',
              model: 'User'
            }
          )
          .sort(based_modified)
      }

      let result = []
      for (const item of messages) {
        result.push(
          {
            'name': item.to_user['alias'],
            'message': item['message'],
            'status': 'SENDING',
            'date': 'امروز'
          }
        )
      }
      res.status(200).send(result)
    } else {
      res.status(200).send([])
    }
  } catch (e) {
    console.log(e)
    res.status(400).send()
  }
})


module.exports = router