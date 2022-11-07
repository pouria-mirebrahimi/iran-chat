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
const admz = require('adm-zip')

// datetime tools
const datetime = require('../../utils/datetime')

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
const ThreadModel = require("../../models/messaging/threads")

// routers
const router = new express.Router()

// get the user threadsP
router.get("/", auth, async (req, res) => {
  try {

    let user = req.user

    if ('threads' in user) {
      const user_threads = user.threads
      if (user_threads.length == 0) {
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
        let welcome_thread = ThreadModel(
          {
            uid: uuid.v1(),
            num_of_messages: 1,
            name: 'welcome message',
            fatime: now_time[1],
            fadate: now_time[0],
            fadatetime: fa_datetime,
          }
        )

        const welcome_message = MessageModel(
          {
            owner: user,
            uid: uuid.v1(),
            sent_by_server: true,
            message: 'به نرم‌افزار پیام‌رسان خوش آمدید!',
            thread: welcome_thread,
            fatime: now_time[1],
            fadate: now_time[0],
            fadatetime: fa_datetime,
          }
        )

        welcome_thread.head = welcome_message

        // user.threads = user.threads.concat({ welcome_thread })

        await welcome_thread.save()
        await welcome_message.save()

        await UserModel.findOneAndUpdate(
          {
            _id: req.user._id,
          },
          {
            $push: {
              threads: {
                thread: welcome_thread
              }
            }
          }
        )
      }
    } else { }

    const user_threads = await UserModel.findById(req.user._id)
    // .populate(
    //   {
    //     path: 'threads.thread',
    //     model: 'Thread',
    //     select: ['head', 'name', 'uid'],
    //     populate: {
    //       path: 'head',
    //       model: 'Message',
    //       select: [
    //         'owner',
    //         'message',
    //         'uid',
    //         'seen',
    //         'fatime',
    //         'fadate',
    //         'fadatetime'
    //       ],
    //       populate: [
    //         {
    //           path: 'owner',
    //           model: 'User',
    //           select: ['alias', 'uniqueId']
    //         }, {
    //           path: 'seen.user',
    //           model: 'User',
    //           select: ['alias', 'uniqueId']
    //         }
    //       ]
    //     }
    //   }
    // )

    let threads_id = []
    for (const item of user_threads.threads) {
      threads_id.push(
        item.thread._id
      )
    }

    all_threads = await ThreadModel.find(
      {
        _id: threads_id
      }
    )
      .populate(
        {
          path: 'head',
          model: 'Message',
          select: [
            'owner',
            'message',
            'uid',
            'seen',
            'fatime',
            'fadate',
            'fadatetime',
            'created'
          ],
          populate: [
            {
              path: 'owner',
              model: 'User',
              select: ['alias', 'uniqueId']
            }, {
              path: 'seen.user',
              model: 'User',
              select: ['alias', 'uniqueId']
            }
          ]
        }
      )
      .sort(
        {
          modified: -1
        }
      )

    let results = []
    for (const thr of all_threads) {
      const head = thr.head

      let target_unqiueId = ''
      let thread_name = head.owner.alias
      if (thr.name === 'welcome message') {
        thread_name = 'پیام‌های ذخیره‌شده'
      } else if (thr.name !== undefined) {
        thread_name = thr.name
      }
      else if (head.owner.uniqueId == req.user.uniqueId) {
        const a_user = await UserModel.findOne(
          {
            uniqueId: { $ne: req.user.uniqueId },
            'threads.thread': { $in: thr }
          }
        )
        thread_name = a_user?.alias
        target_unqiueId = a_user?.uniqueId
      }

      let status = ''
      if (thread_name == 'پیام‌های ذخیره‌شده') {
        if (head.seen.length > 0) {
          status = 'SEEN'
        } else {
          status = 'RECV'
        }
      } else {
        if (req.user.uniqueId === head.owner.uniqueId) {
          status = 'SENT'
          for (const item of head.seen) {
            if (item.user.uniqueId === target_unqiueId) {
              status = 'SEEN'
            }
          }
        } else {
          status = 'RECV'
          for (const item of head.seen) {
            if (item.user.uniqueId === req.user.uniqueId) {
              status = ''
            }
          }
        }
      }

      const modified = thr.modified.toLocaleString(
        'fa-IR', { timeZone: 'Asia/Tehran', hour12: false }
      )

      let thr_datetime = thr.fadatetime
      if (datetime(modified)?.typ == 'h' ||
        datetime(modified)?.typ == 'm' ||
        datetime(modified)?.typ == 's') {
        thr_datetime = thr.fatime
      } else if (datetime(modified)?.typ == 'd') {
        if (datetime(modified)?.val == 1) {
          thr_datetime = 'دیروز'
        } else if ((datetime(modified)?.val < 7)) {
          const _time_split = thr.fatime.split(':')
          const day_name = thr.fadatetime.split('،')[0]
          thr_datetime = day_name + '، ' + `${_time_split[0]}:${_time_split[1]}`
        }
      } else if (datetime(modified)?.typ == 'm') {
        if (datetime(modified)?.val < 12) {
          const _date_split = (thr.fadatetime.split('، ')[1]).split(' ')
          thr_datetime = `${_date_split[1]} ${_date_split[2]}`
        }
      } else {
        thr_datetime = thr.fadate
      }

      results.push(
        {
          name: thread_name,
          message: head.message,
          uid: thr.uid,
          fatime: head.fatime,
          fadate: head.fadate,
          fadatetime: thr_datetime,
          status: status,
          contact: undefined,
        }
      )
    }

    res.status(200).send(results)
  } catch (e) {
    console.log(e)
    res.status(400).send(e.toString())
  }
})

