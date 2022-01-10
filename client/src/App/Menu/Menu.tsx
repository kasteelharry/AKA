import React from 'react'
import { Navbar, Container, Nav } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

import './Menu.scss';

function Menu() {
    const { t } = useTranslation();

    return (
        <Container fluid id="navmenu">
            <Navbar expand="sm" sticky="top" bg="light" variant="light">
                <Container fluid>
                    <Navbar.Brand as={Link} to="/">{t('app_title')}</Navbar.Brand>
                    <Nav className="container-fluid">
                        <Nav.Item className="ms-auto">
                            <Nav.Link as={Link} to="/login">{t('nav.login')}</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={Link} to="/register">{t('nav.register')}</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <LanguageSelector />
                </Container>
            </Navbar>
        </Container>
    )
}

export default Menu
