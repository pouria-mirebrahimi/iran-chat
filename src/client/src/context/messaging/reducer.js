import { SET_MESSAGE_ID } from './types';

export default (state, action) => {
  switch (action.type) {
    case SET_MESSAGE_ID:
      return {
        ...state,
        id: action.payload.id,
      }
    default:
      return state
  }
}