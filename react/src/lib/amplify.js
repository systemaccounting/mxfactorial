import { Auth } from 'aws-amplify'

export const currentUserInfo = () => Auth.currentUserInfo()

export const signOut = () => Auth.signOut()

export const signIn = (username, password) => Auth.signIn(username, password)

export const signUp = (credentials, attributes) =>
  Auth.signUp(credentials, attributes)
