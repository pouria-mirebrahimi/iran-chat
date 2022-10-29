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

// routers
const router = new express.Router()

// create a user
router.post("/sign/in", async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await UserModel.findByCredentials(
      username,
      password,
    )

    let payload = {}
    let state = 200

    if (!user) {
      const uniqueID = uuid.v1()
      const user = new UserModel(
        {
          username: username,
          password: password,
          uniqueId: uniqueID,
        }
      )

      const token = await user.generateAuthToken()

      const hash = jwt.sign(
        {
          app: 'iran.chat'
        }, config.get("JsonWebToken.jwt-secret"),
        {
          expiresIn: '1m'
        }
      )

      payload = {
        auth_token: token,
        unique_id: uniqueID,
        showingname: true,
        hash: hash,
      }

      await user.save()

      state = 201

    } else {
      const token = await user.generateAuthToken()

      await user.save()

      let showing_name = false
      let hash = ''

      if ('alias' in user) {
        if (user['alias'] == undefined) {

          showing_name = true

          hash = jwt.sign(
            {
              app: 'iran.chat'
            }, config.get("JsonWebToken.jwt-secret"),
            {
              expiresIn: '1m'
            }
          )
        }
      }

      payload = {
        auth_token: token,
        unique_id: user['uniqueId'],
        showingname: showing_name,
        hash: hash,
      }
    }

    res.status(state).json(
      payload
    )
  } catch (err) {
    logger.error(err.message)
    res.status(400).json(
      {
        err: err.message
      }
    )
  }
})

router.post('/upload', auth, upload.any(), async (req, res) => {

  try {
    // body part
    documents = JSON.parse(req.body['documents'])
    title = documents['title']
    service = documents['service']
    message = documents['message']

    ticket_uid = uuid.v1()

    // form part
    var files = req.files
    files.forEach(element => {
      let fullpath = path.join('src/api/uploads/tickets', element.originalname)
      fs.writeFile(fullpath, element.buffer, function (err) {
        if (err) {
          logger.error(`${err.message}  ${err.stack}`)
          throw new Error(err.message)
        }
        logger.info('attachments saved successfully')
      })
    })

    res.status(200).send('Ticket saved successfully')
  } catch (e) {
    res.status(400).send(e)
  }
})

router.get("/active", auth, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("The user is not signed")
    }

    let hash = ''
    if (!('alias' in req.user)) {
      hash = jwt.sign(
        {
          app: 'iran.chat'
        }, config.get("JsonWebToken.jwt-secret"),
        {
          expiresIn: '1m'
        }
      )
    }

    res.status(200).json(
      {
        firstname: req.user['firstname'],
        lastname: req.user['lastname'],
        mobile: req.user['mobile'],
        email: req.user['email'],
        userId: req.user['uniqueId'],
        level: req.user['level'],
        verified: req.user['account_verified'],
        alias: req.user['alias'] ?? '',
        hash: hash,
      }
    )
  } catch (err) {
    logger.error(err.message)
    res.status(400).json(
      {
        err: err.message
      }
    )
  }
})

router.post("/login/info", auth, async (req, res) => {

  infomdl = new LoginInfoModel(
    {
      ...req.body,
      owner: req.user,
    }
  )

  login_datetime = infomdl['created'].toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })
  login_datetime = login_datetime.replace('،', '')
  login_datetime = login_datetime.replace('\u200f', '')

  await infomdl.save()

  res.status(200).json({
    datetime: login_datetime,
  })
})

router.get("/hash/:hash", async (req, res) => {
  try {
    const hash = req.params.hash
    const decoded = jwt.verify(hash, config.get('JsonWebToken.jwt-secret'));
    res.status(200).send()
  } catch (err) {
    logger.error(err.message)
    res.status(400).json(
      {
        err: err.message
      }
    )
  }
})

router.post("/sign/out", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })

    await req.user.save()
    res.status(200).send()
  } catch (err) {
    res.status(500).send()
  }
})

