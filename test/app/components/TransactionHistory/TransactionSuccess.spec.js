import React from 'react';
import { spy } from 'sinon';
import 'should-sinon';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, findRenderedDOMComponentWithClass, Simulate
} from 'react-addons-test-utils';

import TransactionSuccess from 'components/TransactionHistory/TransactionSuccess';

describe('TransactionSuccess component', () => {
  let instance;
  const props = {
    clearTransaction: spy()
  };

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should handle Ok and New', () => {
    instance = renderIntoDocument(<TransactionSuccess { ...props }/>);
    const push = spy();
    instance.context.router = { push };

    const btnNew = findRenderedDOMComponentWithClass(instance, 'btn__new');
    Simulate.click(btnNew);
    props.clearTransaction.should.be.calledOnce();
    push.should.be.calledWith('/home');

    const btnOk = findRenderedDOMComponentWithClass(instance, 'btn__ok');
    Simulate.click(btnOk);
    props.clearTransaction.should.be.calledTwice();
    push.should.be.calledWith('/TransactionHistory');
  });
});
