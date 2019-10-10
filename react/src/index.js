import React from 'react'
import ReactDOM from 'react-dom'
import Amplify from '@aws-amplify/core' // https://github.com/aws-amplify/amplify-js/issues/3484

import App from './App'
import './index.css'

Amplify.configure({
  Auth: {
    userPoolId: process.env.REACT_APP_POOL_ID || 'us-east-1_unit-test',
    userPoolWebClientId: process.env.REACT_APP_CLIENT_ID || 'unit-test'
  }
})

ReactDOM.render(<App />, document.getElementById('root'))
