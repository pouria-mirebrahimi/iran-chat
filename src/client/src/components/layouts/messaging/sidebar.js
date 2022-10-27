import React, { useEffect, useState, useRef, Fragment, useContext } from 'react'
import { useLocation, useHistory, generatePath } from 'react-router-dom'
import Cookies from 'js-cookie'
import PropTypes from 'prop-types'
import axios from 'axios'

import {
  BsCheck,
  BsCheckAll,
  BsClock,
} from 'react-icons/bs'

import {
  RiCheckboxBlankCircleFill
} from 'react-icons/ri'

import {
  CgRadioChecked
} from 'react-icons/cg'

import { IconContext } from 'react-icons/lib'

import MessagingContext from '../../../context/messaging/context'

const Sidebar = () => {

  const history = useHistory()

  const [messages, setMessages] = useState([])

  const messagingContext = useContext(MessagingContext)

  const {
    id,
    setMessageID,
  } = messagingContext

  useEffect(() => {
    // todo: get all sessions - show last message
    getMessages()

    return () => { }
  }, [])


  const getMessages = () => {
    const auth_token = Cookies.get('auth_token', { path: '' }) ?? ''
    const unique_id = Cookies.get('unique_id', { path: '' }) ?? ''

    if (auth_token != '') {
      axios.get(`/api/messages/all`, {
        headers: {
          Authorization: `Bearer ${auth_token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          console.log(response.data)
          setMessages(response.data)
        })
        .catch(error => {
          // setTimeout(() => {
          //   history.replace('/')
          // }, 100)
        })
    }
  }

  const gotoMessage = (name) => {
    setMessageID('pouria')
  }

  return (
    <Fragment>
      {
        messages.length > 0 && <div id="sidebar-panel">
          {
            messages.map((item, index) => {
              return <div className="message-tile" key={index} onClick={(id) => gotoMessage(item.id)}>
                <div id="right-col">
                  <div id="avatar">
                    <h4>{item.name.slice(0, 1)}</h4>
                  </div>
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
      }
    </Fragment>
  )
}

export default Sidebar