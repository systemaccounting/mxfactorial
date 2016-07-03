import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';

import reducers from 'reducers/index';
import configuredAxiosMiddleware from 'middlewares/configured-axios-middleware';

export default function configurestore(initialState={}, withoutMiddleware=false) {
  const logger = createLogger();
  const middleWares = withoutMiddleware ? [] : [logger, configuredAxiosMiddleware];

  const store = createStore(
    reducers, initialState, applyMiddleware(...middleWares)
  );

  return store;
}
