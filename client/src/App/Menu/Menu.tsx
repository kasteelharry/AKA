import React from 'react'
import { Navbar, Container } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import LanguageSelector from './LanguageSelector';

import './Menu.scss';

function Menu() {
    const { t } = useTranslation();

    return (
        <Container fluid id="navmenu">
            <Navbar expand="sm" sticky="top" bg="light" variant="light">
                <Container fluid>
                    <Navbar.Brand as={Link} to="/">{t('app_title')}</Navbar.Brand>
                    <Link to='/login'>
                        <Button disabled={false} type={'button'} className={''} text={t('nav.login')} size={'normal'} variant={'primary'}/>
                    </Link>
                    <Link to='/register'>
                        <Button disabled={false} type={'button'} className={''} text={t('nav.register')} size={'normal'} variant={'secondary'}/>
                    </Link>
                    <LanguageSelector />
                </Container>
            </Navbar>
        </Container>
    )
}

export default Menu
