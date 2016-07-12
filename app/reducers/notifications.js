import { handleActions } from 'redux-actions';

import { CLEAR_ALL_NOTIFICATIONS } from 'actions/notificationActions';

export default handleActions({
  [CLEAR_ALL_NOTIFICATIONS]: (state, action) => ({})
}, {
  '0': {
    key: '-KLva-nufOkGRCG665P3',
    sender: 'Kayle',
    receiver: 'West',
    type: 'bid200',
    method: 'webclient',
    payload: 500,
    sent: '25 seconds ago'
  }
});
