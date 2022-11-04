import { SET_MESSAGE_ID, SET_CONTACT_ID, RELOAD_DATA, THREAD_NAME } from './types';

export default (state, action) => {
  switch (action.type) {
    case SET_MESSAGE_ID:
      return {
        ...state,
        message_id: action.payload.id,
      }
    case SET_CONTACT_ID:
      return {
        ...state,
        contact_id: action.payload.id,
      }
    case RELOAD_DATA:
      return {
        ...state,
        reload: action.payload.rnd,
      }
    case THREAD_NAME:
      return {
        ...state,
        name: action.payload.name,
      }
    default:
      return state
  }
}