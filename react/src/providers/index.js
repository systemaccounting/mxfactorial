import React from 'react'
import ApolloClient from 'apollo-boost'
import { Provider } from 'react-redux'
import { ApolloProvider } from 'react-apollo'

import { currentUserInfo, singInPerform } from 'lib/amplify'
import { UserProvider } from 'context/User/UserContext'

import createStore from 'redux/create'

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_API_URL}`
})

const store = createStore()

export default ({ children }) => (
  <ApolloProvider client={client}>
    <Provider store={store}>
      <UserProvider
        currentUserInfo={currentUserInfo}
        singInPerform={singInPerform}
      >
        {children}
      </UserProvider>
    </Provider>
  </ApolloProvider>
)
