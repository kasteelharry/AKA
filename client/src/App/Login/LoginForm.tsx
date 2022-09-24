import React, { useState, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';
// import Button from 'react-bootstrap/Button';
import { Link, useNavigate } from 'react-router-dom';
import makePostRequest from '../../utils/PostRequests';
import { Button } from '@mui/material';

/**
 * This component contains the login form. It handles the form validation 
 * and it handles the confirmation with the back-end.
 * @param props props passed by the parent component
 * @returns renders the login form.
 */
function LoginForm(props: any) {
    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    /**
     * Validates the input form for the login. If there is valid input, the button will be enabled.
     * @returns true if the form has a valid input.
     */
    function validateForm(): boolean {
        return email.length > 0 && password.length > 0;
    }

    /**
     * Handles the submit action. Performs a POST request and handles the return from the server.
     * If the user is authorized to access the back-end the front-end will navigate the user to
     * the next page. Usually this will be the customer selection screen but if there is no active
     * event, the routing will show an event creation screen.
     * @param event the event trigger that is activated when the form is submitted.
     */
    function handleSubmit(event: SyntheticEvent): void {
        event.preventDefault();

        makePostRequest('/api/login', { email, password }).then(result => {
            props.setLogin(true);
            localStorage.setItem('loggedIn', 'true');
            navigate('/transaction');
            setEmail(email)
            setPassword(password)
        }).catch(err => {
            console.log(err)
            setEmail(email)
            setPassword(password)
        })

    }

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>{t('login.email.title')}</Form.Label>
                    <Form.Control type="email" placeholder={t('login.email.placeholder')} autoFocus onChange={
                        (e: { target: { value: React.SetStateAction<string>; }; }) => setEmail(e.target.value)
                    } />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>{t('login.password.title')}</Form.Label>
                    <Form.Control type="password" placeholder={t('login.password.placeholder')} onChange={
                        (e: { target: { value: React.SetStateAction<string>; }; }) => setPassword(e.target.value)
                    } />
                    <Link className="small" to="/login/forgotten">{t('login.forgot_password')}</Link>
                </Form.Group>
                <Button variant='contained' size="large"  type="submit" disabled={!validateForm()}>
                {t('login.submit')}
                </Button>
            </Form>
        </div>
    )
}

export default LoginForm;