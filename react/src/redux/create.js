import { applyMiddleware, createStore } from 'redux'
import rootReducer from './modules/reducer'

export default function configureStore(initialState = {}) {
  const middleware = []
  const enhancer = applyMiddleware(...middleware)
  return createStore(rootReducer, initialState, enhancer)
}
