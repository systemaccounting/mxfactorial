import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, Link, hashHistory} from 'react-router';
import LandingPage from './pages/LandingPage';
import CreateAccount01 from './pages/CreateAccount01';
import CreateAccount02 from './pages/CreateAccount02';
import CreateAccount03 from './pages/CreateAccount03';
import CreateAccount04 from './pages/CreateAccount04';
import CreateAccount05 from './pages/CreateAccount05';
import CreateAccount06 from './pages/CreateAccount06';
import CreateAccount07 from './pages/CreateAccount07';
import CreateAccount08 from './pages/CreateAccount08';
import CreateAccount09 from './pages/CreateAccount09';
import CreateAccount10 from './pages/CreateAccount10';

/**
 * redux libs
 * @author kishan
 */
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import promise from 'redux-promise'
import reducers from './reducers';
import createLogger from 'redux-logger';
const logger                    = createLogger();
const createStoreWithMiddleware = applyMiddleware(
    promise,
    logger
)(createStore);

class AppRoutes extends React.Component {
    render() {
        return (
            <Provider store={createStoreWithMiddleware(reducers)}>
                <Router history={ hashHistory }>
                    <Route path="/" component={LandingPage}></Route>
                    <Route path="/CreateAccount01" component={CreateAccount01}></Route>
                    <Route path="/CreateAccount02" component={CreateAccount02}></Route>
                    <Route path="/CreateAccount03" component={CreateAccount03}></Route>
                    <Route path="/CreateAccount04" component={CreateAccount04}></Route>
                    <Route path="/CreateAccount05" component={CreateAccount05}></Route>
                    <Route path="/CreateAccount06" component={CreateAccount06}></Route>
                    <Route path="/CreateAccount07" component={CreateAccount07}></Route>
                    <Route path="/CreateAccount08" component={CreateAccount08}></Route>
                    <Route path="/CreateAccount09" component={CreateAccount09}></Route>
                    <Route path="/CreateAccount10" component={CreateAccount10}></Route>
                </Router>
            </Provider>
        );
    }
}

ReactDOM.render(<AppRoutes />, document.getElementById('app'));