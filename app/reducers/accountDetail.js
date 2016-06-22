/**
 * @author kishan
 * @type reducer
 * @name accountDetails
 */
import merge from 'lodash/merge';

import { SUBMIT_PROFILE_DETAILS, SUBMIT_AUTH_DETAILS } from 'actions/signUpActions';

export const INITIAL_STATE = {
  account: {
    auth: {},
    profile: {}
  }
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case SUBMIT_PROFILE_DETAILS:
      return merge({}, state, { account: { profile: action.payload } });
    case SUBMIT_AUTH_DETAILS:
      return merge({}, state, { account: { auth: action.payload } });
    default:
      return state;
  }
}
