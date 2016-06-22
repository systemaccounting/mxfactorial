import React, { Component } from 'react';
import mxfactorial from 'images/mxfactorial.png';

export default class Logo extends Component {
  render() {
    return (
      <div className='logo'>
        <img src={ mxfactorial } className='center-block' />
      </div>
    );
  }
}
