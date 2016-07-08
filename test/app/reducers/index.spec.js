import rootReducer from 'reducers/index';

describe('rootReducer', () => {

  it('should return initial state', () => {
    rootReducer(undefined, {}).should.eql({
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
      }
    });
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
    }).should.eql({
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
      }
    });
  });
});
