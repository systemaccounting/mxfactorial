import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import cookie from 'react-cookie';

import getRoutes from './routes';
import configureStore from 'store/configureStore';
import { receivedToken } from 'actions/authActions';

import 'components/Layout/base.scss';

const store = configureStore();

const token = cookie.load('token');
if (token) {
  store.dispatch(receivedToken(token));
}

ReactDOM.render((
  <Provider store={ store }>
    <Router history={ hashHistory }>
      { getRoutes(store) }
    </Router>
  </Provider>),
  document.getElementById('app')
);
