import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

import reducers from 'reducers/index';
import configuredAxiosMiddleware from 'middlewares/configured-axios-middleware';
import notifyMiddleware from 'middlewares/notify-middleware';

export default function configurestore(initialState={}, withoutMiddleware=false) {
  const logger = createLogger();
  const middleWares = withoutMiddleware ? [] : [thunk, logger, configuredAxiosMiddleware, notifyMiddleware];

  const store = createStore(
    reducers, initialState, applyMiddleware(...middleWares)
  );

  return store;
}
