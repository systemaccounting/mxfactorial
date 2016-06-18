/**
 * @author kishan
 */

import { combineReducers } from 'redux';
import {reducer as formReducer} from 'redux-form'
import accountDetails from './accountDetail'
import transaction_item from './transaction_item'

const rootReducer = combineReducers({
    form: formReducer,
    accountDetails,
    transaction_item
});

export default rootReducer;
