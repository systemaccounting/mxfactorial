import ApolloClient from 'apollo-boost'
import Auth from '@aws-amplify/auth'

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_API_URL}`,
  fetchOptions: {
    credentials: 'include'
  },
  request: async operation => {
    const session = await Auth.currentSession()
    const token = session.getAccessToken().getJwtToken()
    operation.setContext({
      headers: {
        // Authorization: `Bearer ${token}`
      }
    })
  }
})

export default client
