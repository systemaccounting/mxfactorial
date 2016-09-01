import React from 'react';
import { spy } from 'sinon';
import 'should-sinon';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import { Simulate, renderIntoDocument, findRenderedDOMComponentWithClass } from 'react-addons-test-utils';

import TransactBtn from 'components/Transaction/TransactBtn';


describe('TransactBtn component', () => {
  let instance;
  const handleTransact = spy();

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('click on btn__transact should handleTransact', () => {
    instance = renderIntoDocument(<TransactBtn handleTransact={ handleTransact } disabled={ false }/>);
    const btnTransact = findRenderedDOMComponentWithClass (instance, 'btn__transact');
    Simulate.click(btnTransact);
    handleTransact.should.be.calledOnce();
  });

});
