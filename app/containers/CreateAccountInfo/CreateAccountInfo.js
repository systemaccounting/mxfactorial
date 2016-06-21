import React from 'react';

import { connect } from 'react-redux';

import MobileLayout from '../Layout/MobileLayout';

import {
  CreateAccountNav,
  CreateAccount01Body,
  CreateAccount02Body,
  CreateAccount03Body,
  CreateAccount10Body
} from '../../components';

/*
* Base component for the info pages displayed when
* creating an account. it renders the info pages based
* on the current id of the `/CreateAccountInfo/:id` route
*
* Note: This approach is not scalable, so will still be refactored.
*/
class CreateAccounInfo extends React.Component {

  componentTemplate(routerstep, component) {
    return (
      <MobileLayout>
        <CreateAccountNav routerstep={routerstep} />
        { component }
      </MobileLayout>
    );
  }

  renderComponent(param) {
    switch(param) {
      case '1':
        return this.componentTemplate("/",
          <CreateAccount01Body nextRoute="/CreateAccountInfo/2"/>);
      case '2':
        return this.componentTemplate("/CreateAccountInfo/1",
          <CreateAccount02Body nextRoute="/CreateAccountInfo/3" />);
      case '3':
        return this.componentTemplate("/CreateAccountInfo/2",
          <CreateAccount03Body nextRoute="/CreateAccount/1" />);
      case '4':
        return this.componentTemplate("/CreateAccount/6",
          <CreateAccount10Body {...this.props} />);
      default:
        return this.componentTemplate("/",
          <CreateAccount01Body nextRoute="/CreateAccountInfo/2" />);
    }
  }

  render() {
    return (
      this.renderComponent(this.props.params.id)
    );
  }
}

export default connect()(CreateAccounInfo);
