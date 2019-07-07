import React from 'react'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'

import { currentUserInfo, singInPerform } from 'lib/amplify'
import { UserProvider } from 'context/User/UserContext'
import apiClient from './apollo'

export default ({ children }) => (
  <ApolloProvider client={apiClient}>
    <UserProvider
      currentUserInfo={currentUserInfo}
      singInPerform={singInPerform}
    >
      {children}
    </UserProvider>
  </ApolloProvider>
)
