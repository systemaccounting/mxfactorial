import { combineReducers } from 'redux';

import user from './user';
import token from './token';

export default combineReducers({
  user,
  token
});
