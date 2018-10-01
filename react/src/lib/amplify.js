import { Auth } from 'aws-amplify'
import { BehaviorSubject } from 'rxjs'

export const singInPerform = new BehaviorSubject(null)

export const currentUserInfo = () => Auth.currentUserInfo()

export const signOut = () =>
  Auth.signOut().then(() => {
    singInPerform.next(null)
  })

export const signIn = ({ account, password }) => {
  return Auth.signIn(account, password).then(async token => {
    if (token) {
      const user = await Auth.currentUserInfo()
      singInPerform.next(user)
    }
  })
}

export const signUp = (credentials, attributes) =>
  Auth.signUp(credentials, attributes)
