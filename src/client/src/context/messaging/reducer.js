import { SET_MESSAGE_ID, SET_CONTACT_ID } from './types';

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
    default:
      return state
  }
}