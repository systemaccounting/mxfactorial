import Auth from '@aws-amplify/auth' // https://github.com/aws-amplify/amplify-js/issues/3484
import { BehaviorSubject } from 'rxjs'
import { cryptString } from './crypt'

export const singInPerform = new BehaviorSubject(null)

export const currentUserInfo = () => Auth.currentUserInfo()

export const signOut = () =>
  Auth.signOut().then(() => {
    localStorage.removeItem('credential')
    singInPerform.next(null)
  })

export const signIn = ({ account, password }) => {
  return Auth.signIn(account, password).then(async token => {
    if (token) {
      const user = await Auth.currentUserInfo()
      localStorage.setItem('credential', cryptString(password))
      singInPerform.next(user)
    }
  })
}

export const signUp = (credentials, attributes) =>
  Auth.signUp(credentials, attributes)
