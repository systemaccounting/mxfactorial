import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, findRenderedDOMComponentWithTag, Simulate
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';

import TransactionDetail from 'components/Transaction/TransactionDetail';

describe('TransactionDetail component', () => {
  let instance;
  const props = {
    updateCRAccount: spy(),
    transactionAmount: 0
  };

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should handle updateCRAccount', () => {
    instance = renderIntoDocument(<TransactionDetail { ...props }/>);
    const crAccountInput = findRenderedDOMComponentWithTag(instance, 'input');
    crAccountInput.value = 'new_value';
    Simulate.change(crAccountInput);
    props.updateCRAccount.should.be.calledWith(crAccountInput.value);
  });
});
