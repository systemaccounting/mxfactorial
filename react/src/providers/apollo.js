import ApolloClient from 'apollo-boost'
import Auth from '@aws-amplify/auth'

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_API_URL}`,
  fetchOptions: {
    credentials: 'include'
  },
  request: async operation => {
    const { accessToken } = await Auth.currentSession()
    operation.setContext({
      headers: {
        authorization: accessToken.jwtToken
      }
    })
  }
})

export default client
