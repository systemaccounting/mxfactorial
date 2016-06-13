import {createStore, applyMiddleware} from 'redux';
import createLogger from 'redux-logger';
import promise from 'redux-promise'
import reducers from '../reducers';


export default function configurestore(initialState={}) {
  const logger = createLogger();
  const middleWares = [promise, logger];

  const store = createStore(
    reducers, initialState, applyMiddleware(...middleWares)
  )

  return store;
}
