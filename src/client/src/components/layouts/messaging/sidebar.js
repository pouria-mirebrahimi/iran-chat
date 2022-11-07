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

  const [threads, setThreads] = useState([])

  const messagingContext = useContext(MessagingContext)

  const {
    message_id,
    contact_id,
    reload,
    setMessageID,
    setContact,
    newReload,
    name,
    setThreadName,
  } = messagingContext

  useEffect(() => {

    setTimeout(() => {
      getThreads()
    }, 300)

    return () => { }
  }, [reload])

  useEffect(() => {
    setInterval(() => {
      const query = searchRef.current?.value
      if (query === undefined || query === '') {
        getThreads()

      }
    }, 5000)
    return () => { }
  }, [])



  const getThreads = () => {
    const auth_token = Cookies.get('auth_token', { path: '' }) ?? ''
    const unique_id = Cookies.get('unique_id', { path: '' }) ?? ''
    if (auth_token != '') {
      axios.get(`/api/threads`, {
        headers: {
          Authorization: `Bearer ${auth_token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          setThreads(response.data)
          // setTimeout(() => {
          //   searchRef.current?.focus()
          // }, 500)
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

  const search = (query) => {
    const auth_token = Cookies.get('auth_token', { path: '' }) ?? ''
    const unique_id = Cookies.get('unique_id', { path: '' }) ?? ''

    if (auth_token != '') {
      axios.get(`/api/threads/search/${query}`, {
        headers: {
          Authorization: `Bearer ${auth_token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          setThreads(response.data)
        })
        .catch(error => {
        })
    } else {
      setTimeout(() => {
        history.replace('/')
      }, 100)
    }
  }

  const gotoMessage = (uid, cid, name) => {
    searchRef.current.value = ''
    setContact(cid)
    setMessageID(uid)
    setThreadName(name)
    newReload()
  }

  const onSearch = (e) => {
    const query = e.target?.value
    if (query.length == 0) {
      getThreads()
    } else {
      search(query)
    }
  }

  return (
    <Fragment>
      {
        <div id="sidebar-panel">
          <div id='menu-bar'>
            <IconContext.Provider value={{ size: 20, className: "menu-icon" }}>
              <RiUserSearchLine />
            </IconContext.Provider>
            <div>
              <input ref={searchRef} id='contact-search-box' name='search'
                onChange={onSearch}
                placeholder='عبارت مستعار، شناسه، کاربر، گروه' />
            </div>
          </div>
          {
            threads.map((item, index) => {
              return <div className={`message-tile ${(item.uid == message_id) && 'active-tile'}`}
                key={index} onClick={(uid, cid, name) => gotoMessage(item.uid, item.contact, item.name)}>
                <div id="avatar">
                  <h4>{item.name.slice(0, 1)}</h4>
                </div>
                <div className='col'>
                  <div className="row">
                    <div><h4>{item.name}</h4></div>
                    <div id='thread-datetime'>{item.fadatetime}</div>
                  </div>
                  <div className="row">
                    <div id="message">{item.message}</div>
                    {
                      (item['status'] == 'RECV') && <IconContext.Provider value={{ size: 8, className: "status-icon" }}>
                        {
                          <RiCheckboxBlankCircleFill />
                        }
                      </IconContext.Provider>
                    }

                    {
                      (item['status'] == 'SENT') && <IconContext.Provider value={{ size: 18, className: "status-icon" }}>
                        {
                          <BsCheck />
                        }
                      </IconContext.Provider>
                    }

                    {
                      (item['status'] == 'SEEN') && <IconContext.Provider value={{ size: 18, className: "status-icon" }}>
                        {
                          <BsCheckAll />
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