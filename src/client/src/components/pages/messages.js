import React, { useState, useRef, useEffect } from 'react'
import { useHistory, useLocation, generatePath } from 'react-router-dom'
import ScaleLoader from 'react-spinners/ScaleLoader'

import Sidebar from '../layouts/messaging/sidebar'
import MSGContainer from '../layouts/messaging/msgcontainer'

const Messages = () => {
  return (
    <div id="message-window">
      <Sidebar />
      <MSGContainer />
    </div>
  )
}

export default Messages
