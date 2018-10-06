import React from 'react'

import { currentUserInfo, singInPerform } from 'lib/amplify'
import { UserProvider } from 'context/User/UserContext'

export default ({ children }) => (
  <UserProvider currentUserInfo={currentUserInfo} singInPerform={singInPerform}>
    {children}
  </UserProvider>
)
