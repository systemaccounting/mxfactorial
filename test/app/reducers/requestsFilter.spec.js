import { SET_REQUESTS_FILTER } from 'actions/requestActions';
import requestsFilter from 'reducers/requestsFilter';

describe('requestsFilter reducer', () => {
  it('should handle SET_REQUESTS_FILTER', () => {
    requestsFilter(undefined, {
      type: SET_REQUESTS_FILTER,
      payload: 'rejected'
    }).should.eql('rejected');
  });
});
