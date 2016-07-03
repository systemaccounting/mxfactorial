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
      }
    });
  });

});
