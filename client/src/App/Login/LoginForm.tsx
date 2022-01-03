import React from 'react'
import { useTranslation } from 'react-i18next'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'


function Login() {
    const { t } = useTranslation();

    return (
        <div>
            <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>{t('login.email.title')}</Form.Label>
                    <Form.Control type="email" placeholder={t('login.email.placeholder')}/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>{t('login.password.title')}</Form.Label>
                    <Form.Control type="password" placeholder={t('login.password.placeholder')}/>
                </Form.Group>
                <Button variant="primary" type="submit">
                    {t('login.submit')}
                </Button>
            </Form>
        </div>
    )
}

export default Login;