router.get("/continues/:id", auth, async (req, res) => {
  try {
    const thread_uid = req.params.id
    const message_uid = req.query.id

    const this_message = await MessageModel.findOne(
      {
        uid: message_uid
      }
    )
      .select(['created', 'thread'])
      .populate(
        {
          path: 'thread',
          model: 'Thread'
        }
      )

    const thread = this_message['thread']
    const a_user = await UserModel.findOne(
      {
        uniqueId: { $ne: req.user.uniqueId },
        'threads.thread': { $in: thread }
      }
    )
    const thread_name = a_user?.alias
    const target_unqiueId = a_user?.uniqueId

    const messages = await MessageModel.find(
      {
        thread: thread,
        created: { $gt: this_message['created'] }
      }
    )
      .sort({
        created: -1,
      })
      .populate(
        {
          path: 'owner',
          model: 'User',
        }
      )
      .populate(
        {
          path: 'seen.user',
          model: 'User'
        }
      )

    messages.reverse()

    let results = []
    for (let item of messages) {
      let message = await MessageModel.findOneAndUpdate(
        {
          uid: item.uid,
          'seen.user': { $nin: req.user }
        },
        {
          // $push: {
          //   seen: {
          //     user: req.user
          //   }
          // }
        }, { new: true }
      )
        .populate(
          {
            path: 'seen.user',
            model: 'User'
          }
        )
        .populate(
          {
            path: 'owner',
            model: 'User'
          }
        )

      if (!message) {
        message = item
      }

      let status = ''
      if (thread.name == 'welcome message') {
        if (message.seen.length > 0) {
          status = 'SEEN'
        } else {
          status = 'RECV'
        }
      } else {
        if (req.user.uniqueId === message.owner.uniqueId) {
          status = 'SENT'
          for (const item of message.seen) {
            if (item.user.uniqueId === target_unqiueId) {
              status = 'SEEN'
            }
          }
        } else {
          status = 'RECV'
          for (const item of message.seen) {
            if (item.user.uniqueId === req.user.uniqueId) {
              status = ''
            }
          }
        }
      }

      results.push(
        {
          name: thread_name,
          message: message['message'],
          hasAttachments: message['attachments'].length > 0,
          date: message['fadate'],
          time: message['fatime'],
          datetime: message['fadatetime'],
          uid: message['uid'],
          sender: (req.user.uniqueId === message.owner.uniqueId) && !message.sent_by_server,
          status: status,
        }
      )
    }

    res.status(200).send(results)
  } catch (e) {
    res.status(400).send(e.tostring())
  }
})

