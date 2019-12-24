import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import Amplify from '@aws-amplify/core' // https://github.com/aws-amplify/amplify-js/issues/3484

import Providers from 'providers'

import App from './App'
import './index.css'

Amplify.configure({
  Auth: {
    userPoolId: process.env.REACT_APP_POOL_ID || 'us-east-1_unit-test',
    userPoolWebClientId: process.env.REACT_APP_CLIENT_ID || 'unit-test'
  }
})

ReactDOM.render(
  <Providers>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Providers>,
  document.getElementById('root')
)
