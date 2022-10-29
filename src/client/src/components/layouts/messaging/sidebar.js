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
  RiCheckboxBlankCircleFill,
  RiUserSearchLine,
} from 'react-icons/ri'

import {
  FiMenu
} from 'react-icons/fi'

import { IconContext } from 'react-icons/lib'

import MessagingContext from '../../../context/messaging/context'

const Sidebar = () => {

  const searchRef = useRef('')

  const history = useHistory()

  const [messages, setMessages] = useState([])

  const messagingContext = useContext(MessagingContext)

  const {
    id,
    setMessageID,
  } = messagingContext

  useEffect(() => {
    // todo: get all sessions - show last message
    setTimeout(() => {
      getMessages()
    }, 100)

    return () => { }
  }, [id])


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
          setTimeout(() => {
            searchRef.current?.focus()
          }, 500)
        })
        .catch(error => {
          setTimeout(() => {
            history.replace('/')
          }, 100)
        })
    } else {
      setTimeout(() => {
        history.replace('/')
      }, 100)
    }
  }

  const gotoMessage = (id) => {
    setMessageID(id)
  }

  return (
    <Fragment>
      {
        messages.length > 0 && <div id="sidebar-panel">
          <div id='menu-bar'>
            <IconContext.Provider value={{ size: 20, className: "menu-icon" }}>
              <RiUserSearchLine />
            </IconContext.Provider>
            <div>
              <input ref={searchRef} id='contact-search-box' name='search'
                placeholder='عبارت مستعار، شناسه، کاربر، گروه' />
            </div>
          </div>
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
                    {
                      (!item['sender'] && item['status'] == 'RECV') && <IconContext.Provider value={{ size: 8, className: "status-icon" }}>
                        {
                          <RiCheckboxBlankCircleFill />
                        }
                      </IconContext.Provider>
                    }

                    {
                      (item['sender'] && item['status'] == 'SEEN') && <IconContext.Provider value={{ size: 18, className: "status-icon" }}>
                        {
                          <BsCheckAll />
                        }
                      </IconContext.Provider>
                    }

                    {
                      (!item['sender'] && item['status'] == 'SENT') && <IconContext.Provider value={{ size: 18, className: "status-icon" }}>
                        {
                          <BsCheck />
                        }
                      </IconContext.Provider>
                    }

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