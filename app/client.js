import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';
import { Provider } from 'react-redux';

import getRoutes from './routes';
import configureStore from 'store/configureStore';

import 'components/Layout/base.scss';

const store = configureStore();

ReactDOM.render((
  <Provider store={ store }>
    <Router history={ hashHistory }>
      { getRoutes() }
    </Router>
  </Provider>),
  document.getElementById('app')
);
