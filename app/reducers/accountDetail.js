/**
 * @author kishan
 * @type reducer
 * @name accountDetails
 */
import {SUBMIT_PROFILE_DETAILS,SUBMIT_AUTH_DETAILS} from '../constants/index.js'
const INITIAL_STATE = {
    account:{
        auth:{},
        profile:{}
    }
}
import _ from 'lodash'

export default function (state = INITIAL_STATE , action) {
    let cloned;
    switch (action.type) {
        case SUBMIT_PROFILE_DETAILS:
            cloned = _.clone(state)
            return _.merge(cloned,{account:{profile:action.payload}})
        case SUBMIT_AUTH_DETAILS:
            cloned = _.clone(state)
            return _.merge(cloned,{account:{auth:action.payload}})
        default:
            return state;
    }
}
