import React, { useState, useEffect, useRef, useContext } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import ScaleLoader from 'react-spinners/ScaleLoader'

import MessagingContext from '../../../context/messaging/context'

const MSGContainer = () => {

  const messagingContext = useContext(MessagingContext)

  const {
    id,
    setMessageID,
  } = messagingContext

  const [loading, setloading] = useState(true)

  useEffect(() => {
    return () => { }
  }, [])


  if (loading)
    return (
      <div className="main-loading">
        <ScaleLoader color={'#DD5353'} loading={true} height={48} width={5} radius={4} margin={3} />
        <h4>در حال دریافت پیام‌ها...</h4>
        <p>{id}</p>
      </div>
    )
  else
    return (
      <div className="window msg-container">
        <div id="no-message">
          <h4></h4>
        </div>
      </div>
    )
}

export default MSGContainer
