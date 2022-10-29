import React, { useState, useRef, useEffect } from 'react'
import { useHistory, useLocation, generatePath, useParams } from 'react-router-dom'
import ScaleLoader from 'react-spinners/ScaleLoader'

import Sidebar from '../layouts/messaging/sidebar'
import MSGContainer from '../layouts/messaging/msgcontainer'

import MessagingState from '../../context/messaging/state'

const Messages = (props) => {

  useEffect(() => {
    return () => { }
  }, [])


  return (
    <div id="message-window">
      <MessagingState>
        <Sidebar />
        <MSGContainer />
      </MessagingState>
    </div>
  )
}

export default Messages