router.get("/thread/:id", auth, async (req, res) => {
  try {
    const { page } = req.query
    const limit = 20

    const thread_uid = req.params.id
    let results = []

    const thread = await ThreadModel.findOne(
      {
        uid: thread_uid
      }
    )

    const a_user = await UserModel.findOne(
      {
        uniqueId: { $ne: req.user.uniqueId },
        'threads.thread': { $in: thread }
      }
    )
    const thread_name = a_user?.alias
    const target_unqiueId = a_user?.uniqueId

    const messages = await MessageModel.find(
      {
        thread: thread
      }
    )
      .sort({
        created: -1,
      })
      .skip(limit * page)
      .limit(limit)
      .populate(
        {
          path: 'owner',
          model: 'User',
        }
      )
      .populate(
        {
          path: 'seen.user',
          model: 'User'
        }
      )

    messages.reverse()

    // let thread_name = thread.owner.alias
    // if (thr.name === 'welcome message') {
    //   thread_name = 'پیام‌های ذخیره‌شده'
    // } else if (thr.name !== undefined) {
    //   thread_name = thr.name
    // }
    // else if (head.owner.uniqueId == req.user.uniqueId) {
    //   const a_user = await UserModel.findOne(
    //     {
    //       uniqueId: { $ne: req.user.uniqueId },
    //       'threads.thread': { $in: thr }
    //     }
    //   )
    //   thread_name = a_user?.alias
    //   target_unqiueId = a_user?.uniqueId
    // }

    for (let item of messages) {
      let message = await MessageModel.findOneAndUpdate(
        {
          uid: item.uid,
          'seen.user': { $nin: req.user }
        },
        {
          $push: {
            seen: {
              user: req.user
            }
          }
        }, { new: true }
      )
        .populate(
          {
            path: 'seen.user',
            model: 'User'
          }
        )
        .populate(
          {
            path: 'owner',
            model: 'User'
          }
        )

      if (!message) {
        message = item
      }

      let status = ''
      if (thread.name == 'welcome message') {
        if (message.seen.length > 0) {
          status = 'SEEN'
        } else {
          status = 'RECV'
        }
      } else {
        if (req.user.uniqueId === message.owner.uniqueId) {
          status = 'SENT'
          for (const item of message.seen) {
            if (item.user.uniqueId === target_unqiueId) {
              status = 'SEEN'
            }
          }
        } else {
          status = 'RECV'
          for (const item of message.seen) {
            if (item.user.uniqueId === req.user.uniqueId) {
              status = ''
            }
          }
        }
      }

      results.push(
        {
          name: thread_name,
          message: message['message'],
          hasAttachments: message['attachments'].length > 0,
          date: message['fadate'],
          time: message['fatime'],
          datetime: message['fadatetime'],
          uid: message['uid'],
          sender: (req.user.uniqueId === message.owner.uniqueId) && !message.sent_by_server,
          status: status,
        }
      )

      // item.seen = item.seen.concat({ user: req.user })
      // await item.save()
    }

    res.status(200).send(results)
  } catch (e) {
    console.log(e)
    res.status(400).send(e.toString())
  }
})

router.get("/contact/:id", auth, async (req, res) => {
  try {
    const contact_uid = req.params.id

    const user1 = req.user
    const user2 = await UserModel.findOne(
      {
        uniqueId: contact_uid
      }
    )

    const comm = await UserModel.aggregate([
      { $match: { _id: { $in: [user1._id, user2._id] } } },
      { $group: { _id: 0, thread1: { $first: "$threads" }, thread2: { $last: "$threads" } } },
      { $project: { commonThreads: { $setIntersection: ["$thread1", "$thread2"] }, _id: 0 } }
    ])

    let the_common_thread = undefined
    for (const thr of comm) {
      const comm_threads = thr.commonThreads
      for (const item of comm_threads) {
        the_common_thread = item.thread
      }
    }

    let results = []
    if (the_common_thread) {
      const thread = await ThreadModel.findById(
        the_common_thread
      )

      const messages = await MessageModel.find(
        {
          thread: thread
        }
      )
        .sort({
          created: 1,
        })
        .populate(
          {
            path: 'owner',
            model: 'User',
          }
        )

      for (let item of messages) {
        let message = await MessageModel.findOneAndUpdate(
          {
            uid: item.uid,
            'seen.user': { $nin: req.user }
          },
          {
            $push: {
              seen: {
                user: req.user
              }
            }
          }, { new: true }
        )
          .populate(
            {
              path: 'seen.user',
              model: 'User'
            }
          )
          .populate(
            {
              path: 'owner',
              model: 'User'
            }
          )

        if (!message) {
          message = item
        }

        let status = ''
        if (message.seen.length == 0) {
          if (message.owner.uniqueId == req.user.uniqueId) {
            if (thread.name === 'welcome message') {
              status = 'RECV'
            } else {
              status = 'SENT'
            }
          } else {
            status = 'RECV'
          }
        } else {
          if ((message.owner.uniqueId == req.user.uniqueId) && message) {
            if (thread.name === 'welcome message') {
              status = 'SEEN'
            } else {
              status = 'SENT'
            }
          } else if (message) {
            status = 'SEEN'
          }
        }

        results.push(
          {
            message: message['message'],
            hasAttachments: message['attachments'].length > 0,
            date: message['fadate'],
            time: message['fatime'],
            datetime: message['fadatetime'],
            uid: message['uid'],
            sender: (req.user.uid === message.owner.uid) && !message.sent_by_server,
            status: status,
          }
        )

        // item.seen = item.seen.concat({ user: req.user })
        // await item.save()
      }
    }

    res.status(200).send(results)
  } catch (e) {
    console.log(e)
    res.status(400).send(e.toString())
  }
})

