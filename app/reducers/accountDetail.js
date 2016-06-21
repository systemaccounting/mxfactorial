/**
 * @author kishan
 * @type reducer
 * @name accountDetails
 */
import { SUBMIT_PROFILE_DETAILS, SUBMIT_AUTH_DETAILS } from '../constants/index.js';
const INITIAL_STATE = {
  account: {
    auth: {},
    profile: {}
  }
};
import assign from 'lodash/assign';

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case SUBMIT_PROFILE_DETAILS:
      return assign({}, state, { account: { profile: action.payload } });
    case SUBMIT_AUTH_DETAILS:
      return assign({}, state, { account: { auth: action.payload } });
    default:
      return state;
  }
}
