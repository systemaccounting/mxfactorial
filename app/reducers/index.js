/**
 * @author kishan
 */

import { combineReducers } from 'redux';
import {reducer as formReducer} from 'redux-form'
import accountDetails from './accountDetail'
const rootReducer = combineReducers({
    form: formReducer,
    accountDetails
});

export default rootReducer;