router.post("/thread/message/reply/:id", auth, upload.any(), async (req, res) => {
  try {
    const uid = req.params.id

    if (uid == undefined) {
      throw new Error('Thread unique ID not found!')
    }

    const thread = await ThreadModel.findOne(
      {
        uid: uid
      }
    )

    let documents = null
    try {
      documents = JSON.parse(req.body['documents'])
    } catch (e) {
      documents = req.body['documents']
    }

    if (documents == null) {
      throw new Error('Body part can not be null!')
    }

    message = documents['message']
    new_uid = uuid.v1()

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

    allpath = []
    if ('files' in req) {
      if (req.files.length != 0) {
        const dir = `src/api/uploads/messages/${new_uid}`
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir)
        }

        var files = req.files
        files.forEach(element => {
          let fullpath = path.join(dir, `${Date.now().toString()}-${(element.originalname).replace(/\s/g, '_')}`)
          allpath = [...allpath, fullpath]
          fs.writeFile(fullpath, element.buffer, function (err) {
            if (err) {
              logger.error(`${err.message}  ${err.stack}`)
              throw new Error(err.message)
            }
            logger.info('attachments saved successfully')
          })
        })
      }
    }

    if (message == '') {
      message = 'آپلود فایل'
    }

    new_message = MessageModel(
      {
        owner: req.user,
        message: message,
        thread: thread,
        attachments: allpath,
        uid: new_uid,
        fatime: now_time[1],
        fadate: now_time[0],
        fadatetime: fa_datetime,
      }
    )

    await new_message.save()

    await ThreadModel.findOneAndUpdate(
      {
        _id: thread._id
      },
      {
        head: new_message,
        fatime: now_time[1],
        fadate: now_time[0],
        fadatetime: fa_datetime,
        modified: Date.now(),
      }
    )
    // thread.head = new_message
    // await thread.save()

    res.status(200).json({
      uid: uid
    })
  } catch (e) {
    console.log(e)
    res.status(400).send(e.toString())
  }
})

router.post("/thread/contact/reply/:id", auth, upload.any(), async (req, res) => {
  try {
    const uid = req.params.id

    if (uid == undefined) {
      throw new Error('Contact unique ID not found!')
    }

    const contact = await UserModel.findOne(
      {
        uniqueId: uid
      }
    )

    // todo: create a new thread and push into both users
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
    let thread = ThreadModel(
      {
        uid: uuid.v1(),
        num_of_messages: 1,
        fatime: now_time[1],
        fadate: now_time[0],
        fadatetime: fa_datetime,
      }
    )

    await UserModel.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      {
        $push: {
          threads: {
            thread: thread
          }
        }
      }
    )

    await UserModel.findOneAndUpdate(
      {
        _id: contact._id,
      },
      {
        $push: {
          threads: {
            thread: thread
          }
        }
      }
    )

    let documents = null
    try {
      documents = JSON.parse(req.body['documents'])
    } catch (e) {
      documents = req.body['documents']
    }

    if (documents == null) {
      throw new Error('Body part can not be null!')
    }

    message = documents['message']
    new_uid = uuid.v1()

    allpath = []
    if ('files' in req) {
      if (req.files.length != 0) {
        const dir = `src/api/uploads/messages/${new_uid}`
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir)
        }

        var files = req.files
        files.forEach(element => {
          let fullpath = path.join(dir, `${Date.now().toString()}-${(element.originalname).replace(/\s/g, '_')}`)
          allpath = [...allpath, fullpath]
          fs.writeFile(fullpath, element.buffer, function (err) {
            if (err) {
              logger.error(`${err.message}  ${err.stack}`)
              throw new Error(err.message)
            }
            logger.info('attachments saved successfully')
          })
        })
      }
    }

    if (message == '') {
      message = 'آپلود فایل'
    }

    new_message = MessageModel(
      {
        owner: req.user,
        message: message,
        thread: thread,
        attachments: allpath,
        uid: new_uid,
        fatime: now_time[1],
        fadate: now_time[0],
        fadatetime: fa_datetime,
      }
    )

    await new_message.save()

    await ThreadModel.findOneAndUpdate(
      {
        _id: thread._id
      },
      {
        head: new_message,
        fatime: now_time[1],
        fadate: now_time[0],
        fadatetime: fa_datetime,
        modified: Date.now(),
      }
    )
    // thread.head = new_message
    // await thread.save()

    res.status(200).json({
      uid: thread.uid
    })
  } catch (e) {
    console.log(e)
    res.status(400).send(e.toString())
  }
})

