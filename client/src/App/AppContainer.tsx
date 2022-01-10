import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet'

import './AppContainer.scss';
import LoginPage from './Login/LoginPage';
import Menu from './Menu/Menu';
import AppBody from './AppBody/AppBody';

function AppContainer() {
  const { t } = useTranslation();

  return (
    <div className="AppContainer">
      <Helmet>
        <title>{t('app_title')}</title>
      </Helmet>

      {/* React Router configures the Components that need to be rendered when certain paths are requested. */}
        <Router>
          <Menu />
          <Routes>
            <Route path="/login/*" element={<LoginPage />} />
            <Route path="/" element={<AppBody />}/>
          </Routes>
        </Router>
    </div>
  );
}

export default AppContainer;
