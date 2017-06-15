import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class MobileLayout extends Component {
  render() {
    return (
      <div className='container' style={ { width: 300 } }>
        <div style={ { marginTop: 20, marginBottom: 20 } }>
          { this.props.children[0] }
        </div>
        <div>
          { this.props.children[1] }
        </div>
      </div>
     );
  }
}

MobileLayout.propTypes = {
  children: PropTypes.node
};
