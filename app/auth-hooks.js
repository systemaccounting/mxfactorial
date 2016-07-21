import { getAccount, logout } from 'actions/authActions';
import notifyHub, { authenticate, isConnected } from 'socket/notify';

/* istanbul ignore next */
export const requireAuth = (store) => (nextState, replace, done) => {
  if (!store.getState().auth.user.account) {
    if (store.getState().auth.token) {
      store.dispatch(getAccount()).then((action) => {

        if (action.error) {
          replace({
            pathname: '/login',
            state: { nextPathname: nextState.location.pathname }
          });
        } else {
          authenticate(store.getState().auth.token);
        }

        done();
      });
    } else {
      replace({
        pathname: '/login',
        state: { nextPathname: nextState.location.pathname }
      });
      done();
    }
  } else {
    authenticate(store.getState().auth.token);
    done();
  }
};

/* istanbul ignore next */
export const handleLogout = (store) => (nextState, replace) => {
  store.dispatch(logout());
  if (isConnected()) {
    notifyHub.disconnect();
  }
  replace({
    pathname: '/login'
  });
};
