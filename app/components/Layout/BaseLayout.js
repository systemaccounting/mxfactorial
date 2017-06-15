import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class BaseLayout extends Component {
  render() {
    return (
      <div id='mobileLayout' className='fullBg padding14 fontGray boldFont'>
        { this.props.children }
      </div>
    );
  }
}

BaseLayout.propTypes = {
  children: PropTypes.node
};
