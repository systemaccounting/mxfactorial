import createSocketAction from 'actions/socket';

describe('createSocketAction', () => {
  it('should return correct payload and type', () => {
    createSocketAction('socket', 'event')({}).should.eql({
      type: 'socket',
      payload: {
        socket: true,
        event: 'event',
        data: {}
      }
    });
  });
});
