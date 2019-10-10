import ApolloClient from 'apollo-boost'
import Auth from '@aws-amplify/auth'

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_GRAPHQL_API}`,
  fetchOptions: {
    credentials: 'include'
  },
  request: async operation => {
    const session = await Auth.currentSession()
    const token = session.getIdToken().getJwtToken()
    operation.setContext({
      headers: {
        Authorization: token
      }
    })
  }
})

export default client
