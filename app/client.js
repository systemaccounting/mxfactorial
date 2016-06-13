import React from 'react';
import ReactDOM from 'react-dom';

import {Router, hashHistory} from 'react-router';

import getRoutes from './routes';

/**
 * redux libs
 * @author kishan
 */
import {Provider} from 'react-redux';
import configureStore from './store/configureStore';

// base styles
import './containers/Layout/base.scss';

const store = configureStore();

ReactDOM.render((
    <Provider store={store}>
        <Router history={ hashHistory }>
            { getRoutes() }
        </Router>
    </Provider>),
    document.getElementById('app')
);
