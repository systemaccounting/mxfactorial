import { handleActions } from 'redux-actions';
import cookie from 'react-cookie';

import { LOGIN, RECEIVED_TOKEN } from 'actions/authActions';
import { generateAsyncTypes } from 'actions/async';

const { success } = generateAsyncTypes(LOGIN);

export default handleActions({
  [success]: (state, action) => {
    cookie.save('token', action.payload.token);
    return action.payload.token;
  },
  [RECEIVED_TOKEN]: (state, action) => {
    return action.payload;
  }
}, '');
