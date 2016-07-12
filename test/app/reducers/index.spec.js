import rootReducer from 'reducers/index';

describe('rootReducer', () => {
  const initialState = {
    form: {},
    accountDetails: {
      account: {
        profile: {},
        auth: {}
      }
    },
    transaction_item: [],
    cr_account: '',
    transactionError: '',
    accountSetting: {
      errorMessage: ''
    },
    auth: {
      user: {},
      token: ''
    },
    notifications: {
      '0': {
        key: '-KLva-nufOkGRCG665P3',
        method: 'webclient',
        payload: 500,
        receiver: 'West',
        sender: 'Kayle',
        sent: '25 seconds ago',
        type: 'bid200'
      }
    },
    requestsFilter: 'active',
    transactions: {}
  };

  it('should return initial state', () => {
    rootReducer(undefined, {}).should.eql(initialState);
  });

  it('should clear data when LOGOUT', () => {
    rootReducer({
      form: {},
      accountDetails: {
        account: {
          profile: {},
          auth: {}
        }
      },
      transaction_item: [{
        cr_account: 'sandy'
      }],
      cr_account: 'sandy',
      transactionError: '',
      accountSetting: {
        errorMessage: ''
      },
      auth: {
        user: {
          account: 'test_user'
        },
        token: 'JWT loremipsum'
      }
    }, {
      type: 'LOGOUT'
    }).should.eql(initialState);
  });
});
