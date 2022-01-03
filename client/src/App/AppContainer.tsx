import React from 'react';
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet'

import './AppContainer.scss';
import LoginPage from './Login/LoginPage';

function AppContainer() {
  const { t } = useTranslation();

  return (
    <div className="AppContainer">
      <Helmet>
        <title>{t('app_title')}</title>
      </Helmet>
      <LoginPage />
    </div>
  );
}

export default AppContainer;
