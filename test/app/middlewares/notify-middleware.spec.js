import { spy, stub } from 'sinon';
import 'should-sinon';

import notifyMiddleware from 'middlewares/notify-middleware';
import createSocketAction from 'actions/socket';
import notifyHub from 'socket/notify';

describe('notifyMiddleware', () => {
  const store = {};
  const type = 'type';
  const event = 'event';
  const data = 'data';
  const next = spy();
  const emitStub = stub(notifyHub, 'emit');

  it('should handle socket action', () => {
    notifyMiddleware(store)(next)(createSocketAction(type, event)(data));
    emitStub.should.be.calledWith(event, data);
  });

  it('should not handle none socket action', () => {
    const nonSocketAction = {
      type: 'normal',
      payload: undefined
    };
    notifyMiddleware(store)(next)(nonSocketAction);
    next.should.be.calledWith(nonSocketAction);
  });
});
