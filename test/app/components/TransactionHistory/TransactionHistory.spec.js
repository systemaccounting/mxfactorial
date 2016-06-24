import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, Simulate, scryRenderedDOMComponentsWithClass
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';

import TransactionHistory from 'components/TransactionHistory/TransactionHistory';

describe('TransactionHistory component', () => {
  let instance;
  const push = spy();

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should navigate to TransactionDetails', () => {
    instance = renderIntoDocument(<TransactionHistory />);
    instance.context.router = { push };

    const historyItems = scryRenderedDOMComponentsWithClass(instance, 'transaction-history__item');
    Simulate.click(historyItems[0]);
    push.should.be.calledWith('/TransactionDetails');
  });
});
