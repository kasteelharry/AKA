import { useTranslation } from 'react-i18next';
import LoginForm from './LoginForm';
import Container from 'react-bootstrap/Container';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function LoginPage(props: any) {
    const { t } = useTranslation();

    // State to control the amount of time that the front-end tries to obtain the session
    // token from the back-end.
    const [gotCookie, setCookie] = useState(false);
    useEffect(() => {
        if (gotCookie) {
            return;
        }
        setCookie(true);
        fetch('http://localhost:8080/', {credentials:'include'}).then(res => res.json()).catch(err => console.log(err));
    }, [gotCookie, setCookie]);

    if (props.loggedIn) {
        console.log('Logged in');

        return (
            <Link to='/selection'></Link>
        );
    }

    return (
        <Container className="p-5">
            <div className="text-center">
                <h4 className="text-dark mb-4">{t('login.title')}</h4>
            </div>
            <LoginForm setLogin={props.setLoggedIn} />

            {/* TODO replace a with Link */}
        </Container>
    )
}

export default LoginPage
