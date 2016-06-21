/**
 * @author kishan
 * @type reducer
 * @name accountDetails
 */
import {
	SUBMIT_PROFILE_DETAILS,
	SUBMIT_AUTH_DETAILS,
	LOGOUT_USER
} from '../constants/index.js'

import { clone, merge } from 'lodash';

const INITIAL_STATE = {
	auth:{},
	profile:{},
	isAuthenticated: false
}

export default function (state = INITIAL_STATE , action) {
	let clonedState = clone(state);
	switch (action.type) {
		case SUBMIT_PROFILE_DETAILS:
			return merge(clonedState, { profile: action.payload } )
		case SUBMIT_AUTH_DETAILS:
			return {...state, auth: action.payload, isAuthenticated: true }
		case LOGOUT_USER:
			return {...state, auth: {}, isAuthenticated: false }
		default:
			return state;
	}
}
