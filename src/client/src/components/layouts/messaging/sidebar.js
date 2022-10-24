import React, { useEffect, useState, useRef, Fragment } from 'react'
import { useLocation, useHistory } from 'react-router-dom'


const Sidebar = () => {

  let MSG = class {
    constructor(
      name,
      message,
      date,
      time,
    ) {
      this.name = name
      this.message = message
      this.date = date
      this.time = time
    }
  }

  const messages = [
    new MSG('pouria', 'message', '2022-02-03', '14:20:08'),
    new MSG('zahra', 'message', '2022-02-03', '14:20:08'),
    new MSG('ali', 'message', '2022-02-03', '14:20:08'),
    new MSG('pardis', 'message', '2022-02-03', '14:20:08'),
    new MSG('reza', 'message', '2022-02-03', '14:20:08'),
    new MSG('minoo', 'message', '2022-02-03', '14:20:08'),
  ]

  useEffect(() => {
    // todo: get all sessions - show last message

    return () => { }
  }, [])


  return (
    <Fragment>
      <div id="sidebar-panel">
        {
          messages.map((item, index) => {
            return <div key={index}>{item.name}</div>
          })
        }
      </div>
    </Fragment>
  )
}

export default Sidebar