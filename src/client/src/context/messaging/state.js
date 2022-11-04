import React, { useReducer } from 'react'
import MessagingContext from './context'
import MessagingReducer from './reducer'
import { SET_MESSAGE_ID, SET_CONTACT_ID, RELOAD_DATA, THREAD_NAME } from './types'

const MessagingState = props => {
  const initialState = {
    message_id: undefined, // this is the message ID
    contact_id: undefined, // this is the contact ID
    reload: undefined,
    name: '',
  }

  const [state, dispatch] = useReducer(MessagingReducer, initialState);

  // set message ID
  const setMessageID = (id) => {
    dispatch({
      type: SET_MESSAGE_ID,
      payload: {
        id,
      },
    })
  }

  // set message ID
  const setContact = (id) => {
    dispatch({
      type: SET_CONTACT_ID,
      payload: {
        id,
      },
    })
  }

  // reload data
  const newReload = () => {
    dispatch({
      type: RELOAD_DATA,
      payload: {
        rnd: Math.random(),
      },
    })
  }

  // set thread name
  const setThreadName = (name) => {
    dispatch({
      type: THREAD_NAME,
      payload: {
        name: name,
      },
    })
  }

  return (
    <MessagingContext.Provider
      value={{
        message_id: state.message_id,
        contact_id: state.contact_id,
        reload: state.reload,
        name: state.name,
        setThreadName,
        newReload,
        setMessageID,
        setContact,
      }}
    >
      {props.children}
    </MessagingContext.Provider>
  )
}

export default MessagingState