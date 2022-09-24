import { useEffect, useRef, useState } from 'react';
import {  Routes, Route, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet'

import './AppContainer.scss';
import LoginPage from './Login/LoginPage';
import MenuBar from './Menu/MenuBar';
import AppBody from './AppBody/AppBody';
import RegisterPage from './Register/RegisterPage';
import TransactionPage from './Transaction/TransactionPage';
import { Navigate } from 'react-router-dom';
import SelectionScreen from './SelectionScreen/SelectionScreen';
import { ThemeProvider } from '@mui/material/styles';
import { AsterionTheme } from '../theme/AsterionTheme.d';
import EventScreen from './EventScreen/EventScreen';

const localStorageWhiteList = ['loggedIn', 'activeEvent'];

function AppContainer() {
    const { t } = useTranslation();

    // Set the logged in state. Although this is also kept track of on the server side,
    // some extra checks cannot hurt.
    const [loggedIn, setLoggedIn] = useState<boolean>(false);

    const [activeEvent, setActiveEvent] = useState<number>(-1)

    // Set the flag for the event that this is the first render. Then we do not want to
    // run the use effect trigger.
    const firstUpdate = useRef(true);

    /**
     * If the logged in status is changed to false, then log the user out on the server.
     */
    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = true;
        } else {
            if (!loggedIn) {
                fetch('/logout', { credentials: 'include' })
                    .then(response => response.json())
                    .then(data => console.log(data));
            }
        }

    }, [loggedIn]);

    useEffect(() => {
        console.log("Current active event is: ", activeEvent);
        clearHistory();
        const savedEvent= localStorage.getItem('activeEvent');
        if (savedEvent !== null && !isNaN(parseInt(savedEvent))) {
            setActiveEvent(parseInt(savedEvent))
            localStorage.setItem('activeEvent', savedEvent.toString())
        } else if (activeEvent !== -1) {
            localStorage.setItem('activeEvent', activeEvent.toString());
        }
    }, [activeEvent])

    /**
     * This function calls the login hook and sets its state.
     * @param status the new login status
     */
    function setLoginHook(status: boolean) {
        setLoggedIn(status);
    }

    /**
     * Checks if the user is logged in, if not it forces the user to log in.
     * @param param0 The children components.
     * @returns Either the child component or it navigates the user to the login page.
     */
    const PrivateRoute = ({ children }: any) => {
        return loggedIn || localStorage.getItem('loggedIn') === 'true' ? children : <Navigate to="/login" />;
    }

    /**
     * Ensures that the user is logged out. This is a JSX component
     * such that it can be called from the element in the router.
     * @returns The user to the login page.
     */
    const SetLogout = () => {
        setLoginHook(false);
        fetch('/logout', { credentials: 'include' })
            .then(response => response.json())
            .then(data => console.log(data));
        localStorage.setItem('loggedIn', 'false');
        return <Navigate to='/login' />;
    }

    return (
        <ThemeProvider theme={AsterionTheme}>
            <div className="AppContainer">
                <Helmet>
                    <title>{t('app_title')}</title>
                </Helmet>

                {/* React Router configures the Components that need to be rendered when certain paths are requested. */}
                <MenuBar logout={setLoggedIn} />
                <Routes>
                    <Route path="/login/*" element={loggedIn ? <Navigate to='/selection' /> : <LoginPage loggedIn={loggedIn} setLoggedIn={setLoginHook} />
                    } />
                    <Route path='/logout/*' element={<SetLogout />} />
                    <Route path="/register/*" element={<RegisterPage />} />
                    <Route path="/" element={<AppBody />} />
                    <Route path='/transaction/:customerID' element={
                        <PrivateRoute>
                            <TransactionPage activeEvent={activeEvent} />
                        </PrivateRoute>} />
                    {/* <Route path='/selection/*' element={<SelectionScreen/>}/> */}
                    {
                    activeEvent !== -1 && !isNaN(activeEvent) &&
                        <Route
                        path='/selection/*'
                        element={
                            <PrivateRoute>
                                <SelectionScreen
                                activeEvent={activeEvent}
                                // manyActiveEvents={manyActiveEvents}
                                // setActiveEvent={setActiveEvent}
                                />
                            </PrivateRoute>

                        } />
                    }
                    {
                    (activeEvent === -1 || isNaN(activeEvent)) &&
                    <Route path='/selection/*' element={
                        <PrivateRoute>
                            <EventScreen activeEvent={activeEvent} setActiveEvent={setActiveEvent}/>
                        </PrivateRoute>} />
                    }
                    <Route path='/event' element={
                        <EventScreen activeEvent={activeEvent} setActiveEvent={setActiveEvent}/>
                    }/>
                    
                </Routes>
            </div>
        </ThemeProvider >

    );
}
/**
 * Ensures that the user is logged out.
 * @returns The user to the login page.
 */
export const SetLogout = () => {
    const navigate = useNavigate();
    localStorage.clear();
    fetch('/logout', { credentials: 'include' })
        .then(response => response.json())
        .then(data => console.log(data));

    return navigate('/login');
}

export const clearHistory = () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (!localStorageWhiteList.includes(key)) {
            localStorage.removeItem(key);
        }
    })
}

export default AppContainer;
