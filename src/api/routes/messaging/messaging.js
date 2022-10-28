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
        const uid = uuid.v1()
        today = new jDate
        let now = new Date().toLocaleString('fa-IR', {
          timeZone: 'Asia/Tehran'
        })
        now_time = now.replace('،', '')
        now_time = now_time.replace('\u200f', '').split(' ')
        const fa_datetime = persian_tools.digitsEnToFa(
          today.format(
            'dddd، D MMMM YYYY'
          )
        )

        messages = MessageModel(
          {
            owner: req.user,
            to_user: req.user,
            message: 'خوش آمدید!'.slice(1, 30),
            head: true,
            uid: uid,
            sender: false,
            status: 'RECV',
            fatime: now_time[1],
            fadate: now_time[0],
            fadatetime: fa_datetime,
          }
        )

        await messages.save()

      }

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

      let result = []
      for (const item of messages) {
        result.push(
          {
            'name': item.to_user['alias'],
            'message': item['message'],
            'status': item['status'],
            'date': item['fadate'],
            'time': item['fatime'],
            'datetime': item['fadatetime'],
            'uid': item['uid'],
          }
        )
      }
      res.status(200).send(result)
    } else {
      let based_modified = {
        modified: -1
      }

      let result = []

      message_detailes = await MessageModel.findOne(
        {
          uid: filt
        }
      )
        .populate(
          {
            path: 'to_user',
            model: 'User'
          }
        )

      let messages = await MessageModel.find(
        {
          owner: req.user,
          to_user: message_detailes['to_user']
        }
      )
        .sort(based_modified)

      for (const item of messages) {
        result.push(
          {
            'name': item.to_user['alias'],
            'message': item['message'],
            'status': item['status'],
            'date': item['fadate'],
            'time': item['fatime'],
            'datetime': item['fadatetime'],
            'uid': item['uid'],
            'sender': item['sender'],
          }
        )
      }

      res.status(200).send(result)
    }
  } catch (e) {
    console.log(e)
    res.status(400).send()
  }
})


module.exports = router