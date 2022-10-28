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
          setMessages(response.data)
        })
        .catch(error => {
          setTimeout(() => {
            history.replace('/')
          }, 100)
        })
    }
  }

  const gotoMessage = (id) => {
    setMessageID(id)
  }

  return (
    <Fragment>
      {
        messages.length > 0 && <div id="sidebar-panel">
          {
            messages.map((item, index) => {
              return <div className="message-tile"
                key={index} onClick={(id) => gotoMessage(item.uid)}>
                <div id="avatar">
                  <h4>{item.name.slice(0, 1)}</h4>
                </div>
                <div className='col'>
                  <div className="row">
                    <div><h4>{item.name}</h4></div>
                    <div>{item.time}</div>
                  </div>
                  <div className="row">
                    <div>{item.message}</div>
                    <IconContext.Provider value={{ size: 8, className: "status-icon" }}>
                      {
                        item['status'] == 'READ' && <BsCheckAll /> ||
                        item['status'] == 'SENT' && <BsCheck /> ||
                        item['status'] == 'RECV' && <RiCheckboxBlankCircleFill />
                      }
                    </IconContext.Provider>
                  </div>
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