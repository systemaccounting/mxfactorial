import { handleActions } from 'redux-actions';

import { LOGIN } from 'actions/authActions';
import { generateAsyncTypes } from 'actions/async';

const { success } = generateAsyncTypes(LOGIN);

export default handleActions({
  [success]: (state, action) => (action.payload.user)
}, {});