router.get('/search/:query', auth, async (req, res) => {
  try {

    let results = []
    let contacts = []

    const query = req.params?.query

    if (query.length == 36) {
      contacts = await UserModel.find(
        {
          uniqueId: query
        }
      )
    } else {
      contacts = await UserModel.find(
        {
          uniqueId: { $ne: req.user.uniqueId },
          alias: { $regex: `.*${query}.*` },
        }
      )
        .populate(
          {
            path: 'threads.thread',
            model: 'Thread',
            select: ['head', 'name', 'uid'],
            populate: {
              path: 'head',
              model: 'Message',
              select: [
                'owner',
                'message',
                'uid',
                'seen',
                'fatime',
                'fadate',
                'fadatetime'
              ],
              populate: [
                {
                  path: 'owner',
                  model: 'User',
                  select: ['alias', 'uniqueId']
                }, {
                  path: 'seen.user',
                  model: 'User',
                  select: ['alias', 'uniqueId']
                }
              ]
            }
          }
        )
    }

    for (const cont of contacts) {
      let _has_same_thread = false
      const threads = cont.threads
      for (const thr of threads) {
        const _same_thread = await UserModel.findOne(
          {
            uniqueId: req.user.uniqueId,
            'threads.thread': { $in: thr.thread }
          }
        )

        if (_same_thread) {
          const _the_thread = await ThreadModel.findById(
            thr.thread._id
          )
            .populate(
              {
                path: 'head',
                model: 'Message',
                select: [
                  'owner',
                  'message',
                  'uid',
                  'seen',
                  'fatime',
                  'fadate',
                  'fadatetime'
                ]
              }
            )

          results.push(
            {
              name: cont.alias,
              message: _the_thread.head.message,
              uid: _the_thread.uid,
              fatime: _the_thread.head.fatime,
              fadate: _the_thread.head.fadate,
              fadatetime: _the_thread.head.fadatetime,
              status: '',
              contact: cont.uniqueId,
            }
          )

          _has_same_thread = true
        }
      }
      if (!_has_same_thread) {
        results.push(
          {
            name: cont.alias,
            message: '',
            uid: '',
            fatime: '',
            fadate: '',
            fadatetime: '',
            status: '',
            contact: cont.uniqueId,
          }
        )
      }
    }

    res.status(200).send(results)
  } catch (e) {
    console.log(e)
    res.status(400).send([])
  }
})

router.get('/attachments/:id', auth, async (req, res) => {
  try {
    var id = req.params.id

    const message = await MessageModel.findOne({
      uid: id,
    })

    if (!message) {
      throw new Error('message not found')
    }

    var zp = new admz()
    for (var k = 0; k < message['attachments'].length; k++) {
      zp.addLocalFile(message['attachments'][k])
    }

    const file_after_download = 'downloaded_file.zip'
    const data = zp.toBuffer()

    res.set('Content-Type', 'application/octet-stream')
    res.set('Content-Disposition', `attachment; filename=${file_after_download}`)
    res.set('Content-Length', data.length)
    res.send(data)
  } catch (e) {
    res.status(400).send(e.toString())
  }
})

module.exports = router