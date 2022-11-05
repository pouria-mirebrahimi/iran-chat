import React, { useState, useRef, useEffect } from 'react'
import { useHistory, useLocation, generatePath, useParams } from 'react-router-dom'
import ScaleLoader from 'react-spinners/ScaleLoader'

import Sidebar from '../layouts/messaging/sidebar'
import MSGContainer from '../layouts/messaging/msgcontainer'

import MessagingState from '../../context/messaging/state'

const Messages = (props) => {

  const [width, setWidth] = useState(null)
  const [height, setHeight] = useState(null)

  useEffect(() => {
    const {
      innerWidth: width,
      innerHeight: height,
    } = window

    setWidth(width)
    setHeight(height)

    return () => { }
  }, [])


  return (

    <div id="message-window">
      {
        width > 600 &&
        <MessagingState>
          <Sidebar />
          <MSGContainer />
        </MessagingState>
      }
    </div>
  )
}

export default Messages
