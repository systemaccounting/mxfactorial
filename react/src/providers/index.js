import React from 'react'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'

import { currentUserInfo, singInPerform } from 'lib/amplify'
import { UserProvider } from 'context/User/UserContext'

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_API_URL}`
})

export default ({ children }) => (
  <ApolloProvider client={client}>
    <UserProvider
      currentUserInfo={currentUserInfo}
      singInPerform={singInPerform}
    >
      {children}
    </UserProvider>
  </ApolloProvider>
)