router.put('/', auth, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("The user is not signed")
    }

    // here are valid keys that can be modified by user
    valid_keys = ['firstname', 'lastname', 'alias']

    let body = req.body
    for (let item of Object.keys(body)) {
      if (valid_keys.includes(item)) {
        if (body[item] != '') {
          req.user[item] = body[item]
        }
      }
    }

    await req.user.save()

    if (req.user['alias']) {  // this means alias is accepted
      await UserModel.findOneAndUpdate({
        _id: req.user['_id'],
      }, {
        account_verified: true // update the verfication field
      })
    }

    res.status(200).json({
      msg: 'The user profile updated'
    })
  } catch (err) {
    logger.error(err.message)
    res.status(400).json(
      {
        err: err.message
      }
    )
  }
})

router.put('/identification', auth, upload.any(), async (req, res) => {

  try {

    const user = await UserModel.findOne(
      {
        _id: req.user['_id'],
        account_verified: false,
      }
    )

    if (!user) {
      throw new Error('somethings went wrong!')
    }

    let documents = null
    try {
      documents = JSON.parse(req.body['documents'])
    } catch (e) {
      documents = req.body['documents']
    }

    if (documents == null) {
      throw new Error('body part can not be null')
    }

    firstname = documents['firstname']
    lastname = documents['lastname']
    nationalID = documents['nationalID']
    email = documents['email']
    title = documents['title']
    company = documents['company']
    website = documents['website']
    field = documents['field']
    address = documents['address']
    phone = documents['phone']
    wemail = documents['wemail']

    // today = new jDate
    // let now = new Date().toLocaleString('fa-IR', {
    //   timeZone: 'Asia/Tehran'
    // })
    // now_time = now.replace('،', '')
    // now_time = now_time.replace('\u200f', '').split(' ')
    // const fa_datetime = persian_tools.digitsEnToFa(
    //   today.format(
    //     'dddd، D MMMM YYYY'
    //   )
    // )

    allpath = []
    if ('files' in req) {
      if (req.files.length != 0) {
        const dir = `src/api/uploads/identification/${req.user['_id']}`
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir)
        }

        var files = req.files
        files.forEach(element => {
          let fullpath = path.join(dir, `${Date.now().toString()}-${(element.originalname).replace(/\s/g, '')}`)
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

    const the_user = await UserModel.findOneAndUpdate(
      {
        _id: req.user['_id']
      },
      {
        firstname: firstname,
        lastname: lastname,
        national_id: nationalID,
        agent_title: title,
        company: company,
        website: website,
        company_details: field,
        company_address: address,
        identification: allpath,
        account_verified: false,
        modified: Date.now(),
      },
      {
        new: true
      }
    )

    if (the_user['phone'] != phone) {
      await UserModel.findOneAndUpdate(
        {
          _id: req.user['_id']
        },
        {
          phone: phone,
          phone_verified: false
        }
      )
    }

    let email_changed = false,
      work_email_changed = false

    if (the_user['email'] != email) {
      await UserModel.findOneAndUpdate(
        {
          _id: req.user['_id']
        },
        {
          email: email,
          email_verified: false
        }
      )
      email_changed = true
    }

    if (!the_user['email_verified']) {
      email_changed = true
    }

    if (the_user['work_email'] != wemail) {
      await UserModel.findOneAndUpdate(
        {
          _id: req.user['_id']
        },
        {
          work_email: wemail,
          work_email_verified: false
        }
      )

      work_email_changed = true
    }

    if (!the_user['work_email_verified']) {
      work_email_changed = true
    }

    if (email_changed)
      try {
        await sendEmailVerification(the_user, email, 'email')
        const msg_uid = uuid.v1()

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

        const newMessage = MessageModel(
          {
            title: "ارسال لینک تأیید ایمیل شخصی",
            message: `یک ایمیل حاوی لینک تأیید برای شما ارسال شده است. لطفاً بر روی لینک موجود در آن کلیک کنید تا ایمیل شما تأیید گردد.\nتوکن ارسالی به مدت ۲۴ ساعت اعتبار دارد.`,
            sender: "پشتیبانی",
            category: "INFO",
            uid: msg_uid,
            owner: req.user,
            fatime: now_time[1],
            fadate: now_time[0],
            fadatetime: fa_datetime,
          }
        )

        await newMessage.save()
      }
      catch (e) {
        res.status(406).send('your email is not valid')
      }
    if (work_email_changed)
      try {
        await sendEmailVerification(the_user, wemail, 'wemail')

        const msg_uid = uuid.v1()

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

        const newMessage = MessageModel(
          {
            title: "ارسال لینک تأیید ایمیل کاری",
            message: `یک ایمیل حاوی لینک تأیید برای شما ارسال شده است. لطفاً بر روی لینک موجود در آن کلیک کنید تا ایمیل شما تأیید گردد.\nتوکن ارسالی به مدت ۲۴ ساعت اعتبار دارد.`,
            sender: "پشتیبانی",
            category: "INFO",
            uid: msg_uid,
            owner: req.user,
            fatime: now_time[1],
            fadate: now_time[0],
            fadatetime: fa_datetime,
          }
        )

        await newMessage.save()
      } catch (e) {
        res.status(406).send('your work email is not valid')
      }

    const msg_uid = uuid.v1()

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

    const newMessage = MessageModel(
      {
        title: "دریافت اطلاعات هویتی",
        message: "اطلاعات شما با موفقیت دریافت شده است. پس از بررسی نتیجه آن به شما اطلاع داده خواهد شد.",
        sender: "پشتیبانی",
        category: "INFO",
        uid: msg_uid,
        owner: req.user,
        fatime: now_time[1],
        fadate: now_time[0],
        fadatetime: fa_datetime,
      }
    )

    await newMessage.save()

    res.status(200).send('user identification data saved successfully')
  } catch (e) {
    res.status(400).send(e.toString())
  }
})

router.post('/email/verify', async (req, res) => {
  try {
    const { hash } = req.body
    const decoded = jwt.verify(hash, config.get('EmailVerificationToken.jwt-secret'));
    const { uid, email } = decoded

    if (email == 'email') {
      const user = await UserModel.findOneAndUpdate(
        {
          uid: uid
        },
        {
          email_verified: true,
        }
      )
    } else if (email == 'wemail') {
      const user = await UserModel.findOneAndUpdate(
        {
          uid: uid
        },
        {
          work_email_verified: true,
        }
      )
    }

    const user = await UserModel.findOne(
      {
        uid: uid,
      }
    )

    const msg_uid = uuid.v1()

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

    const newMessage = MessageModel(
      {
        title: "تأیید ایمیل",
        message: `ایمیل ${email == 'email' ? 'شخصی' : 'کاری'} شما با موفقیت تأیید شده است.`,
        sender: "پشتیبانی",
        category: "INFO",
        uid: msg_uid,
        owner: user,
        fatime: now_time[1],
        fadate: now_time[0],
        fadatetime: fa_datetime,
      }
    )

    await newMessage.save()

    res.status(200).send('email verified successfully')
  } catch (e) {
    res.status(400).send(e.toString())
  }
})

router.get('/identification', auth, async (req, res) => {
  try {
    const the_user = await UserModel.findById(req.user['_id'])
    if (!the_user) {
      throw new Error('user not found')
    }

    res.status(200).json(
      {
        firstname: the_user['firstname'],
        lastname: the_user['lastname'],
        mobile: the_user['mobile'],
        national_id: the_user['national_id'],
        email: the_user['email'],
        title: the_user['agent_title'],
        company: the_user['company'],
        website: the_user['website'],
        field: the_user['company_details'],
        address: the_user['company_address'],
        phone: the_user['phone'],
        wemail: the_user['work_email'],
        attachments: the_user['identification'],
        account_verified: the_user['account_verified'],
        email_verified: the_user['email_verified'],
        work_email_verified: the_user['work_email_verified'],
      }
    )
  } catch (e) {
    res.status(400).send(e)
  }
})

router.get('/status', auth, async (req, res) => {
  const status = req.user['account_verified']
  const updated = req.user['national_id']

  if (updated == undefined) {
    res.status(200).json({
      level: 0
    })
  } else {
    if (!status) {
      res.status(200).json({
        level: 1
      })
    } else {
      res.status(200).json({
        level: 2
      })
    }
  }
})

module.exports = router