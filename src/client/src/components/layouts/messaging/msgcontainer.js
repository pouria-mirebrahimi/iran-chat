import React, { useState, useEffect, useRef, useContext } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import ScaleLoader from 'react-spinners/ScaleLoader'
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

const MSGContainer = () => {

  const messagingContext = useContext(MessagingContext)

  const {
    id,
    setMessageID,
  } = messagingContext

  const [loading, setloading] = useState(true)
  const [messages, setmessages] = useState([])

  useEffect(() => {
    if (id != undefined) {
      fetchMessages(id)
    } else {
      setTimeout(() => {
        setloading(false)
      }, 1000)
    }
    return () => { }
  }, [id])

  const fetchMessages = (_id) => {
    const auth_token = Cookies.get('auth_token', { path: '' }) ?? ''
    const unique_id = Cookies.get('unique_id', { path: '' }) ?? ''

    if (auth_token != '') {
      axios.get(`/api/messages/${_id}`, {
        headers: {
          Authorization: `Bearer ${auth_token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (response.status === 200) {
            setmessages(response.data)
          }
        })
        .catch(error => {
          console.log(error.response.data)
        })
    }
  }


  if (loading)
    return (
      <div className="main-loading">
        <ScaleLoader color={'#DD5353'} loading={true} height={48} width={5} radius={4} margin={3} />
        <h4>در حال دریافت پیام‌ها...</h4>
      </div>
    )
  else if (id == undefined)
    return (
      <div className="window msg-container">
        <div id="no-message">
          <h4>هیچ پیامی انتخاب نشده است!</h4>
        </div>
      </div>
    )
  else
    return (
      <div className="msg-container">
        <div id="messages-panel">
          {
            messages.map((item, index) => {
              return <div className={`message-box ${item.sender && 'sender'}`
              }>
                <div className='col'>
                  {item.message}
                  <div className='row'>
                    <div className='datetime'>
                      <div>{item.datetime}</div>
                      <div>{item.time}</div>
                    </div>
                    <IconContext.Provider value={{ size: 8, className: "status-icon" }}>
                      {
                        item['status'] == 'READ' && <BsCheckAll /> ||
                        item['status'] == 'SENT' && <BsCheck />
                      }
                    </IconContext.Provider>
                  </div>
                </div>
              </div>
            })
          }
        </div>
      </div >
    )
}

export default MSGContainer
