import React, { useEffect, useState, useRef, Fragment } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import {
  BsCheckAll
} from 'react-icons/bs'

import { IconContext } from 'react-icons/lib'


const Sidebar = () => {

  const [messages, setMessages] = useState(
    [
      {
        name: 'اسم من پوریاست',
        message: 'سلام، خوبید؟',
        date: 'دیروز',
        time: '۱۲:۵۴:۰۹',
        status: 'READ',
      },
      {
        name: 'زهرا دانایی‌فر',
        message: 'سلام، خوبید؟',
        date: 'امروز',
        time: '۰۲:۲۳:۳۲',
        status: 'SENT'
      }
    ]
  )

  useEffect(() => {
    // todo: get all sessions - show last message

    return () => { }
  }, [])


  return (
    <Fragment>
      <div id="sidebar-panel">
        {
          messages.map((item, index) => {
            return <div className="message-tile" key={index}>
              <div id="right-col">
                <div id="avatar"></div>
                <div id="message">
                  <div><h4>{item.name}</h4></div>
                  <div>{item.message}</div>
                </div>
              </div>
              <div id="state">
                <div>{item.date}</div>

                <IconContext.Provider value={{ size: 18, className: "status-icon" }}>
                  <BsCheckAll />
                </IconContext.Provider>

              </div>
            </div>
          })
        }
      </div>
    </Fragment>
  )
}

export default Sidebar