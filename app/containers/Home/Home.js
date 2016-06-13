import React from 'react';
import { Link } from 'react-router';

import Header from '../../components/Header/header';

import Plus from '../../../static/images/plus.png';

import './Home.scss';

export default class HomePage extends React.Component {
  render() {
    return (
      <div className="home-page">
        <Header className="font18"/>
        <div className="container" style={{width: 300}}>
          <div className="input-group">
           <div className="indicator radius5">
              <div className="pull-left">
                Sandy<br />
                   balance
              </div>
              <div className="pull-right font22">
                  1,000.000
              </div>
           </div>
           <div className="input radius5 font22">
              <input type="text"/>
           </div>
           <div className="indicator radius5 font22 text-right">
              <div>
                0.000
              </div>
           </div>
          </div>
          <div>
            <div className="indicator radius5 font22">
                <img src={Plus} className="plusIcon" />  good or service
            </div>
          </div>
        </div>
      </div>
    );
  }
}