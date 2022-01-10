import React from 'react';
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet'

import './AppContainer.scss';
import LoginPage from './Login/LoginPage';
import Menu from './Menu/Menu';
import AppBody from './AppBody/AppBody';
import RegisterPage from './Register/RegisterPage';

function AppContainer() {
  const { t } = useTranslation();

  return (
    <div className="AppContainer">
      <Helmet>
        <title>{t('app_title')}</title>
      </Helmet>

      {/* React Router configures the Components that need to be rendered when certain paths are requested. */}
      <Menu />
      <Routes>
        <Route path="/login/*" element={<LoginPage />} />
        <Route path="/register/*" element={<RegisterPage />} />
        <Route path="/" element={<AppBody />} />
      </Routes>
    </div>
  );
}

export default AppContainer;
