import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {HashRouter as Router} from 'react-router-dom';

import AppContainer from './App/AppContainer';

import './index.scss';
import './i18n'

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <AppContainer />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
