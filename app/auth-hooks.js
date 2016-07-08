import { getAccount, logout } from 'actions/authActions';

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
    done();
  }
};

/* istanbul ignore next */
export const handleLogout = (store) => (nextState, replace) => {
  store.dispatch(logout());
  replace({
    pathname: '/login'
  });
};
