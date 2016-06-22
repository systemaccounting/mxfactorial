import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'store/configureStore';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, scryRenderedDOMComponentsWithClass, scryRenderedComponentsWithType
} from 'react-addons-test-utils';

import CreateAccountInfo from 'components/CreateAccountInfo/CreateAccountInfo';
import MobileLayout from 'components/Layout/MobileLayout';
import CreateAccountNav from 'components/CreateAccountNav/CreateAccountNav';
import { CreateAccount10Body } from 'components/CreateAccountInfoBody';


describe('CreateAccountInfo component', () => {
  let instance;
  const params = { id: '0' };
  const store = configureStore();

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should render body correct', () => {
    instance = renderIntoDocument(<CreateAccountInfo params={ params }/>);
    scryRenderedComponentsWithType(instance, MobileLayout).length.should.equal(1);
    scryRenderedComponentsWithType(instance, CreateAccountNav).length.should.equal(1);
    scryRenderedDOMComponentsWithClass(instance, 'createAccount01Body').length.should.equal(1);
  });

  it('should render CreateAccount01Body when id equal 1', () => {
    params.id = '1';
    instance = renderIntoDocument(<CreateAccountInfo params={ params }/>);
    scryRenderedDOMComponentsWithClass(instance, 'createAccount01Body').length.should.equal(1);
  });

  it('should render CreateAccount02Body when id equal 2', () => {
    params.id = '2';
    instance = renderIntoDocument(<CreateAccountInfo params={ params }/>);
    scryRenderedDOMComponentsWithClass(instance, 'createAccount02Body').length.should.equal(1);
  });

  it('should render CreateAccount03Body when id equal 3', () => {
    params.id = '3';
    instance = renderIntoDocument(<CreateAccountInfo params={ params }/>);
    scryRenderedDOMComponentsWithClass(instance, 'createAccountBody03').length.should.equal(1);
  });

  it('should render CreateAccount10Body when id equal 4', () => {
    params.id = '4';
    instance = renderIntoDocument(
      <Provider store={ store }>
        <CreateAccountInfo params={ params }/>
      </Provider>
    );
    scryRenderedComponentsWithType(instance, CreateAccount10Body).length.should.equal(1);
  });
});
