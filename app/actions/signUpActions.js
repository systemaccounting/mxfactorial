import {
    SUBMIT_PROFILE_DETAILS,
    SUBMIT_AUTH_DETAILS,
    CREATE_ACCOUNT,
    BASE_URL
} from '../constants/index'
import request from 'superagent'

export function submitProfileDetails (props) {
    return {
        type: SUBMIT_PROFILE_DETAILS,
        payload: props
    }
}
export function submitAuthDetails(props) {
    return {
        type: SUBMIT_AUTH_DETAILS,
        payload: props
    }
}

export function createAccount(props) {

    //  request.post(BASE_URL).send(props).end(function (err,res) {
    //
    // })
    return{
        type:CREATE_ACCOUNT,
        payload:''
    }
}