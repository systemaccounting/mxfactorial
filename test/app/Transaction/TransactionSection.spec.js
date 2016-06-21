import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import { renderIntoDocument, scryRenderedComponentsWithType } from 'react-addons-test-utils';
import { spy } from 'sinon';

import TransactionSection from 'components/Transaction/TransactionSection';
import TransactionDetail from 'components/Transaction/TransactionDetail';

describe('TransactionSection component', () => {
  let instance;

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should renderable', () => {
    const addTransaction = spy();
    const removeTransaction = spy();
    const updateTransaction = spy();
    const props = { addTransaction, removeTransaction, updateTransaction };


    instance = renderIntoDocument(<TransactionSection { ...props }/>);
    scryRenderedComponentsWithType(instance, TransactionDetail).length.should.equal(1);
  });
});
