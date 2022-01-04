import React from 'react';
import { useTranslation } from 'react-i18next';
import LoginForm from './LoginForm';
import Container from 'react-bootstrap/Container';

function LoginPage() {
    const { t } = useTranslation();

    return (
        <Container className="p-5">
            <div className="text-center">
                <h4 className="text-dark mb-4">{t('login.title')}</h4>
            </div>
            <LoginForm />

            {/* TODO replace a with Link */}
        </Container>
                )
}

                export default LoginPage
