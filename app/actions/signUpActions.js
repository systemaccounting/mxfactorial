import {
  SUBMIT_PROFILE_DETAILS,
  SUBMIT_AUTH_DETAILS,
  CREATE_ACCOUNT,
  BASE_URL,
  LOGOUT_USER
} from '../constants/index';

import { saveItem } from '../storage/localStore';

import 'whatwg-fetch';

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

export function logOutUser() {
  localStorage.removeItem('mxUser')
  return {
    type: LOGOUT_USER,
  }
}

export function getAuthDetails(router, username, password) {

  return (dispatch, getState) => {
    return fetch(`${BASE_URL}/users/authenticate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password
        })
      })
      .then(response => response.json())
      .then((data) => {
        if (data.user) {
          saveItem('mxUser', data);
          dispatch(submitAuthDetails(data));
          router.push("/home");
        } else {
          alert("Unable to login user")
        }
      })
      .catch((error) => {
        alert("Unable to login user")
      })
  }
}

export function createAccount(props) {
  return {
    type: CREATE_ACCOUNT,
    payload:''
  }
}
