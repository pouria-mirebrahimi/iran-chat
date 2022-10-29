import React, { useReducer } from 'react'
import MessagingContext from './context'
import MessagingReducer from './reducer'
import { SET_MESSAGE_ID } from './types'

const MessagingState = props => {
  const initialState = {
    id: undefined
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

  return (
    <MessagingContext.Provider
      value={{
        id: state.id,
        setMessageID,
      }}
    >
      {props.children}
    </MessagingContext.Provider>
  )
}

export default MessagingState