import { handleActions } from 'redux-actions';

import { SET_REQUESTS_FILTER } from 'actions/requestActions';

export default handleActions({
  [SET_REQUESTS_FILTER]: (state, action) => (action.payload)
}, 'active');
