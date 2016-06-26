import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, Simulate, findRenderedDOMComponentWithClass
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';

import TransactionDetails from 'components/TransactionDetails/TransactionDetails';

describe('TransactionDetails component', () => {
  let instance;
  const goBack = spy();

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should navigate to TransactionDetails', () => {
    instance = renderIntoDocument(<TransactionDetails />);
    instance.context.router = { goBack };

    const backBtn = findRenderedDOMComponentWithClass(instance, 'btn__back');
    Simulate.click(backBtn);
    goBack.should.be.calledOnce();
  });
});
