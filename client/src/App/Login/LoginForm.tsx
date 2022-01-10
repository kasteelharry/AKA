import React, { useState, SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { Link } from 'react-router-dom';


function LoginForm() {
    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    function validateForm(): boolean {
        return email.length > 0 && password.length > 0;
    }

    function handleSubmit(event: SyntheticEvent): void {
        event.preventDefault();
        
        const req = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: email, password: password})
        };

        fetch('/login', req)
            .then(resp => resp.json())
            .then(
                (data) => {
                setEmail(data.email);
                setPassword(data.password);
            }, 
            (err) => {console.log(err)})
    }

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>{t('login.email.title')}</Form.Label>
                    <Form.Control type="email" placeholder={t('login.email.placeholder')} autoFocus onChange={
                        (e) => setEmail(e.target.value)
                    }/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>{t('login.password.title')}</Form.Label>
                    <Form.Control type="password" placeholder={t('login.password.placeholder')} onChange={
                        (e) => setPassword(e.target.value)
                    }/>
                    <Link className="small" to="/login/forgotten">{t('login.forgot_password')}</Link>
                </Form.Group>
                <Button variant="primary" type="submit" disabled={!validateForm()}>
                    {t('login.submit')}
                </Button>
            </Form>
        </div>
    )
}

export default LoginForm;